from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import EmailStr
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from models import User, UserType


# Configura passlib para usar el algoritmo bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Configurar el esquema OAuth2 para la autenticación con tokens
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si la contraseña en texto plano coincide con el hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Genera un hash de la contraseña proporcionada."""
    return pwd_context.hash(password)


def create_access_token(
    subject: str,
    user_id: int,
    user_type: UserType,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Crea un token de acceso JWT.

    Args:
        subject: El identificador del usuario
        user_id: El ID del usuario en la base de datos
        user_type: El tipo de usuario (CLIENT, FREELANCER, ADMIN)
        expires_delta: Tiempo de expiración del token

    Returns:
        str: Token JWT codificado
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "user_id": user_id,
        "user_type": user_type.value,
        "iat": datetime.now(timezone.utc),
        "type": "access"
    }
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(
    subject: str,
    user_id: int,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Crea un token de actualización JWT.
    
    Args:
        subject: El identificador del usuario (email)
        user_id: El ID del usuario en la base de datos
        expires_delta: Tiempo de expiración del token
        
    Returns:
        str: Token JWT de actualización codificado
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "user_id": user_id,
        "iat": datetime.now(timezone.utc),
        "type": "refresh"
    }
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def get_user_by_email(db: Session, email: EmailStr) -> Optional[User]:
    """Obtiene un usuario por su email."""
    return db.query(User).filter(User.email == email).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Obtiene un usuario por su nombre de usuario."""
    return db.query(User).filter(User.username == username).first()


def authenticate_user(
    db: Session,
    username: Optional[str] = None,
    email: Optional[EmailStr] = None,
    password: str = None
) -> Optional[User]:
    """
    Autentica a un usuario con su email/username y contraseña.

    Args:
        db: Sesión de base de datos
        username: Nombre de usuario (opcional)
        email: Email del usuario (opcional)
        password: Contraseña en texto plano

    Returns:
        User: El usuario autenticado o None si falla
    """
    # Verificar que se proporcione al menos un identificador
    if not (username or email):
        return None
    
    # Buscar al usuario por email o username
    if email:
        user = get_user_by_email(db, email)
    else:
        user = get_user_by_username(db, username)
    
    # Verificar si el usuario existe y la contraseña es correcta
    if not user or not verify_password(password, user.hashed_password):
        return None
    
    return user


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Obtiene el usuario actual a partir del token JWT.

    Args:
        token: Token JWT
        db: Sesión de base de datos

    Returns:
        User: El usuario autenticado

    Raises:
        HTTPException: Si el token no es válido o el usuario no existe
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decodificar el token
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        # Verificar que el token sea de acceso
        if payload.get("type") != "access":
            raise credentials_exception
            
        # Obtener el ID de usuario del token
        user_id = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # Buscar al usuario en la base de datos
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
        
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Verifica que el usuario esté activo.

    Args:
        current_user: Usuario actual obtenido del token

    Returns:
        User: El usuario si está activo

    Raises:
        HTTPException: Si el usuario está inactivo
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )
    return current_user


def get_current_active_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Verifica que el usuario sea un administrador.

    Args:
        current_user: Usuario actual obtenido del token

    Returns:
        User: El usuario si es administrador

    Raises:
        HTTPException: Si el usuario no es administrador
    """
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permisos insuficientes"
        )
    return current_user

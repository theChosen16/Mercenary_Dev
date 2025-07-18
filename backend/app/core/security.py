"""
Utilidades de seguridad como autenticación y generación de tokens JWT.
"""
from datetime import datetime, timedelta
from typing import Any, Optional, TypeVar, Union

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import EmailStr
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.password_utils import verify_password, get_password_hash
from app.db.session import get_db

try:
    from app.models.user import User  # Avoid circular import
except ImportError:
    User = TypeVar('User')  # Type stub for when User is not available

# Esquema OAuth2 para manejar tokens de autenticación
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


def create_access_token(
    subject: Union[str, Any],
    user_id: int,
    user_role: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Crear un token de acceso JWT.
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "user_id": user_id,
        "user_role": user_role,
        "token_type": "access",
    }
    
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(
    subject: Union[str, Any],
    user_id: int,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Crear un token de actualización JWT.
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "user_id": user_id,
        "token_type": "refresh",
    }
    
    encoded_jwt = jwt.encode(
        to_encode, settings.REFRESH_SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


# Password functions moved to password_utils.py to avoid circular imports


def get_user_by_email(db: Session, email: EmailStr) -> Optional[Any]:
    """
    Obtener un usuario por su correo electrónico.
    """
    from app.models.user import User  # Import here to avoid circular imports
    return db.query(User).filter(User.email == email).first()


def authenticate_user(
    db: Session, email: EmailStr, password: str
) -> Optional[Any]:
    """
    Autenticar un usuario con correo electrónico y contraseña.
    """
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """
    Obtener el usuario actual a partir del token JWT.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decodificar el token JWT
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        # Obtener el ID de usuario del token
        user_id = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # Obtener el usuario de la base de datos
    from app.models.user import User
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
        
    return user

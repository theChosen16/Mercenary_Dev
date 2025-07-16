"""
Utilidades de seguridad como autenticación y generación de tokens JWT.
"""
from datetime import datetime, timedelta
from typing import Any, Optional, Union

from jose import jwt
from passlib.context import CryptContext
from pydantic import EmailStr
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verificar una contraseña contra un hash.
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Obtener el hash de una contraseña.
    """
    return pwd_context.hash(password)


def get_user_by_email(db: Session, email: EmailStr) -> Optional[User]:
    """
    Obtener un usuario por su correo electrónico.
    """
    return db.query(User).filter(User.email == email).first()


def authenticate_user(
    db: Session, email: EmailStr, password: str
) -> Optional[User]:
    """
    Autenticar un usuario con correo electrónico y contraseña.
    """
    user = get_user_by_email(db, email=email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

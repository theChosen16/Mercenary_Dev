"""
Dependencias comunes para los endpoints de la API.
"""
from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.user import User

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login/access-token"
)


def get_db() -> Generator:
    """
    Obtener una sesión de base de datos.
    """
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> User:
    """
    Obtener el usuario actual a partir del token JWT.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (jwt.JWTError, ValidationError) as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No se pudo validar el token",
        ) from e
    
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Verificar que el usuario actual está activo.
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Usuario inactivo")
    return current_user


def get_current_superuser(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Verificar que el usuario actual es superusuario.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=400, detail="El usuario no tiene suficientes privilegios"
        )
    return current_user

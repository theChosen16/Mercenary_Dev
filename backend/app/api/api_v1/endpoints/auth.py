"""Endpoints para autenticación de usuarios."""
import logging
from datetime import datetime, timedelta
from typing import Any

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError
from pydantic import ValidationError
from sqlalchemy.orm import Session  # noqa: F401

from app.core import security
from app.core.config import settings
from app.crud import user as user_crud
from app.db.session import get_db
from app.models.user import User
from app.schemas.token import RefreshTokenRequest, Token, TokenPayload
from app.schemas.user import User as UserSchema
from app.schemas.user import UserCreate

# Configurar logger
logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/register",
    response_model=UserSchema,
    status_code=status.HTTP_201_CREATED
)
def register_user(
    user_in: UserCreate,
    db: Session = Depends(get_db)
) -> Any:
    """Registrar un nuevo usuario.

    Args:
        user_in: Datos del usuario a registrar
        db: Sesión de base de datos

    Returns:
        User: El usuario creado

    Raises:
        HTTPException: Si el correo ya está registrado o hay un error
    """
    logger.info("Attempting to register user: %s", user_in.email)

    # The database schema should have unique constraints on email and username.
    # We can leverage this to simplify the code and avoid race conditions
    # by catching the IntegrityError from the database.
    try:
        user = user_crud.create(db, obj_in=user_in)
        logger.info("User '%s' registered successfully with ID: %s", user.email, user.id)
        return user
    except IntegrityError as e:
        db.rollback()
        error_info = str(e.orig).lower()
        # The exact constraint name might differ based on your DB/Alembic version.
        # Check your database schema for the correct constraint names.
        if "users_email_key" in error_info or "ix_users_email" in error_info:
            logger.warning("Registration failed for email %s: email already exists.", user_in.email)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        if "users_username_key" in error_info or "ix_users_username" in error_info:
            logger.warning("Registration failed for username %s: username already exists.", user_in.username)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken",
            )

        # If it's a different integrity error, raise a generic 500 error.
        logger.error("An unexpected database integrity error occurred during user registration.", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration.",
        )


@router.post("/login/access-token", response_model=Token)
async def login_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """Obtener un token de acceso OAuth2 para autenticación.

    Args:
        db: Sesión de base de datos
        form_data: Datos del formulario de inicio de sesión

    Returns:
        dict: Tokens de acceso y actualización

    Raises:
        HTTPException: Si la autenticación falla
    """
    # Autenticar al usuario
    user = security.authenticate_user(
        db, email=form_data.username, password=form_data.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )

    # Crear tokens de acceso y actualización
    access_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    access_token = security.create_access_token(
        user.email, user.id, user.role, expires_delta=access_expires
    )
    refresh_token = security.create_refresh_token(
        user.email, user.id, expires_delta=refresh_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token,
        "expires_at": (datetime.utcnow() + access_expires).isoformat(),
    }


@router.post("/login/test-token", response_model=UserSchema)
def test_token(
    current_user: User = Depends(security.get_current_user)
) -> Any:
    """Probar el token de acceso actual.

    Args:
        current_user: Usuario autenticado

    Returns:
        User: Datos del usuario autenticado
    """
    return current_user


@router.post("/refresh-token", response_model=Token)
def refresh_token(
    token_in: RefreshTokenRequest,
    db: Session = Depends(get_db)
) -> Any:
    """Obtener un nuevo token de acceso utilizando un token de actualización.

    Args:
        token_in: Token de actualización
        db: Sesión de base de datos

    Returns:
        dict: Nuevos tokens de acceso y actualización

    Raises:
        HTTPException: Si el token es inválido o el usuario no existe
    """
    try:
        payload = jwt.decode(
            token_in.refresh_token,
            settings.REFRESH_SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        token_data = TokenPayload(**payload)
    except (jwt.JWTError, ValidationError) as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No se pudo validar el token de actualización",
        ) from e

    user = db.query(User).filter(User.id == token_data.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado o inactivo"
        )

    # Crear nuevos tokens
    access_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    access_token = security.create_access_token(
        user.email, user.id, user.role, expires_delta=access_expires
    )
    refresh_token = security.create_refresh_token(
        user.email, user.id, expires_delta=refresh_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token,
        "expires_at": (datetime.utcnow() + access_expires).isoformat(),
    }

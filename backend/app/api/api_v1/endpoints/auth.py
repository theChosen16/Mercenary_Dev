"""
Endpoints para autenticación de usuarios.
"""
from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core import security
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.schemas.token import Token, LoginRequest
from app.schemas.user import User as UserSchema

router = APIRouter()


@router.post("/login/access-token", response_model=Token)
asdef login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    Obtener un token de acceso OAuth2 para autenticación.
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
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Usuario inactivo"
        )

    # Crear tokens de acceso y actualización
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    access_token = security.create_access_token(
        user.email, user.id, user.role, expires_delta=access_token_expires
    )
    refresh_token = security.create_refresh_token(
        user.email, user.id, expires_delta=refresh_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token,
        "expires_at": (datetime.utcnow() + access_token_expires).isoformat(),
    }


@router.post("/login/test-token", response_model=UserSchema)
def test_token(current_user: User = Depends(security.get_current_user)) -> Any:
    """
    Probar el token de acceso actual.
    """
    return current_user


@router.post("/refresh-token", response_model=Token)
def refresh_token(
    token_in: RefreshTokenRequest, db: Session = Depends(get_db)
) -> Any:
    """
    Obtener un nuevo token de acceso utilizando un token de actualización.
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
        raise HTTPException(status_code=404, detail="Usuario no encontrado o inactivo")

    # Crear nuevos tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    access_token = security.create_access_token(
        user.email, user.id, user.role, expires_delta=access_token_expires
    )
    refresh_token = security.create_refresh_token(
        user.email, user.id, expires_delta=refresh_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token,
        "expires_at": (datetime.utcnow() + access_token_expires).isoformat(),
    }

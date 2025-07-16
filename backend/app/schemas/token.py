"""
Esquemas Pydantic para la autenticación y tokens.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, EmailStr

from app.models.user import UserRole


class Token(BaseModel):
    """Esquema para la respuesta de tokens de autenticación."""
    access_token: str = Field(..., description="Token de acceso JWT")
    token_type: str = Field(default="bearer", description="Tipo de token")
    refresh_token: str = Field(..., description="Token de actualización JWT")
    expires_at: datetime = Field(..., description="Fecha de expiración del token de acceso")

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "expires_at": "2025-07-15T23:59:59.999999"
            }
        }


class TokenPayload(BaseModel):
    """Esquema para el payload del token JWT."""
    sub: Optional[str] = Field(None, description="Sujeto del token (email del usuario)")
    user_id: Optional[int] = Field(None, description="ID del usuario")
    user_type: Optional[UserRole] = Field(None, description="Rol del usuario")
    exp: Optional[datetime] = Field(None, description="Fecha de expiración del token")
    token_type: Optional[str] = Field(None, description="Tipo de token (access/refresh)")


class TokenData(BaseModel):
    """Esquema para los datos del token."""
    email: Optional[EmailStr] = Field(None, description="Email del usuario")
    user_id: Optional[int] = Field(None, description="ID del usuario")
    user_type: Optional[UserRole] = Field(None, description="Rol del usuario")


class LoginRequest(BaseModel):
    """Esquema para la solicitud de inicio de sesión."""
    email: Optional[EmailStr] = Field(None, description="Email del usuario")
    username: Optional[str] = Field(None, description="Nombre de usuario")
    password: str = Field(..., description="Contraseña del usuario")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "usuario@ejemplo.com",
                "username": "usuario123",
                "password": "contraseñaSegura123"
            }
        }


class RefreshTokenRequest(BaseModel):
    """Esquema para la solicitud de actualización de token."""
    refresh_token: str = Field(..., description="Token de actualización")

    class Config:
        json_schema_extra = {
            "example": {
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
        }

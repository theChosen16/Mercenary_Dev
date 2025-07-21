"""
Esquemas Pydantic para la gestión de usuarios.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole


class UserBase(BaseModel):
    """Esquema base para usuarios."""
    email: EmailStr = Field(..., description="Correo electrónico del usuario")
    username: str = Field(..., min_length=3, max_length=50, description="Nombre de usuario único")
    full_name: Optional[str] = Field(None, max_length=100, description="Nombre completo del usuario")
    bio: Optional[str] = Field(None, max_length=500, description="Biografía del usuario")
    profile_picture: Optional[str] = Field(None, description="URL de la imagen de perfil")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "email": "usuario@ejemplo.com",
                "username": "usuario123",
                "full_name": "Juan Pérez",
                "bio": "Desarrollador Full Stack con 5 años de experiencia",
                "profile_picture": "https://ejemplo.com/foto.jpg"
            }
        }


class UserCreate(UserBase):
    """Esquema para la creación de usuarios."""
    password: str = Field(..., min_length=8, description="Contraseña del usuario (mínimo 8 caracteres)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "usuario@ejemplo.com",
                "username": "usuario123",
                "password": "contraseñaSegura123",
                "full_name": "Juan Pérez",
                "bio": "Desarrollador Full Stack con 5 años de experiencia",
                "profile_picture": "https://ejemplo.com/foto.jpg"
            }
        }


class UserUpdate(BaseModel):
    """Esquema para la actualización de usuarios."""
    email: Optional[EmailStr] = Field(None, description="Nuevo correo electrónico")
    username: Optional[str] = Field(None, min_length=3, max_length=50, description="Nuevo nombre de usuario")
    full_name: Optional[str] = Field(None, max_length=100, description="Nuevo nombre completo")
    bio: Optional[str] = Field(None, max_length=500, description="Nueva biografía")
    profile_picture: Optional[str] = Field(None, description="Nueva URL de la imagen de perfil")
    password: Optional[str] = Field(None, min_length=8, description="Nueva contraseña (mínimo 8 caracteres)")
    is_active: Optional[bool] = Field(None, description="Indica si el usuario está activo")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "nuevo@ejemplo.com",
                "username": "nuevo_usuario",
                "full_name": "Juan Carlos Pérez",
                "bio": "Desarrollador con experiencia en Python y FastAPI",
                "profile_picture": "https://ejemplo.com/nueva_foto.jpg",
                "password": "nuevaContraseña123",
                "is_active": True
            }
        }


class UserInDBBase(UserBase):
    """Esquema base para usuarios en la base de datos."""
    id: int = Field(..., description="ID único del usuario")
    role: UserRole = Field(..., description="Rol del usuario en el sistema")
    is_active: bool = Field(..., description="Indica si el usuario está activo")
    created_at: datetime = Field(..., description="Fecha de creación del usuario")
    updated_at: datetime = Field(..., description="Fecha de última actualización del usuario")

    class Config:
        from_attributes = True


class User(UserInDBBase):
    """Esquema para la respuesta de usuarios."""
    pass


class UserPublic(UserInDBBase):
    """Esquema para la respuesta pública de usuarios."""
    pass

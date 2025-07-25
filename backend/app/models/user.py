"""
Modelo de Usuario.

Define la estructura de los usuarios del sistema, incluyendo autenticación y relaciones.
"""
from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import EmailStr
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, relationship, Session

from app.models.base import Base
from app.core.password_utils import get_password_hash, verify_password


class UserRole(str, Enum):
    """Enumeración de roles de usuario.
    
    Nota: Los valores deben coincidir exactamente con los definidos en la base de datos (UPPERCASE).
    """
    ADMIN = "ADMIN"
    MERCENARY = "MERCENARY"
    OFFERER = "OFFERER"


class User(Base):
    """Modelo de usuario.

    Atributos:
        id: Identificador único del usuario.
        email: Correo electrónico del usuario (único).
        hashed_password: Contraseña hasheada.
        is_active: Indica si el usuario está activo.
        role: Rol del usuario (admin, mercenary, offerer).
        created_at: Fecha de creación del usuario.
        updated_at: Fecha de última actualización del usuario.
    """
    __tablename__ = "users"

    id: Mapped[int] = Column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = Column(String(255), nullable=False)
    is_active: Mapped[bool] = Column(Boolean, default=True, nullable=False)
    role: Mapped[str] = Column(SQLEnum(UserRole), nullable=False)
    created_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relación con el perfil (one-to-one)
    profile: Mapped["Profile"] = relationship(
        "Profile", 
        back_populates="user", 
        uselist=False, 
        cascade="all, delete-orphan"
    )
    
    # Relación con anuncios publicados (oferente)
    announcements: Mapped[list["Announcement"]] = relationship(
        "Announcement", 
        back_populates="offerer",
        foreign_keys="Announcement.offerer_id"
    )
    
    # Contratos donde el usuario es el oferente
    contracts_as_offerer: Mapped[list["Contract"]] = relationship(
        "Contract", 
        back_populates="offerer", 
        foreign_keys="[Contract.offerer_id]"
    )

    # Contratos donde el usuario es el mercenario
    contracts_as_mercenary: Mapped[list["Contract"]] = relationship(
        "Contract", 
        back_populates="mercenary", 
        foreign_keys="[Contract.mercenary_id]"
    )

    # Reseñas hechas por el usuario
    reviews_given: Mapped[list["Review"]] = relationship(
        "Review", 
        back_populates="reviewer", 
        foreign_keys="Review.reviewer_id"
    )
    
    # Reseñas recibidas por el usuario
    reviews_received: Mapped[list["Review"]] = relationship(
        "Review", 
        back_populates="reviewee", 
        foreign_keys="Review.reviewee_id"
    )
    
    # Proyectos donde el usuario es el oferente
    projects_as_offerer: Mapped[list["Project"]] = relationship(
        "Project", 
        back_populates="offerer", 
        foreign_keys="[Project.offerer_id]"
    )
    
    # Proyectos donde el usuario es el mercenario
    projects_as_mercenary: Mapped[list["Project"]] = relationship(
        "Project",
        back_populates="mercenary",
        foreign_keys="[Project.mercenary_id]"
    )
    
    # Contratos donde el usuario es el oferente
    contracts_as_offerer: Mapped[list["Contract"]] = relationship(
        "Contract",
        foreign_keys="[Contract.offerer_id]",
        back_populates="offerer",
        cascade="all, delete-orphan"
    )
    
    # Contratos donde el usuario es el mercenario
    contracts_as_mercenary: Mapped[list["Contract"]] = relationship(
        "Contract",
        foreign_keys="[Contract.mercenary_id]",
        back_populates="mercenary",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"

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
from app.core.security import get_password_hash, verify_password


class UserRole(str, Enum):
    """Enumeración de roles de usuario."""
    ADMIN = "admin"
    MERCENARY = "mercenary"
    OFFERER = "offerer"


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
    
    # Relación con trabajos publicados (oferente)
    jobs_posted: Mapped[list["Job"]] = relationship(
        "Job", 
        back_populates="offerer", 
        foreign_keys="Job.offerer_id"
    )
    
    # Relación con trabajos asignados (mercenario)
    jobs_assigned: Mapped[list["Job"]] = relationship(
        "Job", 
        back_populates="mercenary", 
        foreign_keys="Job.mercenary_id"
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

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"

    @classmethod
    def create(
        cls, 
        db: Session, 
        email: str, 
        password: str, 
        role: UserRole = UserRole.MERCENARY
    ) -> "User":
        """Crea un nuevo usuario en la base de datos.

        Args:
            db: Sesión de base de datos.
            email: Correo electrónico del usuario.
            password: Contraseña del usuario.
            hashed_password: Contraseña hasheada.
            role: Rol del usuario.
            is_active: Indica si el usuario está activo.

        Returns:
            User: El usuario creado.
        """
        user = cls(
            email=email,
            hashed_password=hashed_password,
            role=role,
            is_active=is_active,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

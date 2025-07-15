"""
Modelo de Perfil de Usuario.

Contiene información adicional para los usuarios, con campos específicos
para mercenarios y oferentes.
"""
from typing import List, Optional

from sqlalchemy import (
    Column,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import ARRAY as PgArray
from sqlalchemy.orm import Mapped, relationship, Session

from app.models.base import Base


class Profile(Base):
    """Modelo de perfil de usuario.

    Atributos:
        user_id: ID del usuario asociado al perfil.
        first_name: Primer nombre del usuario.
        last_name: Apellido del usuario.
        phone: Número de teléfono (opcional).
        bio: Breve biografía o descripción (opcional).
        skills: Lista de habilidades (para mercenarios).
        experience: Años de experiencia (para mercenarios).
        company: Nombre de la empresa (para oferentes, opcional).
        website: Sitio web personal o de la empresa (opcional).
    """
    __tablename__ = "profiles"

    user_id: Mapped[int] = Column(
        Integer, 
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False, 
        unique=True
    )
    first_name: Mapped[str] = Column(String(100), nullable=False)
    last_name: Mapped[str] = Column(String(100), nullable=False)
    user: Mapped["User"] = relationship(
        "User", 
        back_populates="profile"
    )
    phone: Mapped[Optional[str]] = Column(String(20), nullable=True)
    bio: Mapped[Optional[str]] = Column(Text, nullable=True)
    
    # Campos específicos para Mercenarios
    skills: Mapped[Optional[List[str]]] = Column(PgArray(String), nullable=True)
    experience: Mapped[Optional[int]] = Column(Integer, nullable=True)
    
    # Campos específicos para Oferentes
    company: Mapped[Optional[str]] = Column(String(100), nullable=True)
    website: Mapped[Optional[str]] = Column(String(255), nullable=True)

    def __repr__(self) -> str:
        return f"<Profile(user_id={self.user_id}, first_name='{self.first_name}', last_name='{self.last_name}')>"

    @classmethod
    def create(
        cls,
        db: Session,
        user_id: int,
        first_name: str,
        last_name: str,
        phone: Optional[str] = None,
        bio: Optional[str] = None,
        skills: Optional[List[str]] = None,
        experience: Optional[int] = None,
        company: Optional[str] = None,
        website: Optional[str] = None,
    ) -> "Profile":
        """Crea un nuevo perfil en la base de datos.

        Args:
            db: Sesión de base de datos.
            user_id: ID del usuario asociado.
            full_name: Nombre completo del usuario.
            phone: Número de teléfono (opcional).
            bio: Breve biografía (opcional).
            skills: Lista de habilidades (opcional).
            experience_years: Años de experiencia (opcional).
            company_name: Nombre de la empresa (opcional).
            website: Sitio web (opcional).

        Returns:
            Profile: El perfil creado.
        """
        profile = cls(
            user_id=user_id,
            full_name=full_name,
            phone=phone,
            bio=bio,
            skills=skills or [],
            experience_years=experience_years,
            company_name=company_name,
            website=website,
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
        return profile

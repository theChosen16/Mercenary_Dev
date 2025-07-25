"""Modelo de Anuncio (Announcement).

Define la estructura de los anuncios de trabajo publicados en la plataforma, que los 'Mercenarios' pueden solicitar.
"""
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import (
    Column,
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Integer,
    String,
    Text
)
from sqlalchemy.orm import Mapped, relationship

from app.models.base import Base


class AnnouncementStatus(str, Enum):
    """Enumeración de estados de un anuncio."""
    OPEN = "open"
    CLOSED = "closed"  # Se cierra cuando se selecciona un mercenario o se cancela
    IN_PROGRESS = "in_progress" # Cuando el contrato asociado está en progreso
    COMPLETED = "completed" # Cuando el contrato asociado se completa


class Announcement(Base):
    """Modelo de anuncio de trabajo.

    Atributos:
        title: Título del trabajo.
        description: Descripción detallada del trabajo.
        budget: Presupuesto o rango salarial.
        deadline: Fecha límite para postular.
        status: Estado actual del anuncio.
        offerer_id: ID del 'Oferente' que publicó el anuncio.
        category_id: ID de la categoría del anuncio.
        created_at: Fecha de creación del anuncio.
        updated_at: Fecha de última actualización.
    """
    __tablename__ = "announcements"

    title: Mapped[str] = Column(String(255), nullable=False)
    description: Mapped[str] = Column(Text, nullable=False)
    budget: Mapped[str | None] = Column(String(100), nullable=True)
    deadline: Mapped[datetime | None] = Column(DateTime, nullable=True)
    status: Mapped[str] = Column(
        SQLEnum(AnnouncementStatus), 
        default=AnnouncementStatus.OPEN, 
        nullable=False
    )

    # --- Claves foráneas ---
    offerer_id: Mapped[int] = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id: Mapped[int] = Column(Integer, ForeignKey("categories.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    # --- Relaciones ---
    offerer: Mapped["User"] = relationship("User", back_populates="announcements")
    category: Mapped["Category"] = relationship("Category", back_populates="announcements")

    # Relación uno a muchos con contratos (un anuncio puede tener varios contratos si se reabre)
    contracts: Mapped[list["Contract"]] = relationship("Contract", back_populates="announcement")

    def __repr__(self) -> str:
        return f"<Announcement(id={self.id}, title='{self.title}', status='{self.status}')>"

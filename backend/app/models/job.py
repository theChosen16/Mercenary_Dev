"""Modelo de Trabajo (Job).

Define la estructura de las ofertas de trabajo publicadas en la plataforma.
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


class JobStatus(str, Enum):
    """Enumeración de estados de un trabajo."""
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Job(Base):
    """Modelo de oferta de trabajo.

    Atributos:
        title: Título del trabajo.
        description: Descripción detallada del trabajo.
        location: Ubicación donde se realizará el trabajo.
        salary_range: Rango salarial (ej: "$1000 - $2000").
        status: Estado actual del trabajo.
        offerer_id: ID del usuario que publicó el trabajo.
        assigned_mercenary_id: ID del mercenario asignado (opcional).
        created_at: Fecha de creación del trabajo.
        updated_at: Fecha de última actualización.
    """
    __tablename__ = "jobs"

    title: Mapped[str] = Column(String(255), nullable=False)
    description: Mapped[str] = Column(Text, nullable=False)
    location: Mapped[str | None] = Column(String(255), nullable=True)
    salary_range: Mapped[str | None] = Column(String(100), nullable=True)
    status: Mapped[str] = Column(
        SQLEnum(JobStatus), 
        default=JobStatus.OPEN, 
        nullable=False
    )
    
    # Relaciones
    offerer_id: Mapped[int] = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    assigned_mercenary_id: Mapped[int | None] = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    # Configuración de relaciones
    offerer: Mapped["User"] = relationship(
        "User",
        foreign_keys=[offerer_id],
        back_populates="jobs_posted"
    )
    assigned_mercenary: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[assigned_mercenary_id],
        back_populates="jobs_assigned"
    )
    contract: Mapped[Optional["Contract"]] = relationship(
        "Contract",
        back_populates="job",
        uselist=False,
        cascade="all, delete-orphan"
    )
    review = relationship(
        "Review",
        back_populates="job",
        uselist=False,
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Job(id={self.id}, title='{self.title}', status='{self.status}')>"

    @classmethod
    def create(
        cls,
        db: "Session",
        title: str,
        description: str,
        offerer_id: int,
        location: str | None = None,
        salary_range: str | None = None,
        status: JobStatus = JobStatus.OPEN,
    ) -> "Job":
        """Crea un nuevo trabajo en la base de datos.

        Args:
            db: Sesión de base de datos.
            title: Título del trabajo.
            description: Descripción detallada.
            offerer_id: ID del usuario que publica el trabajo.
            location: Ubicación del trabajo (opcional).
            salary_range: Rango salarial (opcional).
            status: Estado inicial del trabajo (por defecto: "open").

        Returns:
            Job: El trabajo creado.
        """
        job = cls(
            title=title,
            description=description,
            location=location,
            salary_range=salary_range,
            status=status,
            offerer_id=offerer_id,
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        return job

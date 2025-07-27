"""
Modelo de Proyecto y tabla de asociación Project-Skill.
"""
from __future__ import annotations
from datetime import datetime
from enum import Enum
from typing import List, Optional

from sqlalchemy import Column, DateTime, Enum as SAEnum, ForeignKey, Integer, String, Table
from sqlalchemy.orm import Mapped, relationship

from app.db.base_class import Base
# Importaciones directas para evitar referencias string y ciclos
from app.models.user import User
from app.models.skill import Skill

class ProjectStatus(str, Enum):
    """Estado de un proyecto."""
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

# Tabla de asociación para la relación muchos-a-muchos entre Project y Skill
project_skill = Table(
    "project_skill",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("skill.id"), primary_key=True),
)

class Project(Base):
    """Modelo de Proyecto."""
    __tablename__ = "projects"

    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    title: Mapped[str] = Column(String(255), nullable=False)
    description: Mapped[str] = Column(String, nullable=False)
    status: Mapped[ProjectStatus] = Column(SAEnum(ProjectStatus), default=ProjectStatus.OPEN, nullable=False)
    created_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    client_id: Mapped[int] = Column(Integer, ForeignKey("users.id"))
    freelancer_id: Mapped[Optional[int]] = Column(Integer, ForeignKey("users.id"))

    client: Mapped[User] = relationship(foreign_keys=[client_id], back_populates="projects_created")
    freelancer: Mapped[Optional[User]] = relationship(foreign_keys=[freelancer_id], back_populates="projects_assigned")

    # Esta es la relación que faltaba y causaba el error de mapeo.
    # Se vincula con la relación 'projects' en el modelo Skill.
    # skills: Mapped[List[Skill]] = relationship(
    #     secondary=project_skill, back_populates="projects"
    # )

    def __repr__(self) -> str:
        return f"<Project(id={self.id}, title='{self.title}')>"

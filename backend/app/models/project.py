"""
SQLAlchemy models for projects.
"""
from datetime import datetime
from typing import List, Optional

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, Table, Enum
from sqlalchemy.orm import relationship

from app.db.base_class import Base
from app.models.user import User
from app.schemas.project import ProjectStatus


# Tabla de asociación para la relación muchos a muchos entre Project y Skill
project_skill = Table(
    "project_skill",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("project.id"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("skill.id"), primary_key=True),
)


class Project(Base):
    """Project model for storing project information."""
    
    __tablename__ = "project"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    budget = Column(Integer, nullable=True)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.draft, nullable=False)
    deadline = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relaciones
    offerer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    offerer = relationship("User", back_populates="projects_as_offerer", foreign_keys=[offerer_id])
    
    mercenary_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    mercenary = relationship("User", back_populates="projects_as_mercenary", foreign_keys=[mercenary_id])
    
    skills = relationship("Skill", secondary=project_skill, back_populates="projects")
    proposals = relationship("Proposal", back_populates="project", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Project {self.title}>"

"""
Paquete de modelos de la aplicación.

Este paquete contiene todos los modelos de la base de datos.
"""
from datetime import datetime
from typing import List, Optional, Type, TypeVar, Union, Any, Dict
from uuid import UUID

from sqlalchemy import Column, DateTime, Integer, String, Boolean, Enum, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, ARRAY as PgArray
from sqlalchemy.orm import Session, relationship, Mapped, declared_attr, mapped_column

from .base import Base
from .user import User, UserRole
from .profile import Profile
from .job import Job, JobStatus
from .review import Review
from .project import Project
from .proposal import Proposal
from .skill import Skill, UserSkill

# Ensure all models are imported and registered with Base's metadata
__all__ = [
    'Base',
    'User',
    'UserRole',
    'Profile',
    'Job',
    'JobStatus',
    'Review',
    'Project',
    'Proposal',
    'Skill',
    'UserSkill',
]

# Re-exportar tipos comunes para facilitar su uso
__all__ = [
    # Modelos
    "Base",
    "User",
    "UserRole",
    "Profile",
    "Job",
    "JobStatus",
    "Review",
    
    # Tipos SQLAlchemy
    "Session",
    "Mapped",
    "relationship",
    "Column",
    "Integer",
    "String",
    "Boolean",
    "DateTime",
    "Text",
    "ForeignKey",
    "PG_UUID",
    "PgArray",
    "declared_attr",
    "mapped_column",
    
    # Tipos Python
    "List",
    "Optional",
    "Type",
    "TypeVar",
    "Union",
    "Any",
    "Dict",
    "UUID",
    "datetime",
]
  # noqa: F401

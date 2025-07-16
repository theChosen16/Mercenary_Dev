"""
Pydantic models for projects.
"""
from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, validator

from app.schemas.user import UserPublic


class ProjectStatus(str, Enum):
    """Project status enumeration."""
    draft = "draft"
    published = "published"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class ProjectBase(BaseModel):
    """Base project schema."""
    title: str = Field(..., max_length=200, example="Desarrollo de API REST con FastAPI")
    description: str = Field(..., example="Necesito desarrollar una API REST con autenticación JWT y base de datos PostgreSQL.")
    budget: Optional[int] = Field(None, gt=0, example=1000)
    status: ProjectStatus = Field(default=ProjectStatus.draft, example="draft")
    deadline: Optional[datetime] = Field(None, example="2023-12-31T23:59:59")
    skill_ids: List[int] = Field(default_factory=list, example=[1, 2, 3])


class ProjectCreate(ProjectBase):
    """Schema for creating a new project."""
    pass


class ProjectUpdate(BaseModel):
    """Schema for updating a project."""
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    budget: Optional[int] = Field(None, gt=0)
    status: Optional[ProjectStatus] = None
    deadline: Optional[datetime] = None
    skill_ids: Optional[List[int]] = None


class ProjectInDBBase(ProjectBase):
    """Base project schema for database."""
    id: int
    client_id: int
    freelancer_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class Project(ProjectInDBBase):
    """Project schema for API responses."""
    client: Optional[UserPublic] = None
    freelancer: Optional[UserPublic] = None
    skills: List["Skill"] = Field(default_factory=list)


class ProjectInDB(ProjectInDBBase):
    """Project schema for database operations."""
    pass

"""
Pydantic models for Job-related schemas.
"""
from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.job import JobStatus as JobStatusModel


class JobStatus(str, Enum):
    """Job status values."""
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class JobBase(BaseModel):
    """Base schema for Job."""
    title: str = Field(..., max_length=255, description="Title of the job")
    description: str = Field(..., description="Detailed description of the job")
    location: Optional[str] = Field(None, max_length=255, description="Job location")
    salary_range: Optional[str] = Field(None, max_length=100, description="Salary range (e.g., '$1000 - $2000')")
    status: JobStatus = Field(default=JobStatus.OPEN, description="Current status of the job")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "title": "Desarrollo de app móvil",
                "description": "Se busca desarrollador para crear una aplicación móvil con Flutter.",
                "location": "Remoto",
                "salary_range": "$1000 - $2000",
                "status": "open"
            }
        }


class JobCreate(JobBase):
    """Schema for creating a new job."""
    pass


class JobUpdate(BaseModel):
    """Schema for updating a job."""
    title: Optional[str] = Field(None, max_length=255, description="New title of the job")
    description: Optional[str] = Field(None, description="New description of the job")
    location: Optional[str] = Field(None, max_length=255, description="New job location")
    salary_range: Optional[str] = Field(None, max_length=100, description="New salary range")
    status: Optional[JobStatus] = Field(None, description="New status of the job")

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Desarrollo de app móvil con Flutter",
                "description": "Se busca desarrollador con experiencia en Flutter para crear una aplicación móvil.",
                "location": "Remoto",
                "salary_range": "$1500 - $2500",
                "status": "in_progress"
            }
        }


class JobInDBBase(JobBase):
    """Base schema for Job in database."""
    id: int = Field(..., description="Unique identifier for the job")
    offerer_id: int = Field(..., description="ID of the user who posted the job")
    assigned_mercenary_id: Optional[int] = Field(None, description="ID of the assigned mercenary")
    created_at: datetime = Field(..., description="When the job was created")
    updated_at: datetime = Field(..., description="When the job was last updated")

    class Config:
        from_attributes = True


class Job(JobInDBBase):
    """Schema for Job response."""
    pass


class JobInDB(JobInDBBase):
    """Schema for Job stored in database."""
    pass

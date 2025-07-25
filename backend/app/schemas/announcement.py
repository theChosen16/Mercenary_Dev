"""
Pydantic schemas for Announcements.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.announcement import AnnouncementStatus


class AnnouncementBase(BaseModel):
    """Base schema for an announcement."""
    title: str = Field(..., max_length=255, description="Title of the announcement")
    description: str = Field(..., description="Detailed description of the announcement")
    budget: Optional[str] = Field(None, max_length=100, description="Budget or salary range")
    deadline: Optional[datetime] = Field(None, description="Application deadline for the announcement")
    category_id: int = Field(..., description="The category ID for this announcement")


class AnnouncementCreate(AnnouncementBase):
    """Schema used for creating a new announcement."""
    pass


class AnnouncementUpdate(BaseModel):
    """Schema for updating an announcement."""
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None)
    budget: Optional[str] = Field(None, max_length=100)
    deadline: Optional[datetime] = Field(None)
    status: Optional[AnnouncementStatus] = Field(None)
    category_id: Optional[int] = Field(None)


class AnnouncementInDBBase(AnnouncementBase):
    """Base schema for announcement data stored in the database."""
    id: int
    offerer_id: int
    status: AnnouncementStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Announcement(AnnouncementInDBBase):
    """Schema for representing an announcement in API responses."""
    pass


class AnnouncementInDB(AnnouncementInDBBase):
    """Schema for announcement data as stored in the database."""
    pass

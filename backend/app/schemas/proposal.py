"""
Pydantic models for project proposals.
"""
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, validator

from app.schemas.project import Project
from app.schemas.user import UserPublic


class ProposalStatus(str, Enum):
    """Proposal status enumeration."""
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    withdrawn = "withdrawn"


class ProposalBase(BaseModel):
    """Base proposal schema."""
    cover_letter: str = Field(..., example="Estoy interesado en trabajar en este proyecto porque...")
    bid_amount: int = Field(..., gt=0, example=1000)
    estimated_days: Optional[int] = Field(None, gt=0, example=14)
    status: ProposalStatus = Field(default=ProposalStatus.pending, example="pending")


class ProposalCreate(ProposalBase):
    """Schema for creating a new proposal."""
    project_id: int = Field(..., example=1)


class ProposalUpdate(BaseModel):
    """Schema for updating a proposal."""
    cover_letter: Optional[str] = None
    bid_amount: Optional[int] = Field(None, gt=0)
    estimated_days: Optional[int] = Field(None, gt=0)
    status: Optional[ProposalStatus] = None


class ProposalInDBBase(ProposalBase):
    """Base proposal schema for database."""
    id: int
    project_id: int
    freelancer_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class Proposal(ProposalInDBBase):
    """Proposal schema for API responses."""
    project: Optional[Project] = None
    freelancer: Optional[UserPublic] = None

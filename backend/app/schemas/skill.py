"""
Pydantic models for skills.
"""
from typing import List, Optional

from pydantic import BaseModel, Field


class SkillBase(BaseModel):
    """Base skill schema."""
    name: str = Field(..., max_length=100, example="Python")


class SkillCreate(SkillBase):
    """Schema for creating a new skill."""
    pass


class SkillUpdate(SkillBase):
    """Schema for updating a skill."""
    name: Optional[str] = Field(None, max_length=100)


class SkillInDBBase(SkillBase):
    """Base skill schema for database."""
    id: int

    class Config:
        orm_mode = True


class Skill(SkillInDBBase):
    """Skill schema for API responses."""
    pass


class UserSkillBase(BaseModel):
    """Base user skill schema."""
    skill_id: int
    proficiency: int = Field(..., ge=1, le=5, example=4)


class UserSkillCreate(UserSkillBase):
    """Schema for creating a new user skill."""
    pass


class UserSkillUpdate(BaseModel):
    """Schema for updating a user skill."""
    proficiency: int = Field(..., ge=1, le=5, example=4)


class UserSkillInDBBase(UserSkillBase):
    """Base user skill schema for database."""
    user_id: int

    class Config:
        orm_mode = True


class UserSkill(UserSkillInDBBase):
    """User skill schema for API responses."""
    skill: Skill

"""
Pydantic schemas for Categories.
"""
from typing import Optional

from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    """Base schema for a category."""
    name: str = Field(..., max_length=100, description="Name of the category")


class CategoryCreate(CategoryBase):
    """Schema for creating a new category."""
    pass


class CategoryUpdate(BaseModel):
    """Schema for updating a category."""
    name: Optional[str] = Field(None, max_length=100)


class CategoryInDBBase(CategoryBase):
    """Base schema for category data stored in the database."""
    id: int

    class Config:
        from_attributes = True


class Category(CategoryInDBBase):
    """Schema for representing a category in API responses."""
    pass


class CategoryInDB(CategoryInDBBase):
    """Schema for category data as stored in the database."""
    pass

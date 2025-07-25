"""
Endpoints for category management.
"""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()


@router.post("/", response_model=schemas.Category, status_code=status.HTTP_201_CREATED)
def create_category(
    *,
    db: Session = Depends(deps.get_db),
    category_in: schemas.CategoryCreate,
    current_user: models.User = Depends(deps.get_current_superuser),
) -> Any:
    """Create a new category. Only superusers can create categories."""
    category = crud.category.create(db, obj_in=category_in)
    return category


@router.get("/", response_model=List[schemas.Category])
def read_categories(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """Retrieve all categories with pagination."""
    categories = crud.category.get_multi(db, skip=skip, limit=limit)
    return categories


@router.get("/{category_id}", response_model=schemas.Category)
def read_category(
    *,
    db: Session = Depends(deps.get_db),
    category_id: int,
) -> Any:
    """Get a specific category by ID."""
    category = crud.category.get(db, id=category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Category not found"
        )
    return category


@router.put("/{category_id}", response_model=schemas.Category)
def update_category(
    *,
    db: Session = Depends(deps.get_db),
    category_id: int,
    category_in: schemas.CategoryUpdate,
    current_user: models.User = Depends(deps.get_current_superuser),
) -> Any:
    """Update a category. Only superusers can update categories."""
    category = crud.category.get(db, id=category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Category not found"
        )
    category = crud.category.update(db, db_obj=category, obj_in=category_in)
    return category


@router.delete("/{category_id}", response_model=schemas.Category)
def delete_category(
    *,
    db: Session = Depends(deps.get_db),
    category_id: int,
    current_user: models.User = Depends(deps.get_current_superuser),
) -> Any:
    """Delete a category. Only superusers can delete categories."""
    category = crud.category.get(db, id=category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Category not found"
        )
    category = crud.category.remove(db, id=category_id)
    return category

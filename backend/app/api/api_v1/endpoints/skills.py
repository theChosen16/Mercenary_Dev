"""
Endpoints for skill management.
"""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()


@router.get("/", response_model=List[schemas.Skill])
def read_skills(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve skills with optional search.
    """
    if search:
        return crud.skill.search(db, query=search, skip=skip, limit=limit)
    return crud.skill.get_multi(db, skip=skip, limit=limit)


@router.post("/", response_model=schemas.Skill, status_code=status.HTTP_201_CREATED)
def create_skill(
    *,
    db: Session = Depends(deps.get_db),
    skill_in: schemas.SkillCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new skill (admin only).
    """
    if not crud.user.is_superuser(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    skill = crud.skill.get_by_name(db, name=skill_in.name)
    if skill:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skill with this name already exists",
        )
    
    skill = crud.skill.create(db, obj_in=skill_in)
    return skill


@router.get("/{skill_id}", response_model=schemas.Skill)
def read_skill(
    *,
    db: Session = Depends(deps.get_db),
    skill_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get skill by ID.
    """
    skill = crud.skill.get(db, id=skill_id)
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found",
        )
    return skill


@router.put("/{skill_id}", response_model=schemas.Skill)
def update_skill(
    *,
    db: Session = Depends(deps.get_db),
    skill_id: int,
    skill_in: schemas.SkillUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a skill (admin only).
    """
    if not crud.user.is_superuser(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    skill = crud.skill.get(db, id=skill_id)
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found",
        )
    
    # Check if the new name is already taken
    if skill_in.name and skill_in.name != skill.name:
        existing_skill = crud.skill.get_by_name(db, name=skill_in.name)
        if existing_skill:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Skill with this name already exists",
            )
    
    skill = crud.skill.update(db, db_obj=skill, obj_in=skill_in)
    return skill


@router.delete("/{skill_id}", response_model=schemas.Skill)
def delete_skill(
    *,
    db: Session = Depends(deps.get_db),
    skill_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a skill (admin only).
    """
    if not crud.user.is_superuser(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    skill = crud.skill.get(db, id=skill_id)
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found",
        )
    
    # Check if the skill is being used by any user or project
    if skill.users or skill.projects:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a skill that is being used by users or projects",
        )
    
    skill = crud.skill.remove(db, id=skill_id)
    return skill


@router.get("/user/me", response_model=List[schemas.UserSkill])
def read_user_skills(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user's skills.
    """
    return crud.user_skill.get_multi_by_user(db, user_id=current_user.id)


@router.post("/user/me", response_model=schemas.UserSkill, status_code=status.HTTP_201_CREATED)
def add_user_skill(
    *,
    db: Session = Depends(deps.get_db),
    user_skill_in: schemas.UserSkillCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Add a skill to current user's profile.
    """
    # Check if skill exists
    skill = crud.skill.get(db, id=user_skill_in.skill_id)
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found",
        )
    
    # Check if user already has this skill
    existing_user_skill = crud.user_skill.get_by_user_and_skill(
        db, user_id=current_user.id, skill_id=user_skill_in.skill_id
    )
    
    if existing_user_skill:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skill already added to your profile",
        )
    
    # Add skill to user's profile
    user_skill = crud.user_skill.create_with_user_and_skill(
        db=db,
        user_id=current_user.id,
        skill_id=user_skill_in.skill_id,
        proficiency=user_skill_in.proficiency,
    )
    
    return user_skill


@router.put("/user/me/{skill_id}", response_model=schemas.UserSkill)
def update_user_skill(
    *,
    db: Session = Depends(deps.get_db),
    skill_id: int,
    user_skill_in: schemas.UserSkillUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update current user's skill proficiency.
    """
    user_skill = crud.user_skill.get_by_user_and_skill(
        db, user_id=current_user.id, skill_id=skill_id
    )
    
    if not user_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found in your profile",
        )
    
    user_skill = crud.user_skill.update_proficiency(
        db, db_obj=user_skill, proficiency=user_skill_in.proficiency
    )
    
    return user_skill


@router.delete("/user/me/{skill_id}", response_model=schemas.UserSkill)
def remove_user_skill(
    *,
    db: Session = Depends(deps.get_db),
    skill_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Remove a skill from current user's profile.
    """
    user_skill = crud.user_skill.get_by_user_and_skill(
        db, user_id=current_user.id, skill_id=skill_id
    )
    
    if not user_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found in your profile",
        )
    
    crud.user_skill.remove(db, id=user_skill.id)
    return user_skill

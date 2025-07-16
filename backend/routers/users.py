from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_active_user


router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=schemas.User)
async def read_user_me(
    current_user: models.User = Depends(get_current_active_user)
):
    """Obtiene el perfil del usuario actual."""
    return current_user


@router.put("/me", response_model=schemas.User)
async def update_user_me(
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Actualiza el perfil del usuario actual."""
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/{user_id}", response_model=schemas.UserPublic)
async def read_user(user_id: int, db: Session = Depends(get_db)):
    """Obtiene el perfil público de un usuario."""
    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()
    if not user:
        raise HTTPException(
            status_code=404, detail="Usuario no encontrado"
        )
    return user

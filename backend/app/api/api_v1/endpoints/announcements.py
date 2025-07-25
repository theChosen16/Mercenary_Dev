from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api.deps import get_db, get_current_active_user

router = APIRouter()


@router.get("/", response_model=List[schemas.Announcement])
def read_announcements(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve announcements.
    """
    announcements = crud.announcement.get_multi(db, skip=skip, limit=limit)
    return announcements


@router.post("/", response_model=schemas.Announcement)
def create_announcement(
    *,
    db: Session = Depends(get_db),
    announcement_in: schemas.AnnouncementCreate,
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Create new announcement.
    """
    if current_user.role != models.UserRole.OFFERER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only offerers can create announcements.",
        )
    announcement = crud.announcement.create_with_offerer(
        db=db, obj_in=announcement_in, offerer_id=current_user.id
    )
    return announcement


@router.get("/{announcement_id}", response_model=schemas.Announcement)
def read_announcement(
    *,
    db: Session = Depends(get_db),
    announcement_id: int,
) -> Any:
    """
    Get announcement by ID.
    """
    announcement = crud.announcement.get(db, id=announcement_id)
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found"
        )
    return announcement


@router.put("/{announcement_id}", response_model=schemas.Announcement)
def update_announcement(
    *,
    db: Session = Depends(get_db),
    announcement_id: int,
    announcement_in: schemas.AnnouncementUpdate,
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Update an announcement.
    """
    announcement = crud.announcement.get(db, id=announcement_id)
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found"
        )
    if announcement.offerer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this announcement",
        )
    announcement = crud.announcement.update(db, db_obj=announcement, obj_in=announcement_in)
    return announcement


@router.delete("/{announcement_id}", response_model=schemas.Announcement)
def delete_announcement(
    *,
    db: Session = Depends(get_db),
    announcement_id: int,
    current_user: models.User = Depends(get_current_active_user),
) -> Any:
    """
    Delete an announcement. Only the offerer who created it can delete it.
    """
    announcement = crud.announcement.get(db, id=announcement_id)
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found",
        )
    if announcement.offerer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this announcement",
        )
    
    announcement = crud.announcement.remove(db, id=announcement_id)
    return announcement

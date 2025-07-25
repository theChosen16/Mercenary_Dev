"""
CRUD operations for the Announcement model.
"""
from typing import List

from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.announcement import Announcement, AnnouncementStatus
from app.schemas.announcement import AnnouncementCreate, AnnouncementUpdate


class CRUDAnnouncement(CRUDBase[Announcement, AnnouncementCreate, AnnouncementUpdate]):
    def create_with_offerer(
        self, db: Session, *, obj_in: AnnouncementCreate, offerer_id: int
    ) -> Announcement:
        """Create a new announcement linked to an offerer."""
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_in_data, offerer_id=offerer_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_offerer(
        self, db: Session, *, offerer_id: int, skip: int = 0, limit: int = 100
    ) -> List[Announcement]:
        """Retrieve announcements for a specific offerer."""
        return (
            db.query(self.model)
            .filter(Announcement.offerer_id == offerer_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_multi_open(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[Announcement]:
        """Retrieve all open announcements."""
        return (
            db.query(self.model)
            .filter(Announcement.status == AnnouncementStatus.OPEN)
            .order_by(Announcement.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )


announcement = CRUDAnnouncement(Announcement)


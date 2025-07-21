"""
CRUD operations for Job model.
"""
from typing import Any, Dict, List, Optional, Union

from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.job import Job, JobStatus
from app.schemas.job import JobCreate, JobUpdate


class CRUDJob(CRUDBase[Job, JobCreate, JobUpdate]):    
    def create_with_offerer(
        self, db: Session, *, obj_in: JobCreate, offerer_id: int
    ) -> Job:
        """Create a new job with the offerer ID."""
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(
            **obj_in_data,
            offerer_id=offerer_id,
            status=JobStatus.OPEN
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_multi_by_offerer(
        self, db: Session, *, offerer_id: int, skip: int = 0, limit: int = 100
    ) -> List[Job]:
        """Get jobs by offerer ID with pagination."""
        return (
            db.query(self.model)
            .filter(Job.offerer_id == offerer_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_multi_open(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[Job]:
        """Get all open jobs with pagination."""
        return (
            db.query(self.model)
            .filter(Job.status == JobStatus.OPEN)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def assign_mercenary(
        self, db: Session, *, db_obj: Job, mercenary_id: int
    ) -> Job:
        """Assign a mercenary to a job."""
        db_obj.assigned_mercenary_id = mercenary_id
        db_obj.status = JobStatus.IN_PROGRESS
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def complete_job(self, db: Session, *, db_obj: Job) -> Job:
        """Mark a job as completed."""
        db_obj.status = JobStatus.COMPLETED
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def cancel_job(self, db: Session, *, db_obj: Job) -> Job:
        """Cancel a job."""
        db_obj.status = JobStatus.CANCELLED
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


# Create a singleton instance
job = CRUDJob(Job)

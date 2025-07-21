"""
Endpoints for job management.
"""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.db.session import get_db

router = APIRouter()


@router.post("/", response_model=schemas.Job, status_code=status.HTTP_201_CREATED)
def create_job(
    *,
    db: Session = Depends(get_db),
    job_in: schemas.JobCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new job.
    """
    # Only offerers can create jobs
    if current_user.role != "OFFERER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only offerers can create jobs",
        )
    
    job = crud.job.create_with_offerer(
        db=db, obj_in=job_in, offerer_id=current_user.id
    )
    return job


@router.get("/", response_model=List[schemas.Job])
def read_jobs(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve jobs with pagination.
    """
    jobs = crud.job.get_multi(db, skip=skip, limit=limit)
    return jobs


@router.get("/open", response_model=List[schemas.Job])
def read_open_jobs(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve open jobs with pagination.
    """
    jobs = crud.job.get_multi_open(db, skip=skip, limit=limit)
    return jobs


@router.get("/{job_id}", response_model=schemas.Job)
def read_job(
    *,
    db: Session = Depends(get_db),
    job_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get a specific job by ID.
    """
    job = crud.job.get(db, id=job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )
    return job


@router.put("/{job_id}", response_model=schemas.Job)
def update_job(
    *,
    db: Session = Depends(get_db),
    job_id: int,
    job_in: schemas.JobUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a job.
    """
    job = crud.job.get(db, id=job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )
    
    # Only the offerer who created the job can update it
    if job.offerer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this job",
        )
    
    job = crud.job.update(db, db_obj=job, obj_in=job_in)
    return job


@router.delete("/{job_id}", response_model=schemas.Job)
def delete_job(
    *,
    db: Session = Depends(get_db),
    job_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a job.
    """
    job = crud.job.get(db, id=job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )
    
    # Only the offerer who created the job can delete it
    if job.offerer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this job",
        )
    
    job = crud.job.remove(db, id=job_id)
    return job


@router.post("/{job_id}/assign/{mercenary_id}", response_model=schemas.Job)
def assign_mercenary(
    *,
    db: Session = Depends(get_db),
    job_id: int,
    mercenary_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Assign a mercenary to a job.
    """
    job = crud.job.get(db, id=job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )
    
    # Only the offerer who created the job can assign a mercenary
    if job.offerer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to assign a mercenary to this job",
        )
    
    # Check if the mercenary exists
    mercenary = crud.user.get(db, id=mercenary_id)
    if not mercenary or mercenary.role != "MERCENARY":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid mercenary ID",
        )
    
    job = crud.job.assign_mercenary(db, db_obj=job, mercenary_id=mercenary_id)
    return job

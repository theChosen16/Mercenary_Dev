"""
CRUD operations for Project model.
"""
from typing import Any, Dict, List, Optional, Union

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


class CRUDProject(CRUDBase[Project, ProjectCreate, ProjectUpdate]):
    """CRUD operations for Project model."""
    
    def create_with_owner(
        self, db: Session, *, obj_in: ProjectCreate, owner_id: int
    ) -> Project:
        """Create a new project with the specified owner."""
        db_obj = Project(
            title=obj_in.title,
            description=obj_in.description,
            budget=obj_in.budget,
            status=obj_in.status,
            deadline=obj_in.deadline,
            client_id=owner_id,
        )
        
        # Add skills to project if provided
        if hasattr(obj_in, 'skill_ids') and obj_in.skill_ids:
            from app.crud.skill import skill
            db_obj.skills = skill.get_multi_by_ids(db, ids=obj_in.skill_ids)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_multi_by_owner(
        self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[Project]:
        """Get projects by owner ID."""
        return (
            db.query(self.model)
            .filter(Project.client_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_multi_by_freelancer(
        self, db: Session, *, freelancer_id: int, skip: int = 0, limit: int = 100
    ) -> List[Project]:
        """Get projects by freelancer ID."""
        return (
            db.query(self.model)
            .filter(Project.freelancer_id == freelancer_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def update_status(
        self, db: Session, *, db_obj: Project, status: str
    ) -> Project:
        """Update project status."""
        db_obj.status = status
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def assign_freelancer(
        self, db: Session, *, db_obj: Project, freelancer_id: int
    ) -> Project:
        """Assign a freelancer to a project."""
        db_obj.freelancer_id = freelancer_id
        db_obj.status = "in_progress"
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


# Create a singleton instance
project = CRUDProject(Project)

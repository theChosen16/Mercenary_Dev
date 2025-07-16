"""
CRUD operations for Skill and UserSkill models.
"""
from typing import List, Optional

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.skill import Skill, UserSkill
from app.schemas.skill import SkillCreate, SkillUpdate, UserSkillCreate, UserSkillUpdate


class CRUDSkill(CRUDBase[Skill, SkillCreate, SkillUpdate]):
    """CRUD operations for Skill model."""
    
    def get_by_name(self, db: Session, *, name: str) -> Optional[Skill]:
        """Get a skill by name."""
        return db.query(Skill).filter(Skill.name == name).first()
    
    def get_multi_by_ids(
        self, db: Session, *, ids: List[int], skip: int = 0, limit: int = 100
    ) -> List[Skill]:
        """Get multiple skills by their IDs."""
        if not ids:
            return []
        return (
            db.query(self.model)
            .filter(Skill.id.in_(ids))
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def search(
        self, db: Session, *, query: str, skip: int = 0, limit: int = 100
    ) -> List[Skill]:
        """Search skills by name."""
        return (
            db.query(self.model)
            .filter(Skill.name.ilike(f"%{query}%"))
            .offset(skip)
            .limit(limit)
            .all()
        )


class CRUDUserSkill(CRUDBase[UserSkill, UserSkillCreate, UserSkillUpdate]):
    """CRUD operations for UserSkill model."""
    
    def get_by_user_and_skill(
        self, db: Session, *, user_id: int, skill_id: int
    ) -> Optional[UserSkill]:
        """Get a user's skill by user ID and skill ID."""
        return (
            db.query(UserSkill)
            .filter(UserSkill.user_id == user_id, UserSkill.skill_id == skill_id)
            .first()
        )
    
    def get_multi_by_user(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[UserSkill]:
        """Get all skills for a specific user."""
        return (
            db.query(UserSkill)
            .filter(UserSkill.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def create_with_user_and_skill(
        self, db: Session, *, user_id: int, skill_id: int, proficiency: int
    ) -> UserSkill:
        """Create a new user-skill relationship."""
        db_obj = UserSkill(
            user_id=user_id,
            skill_id=skill_id,
            proficiency=proficiency,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update_proficiency(
        self, db: Session, *, db_obj: UserSkill, proficiency: int
    ) -> UserSkill:
        """Update a user's skill proficiency."""
        return self.update(
            db, db_obj=db_obj, obj_in={"proficiency": proficiency}
        )


# Create singleton instances
skill = CRUDSkill(Skill)
user_skill = CRUDUserSkill(UserSkill)

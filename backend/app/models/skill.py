"""
SQLAlchemy models for skills.
"""
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Skill(Base):
    """Skill model for storing skill information."""
    
    __tablename__ = "skill"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    
    # Relaciones
    users = relationship("UserSkill", back_populates="skill")
    projects = relationship("Project", secondary="project_skill", back_populates="skills")
    
    def __repr__(self):
        return f"<Skill {self.name}>"


class UserSkill(Base):
    """Association table for user skills with proficiency level."""
    
    __tablename__ = "user_skill"
    
    user_id = Column(Integer, ForeignKey("user.id"), primary_key=True)
    skill_id = Column(Integer, ForeignKey("skill.id"), primary_key=True)
    proficiency = Column(Integer, default=1)  # 1-5 scale
    
    # Relaciones
    user = relationship("User", back_populates="skills")
    skill = relationship("Skill", back_populates="users")
    
    def __repr__(self):
        return f"<UserSkill user_id={self.user_id} skill_id={self.skill_id} proficiency={self.proficiency}>"

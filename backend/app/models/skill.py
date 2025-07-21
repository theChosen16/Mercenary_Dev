"""SQLAlchemy models for skills and user skill associations."""
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Skill(Base):
    """Skill model for storing skill information."""

    __tablename__ = "skill"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)

    # Relationships
    users = relationship("UserSkill", back_populates="skill")
    projects = relationship(
        "Project",
        secondary="project_skill",
        back_populates="skills"
    )

    def __repr__(self) -> str:
        return f"<Skill {self.name}>"


class UserSkill(Base):
    """Association table for user skills with proficiency level."""

    __tablename__ = "user_skill"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    skill_id = Column(Integer, ForeignKey("skill.id"), primary_key=True)
    proficiency = Column(Integer, default=1)  # 1-5 scale

    # Relationships
    user = relationship("User", back_populates="skills")
    skill = relationship("Skill", back_populates="users")

    def __repr__(self) -> str:
        return (
            f"<UserSkill user_id={self.user_id} "
            f"skill_id={self.skill_id} "
            f"proficiency={self.proficiency}>"
        )

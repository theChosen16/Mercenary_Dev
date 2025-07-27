"""
Modelo de Usuario simplificado para resolver errores de mapeo.
"""
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import EmailStr
from sqlalchemy import Boolean, Column, DateTime, Enum as SAEnum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, Session

from app.db.base_class import Base

class UserRole(str, Enum):
    """Roles de usuario."""
    CLIENT = "client"
    FREELANCER = "freelancer"
    ADMIN = "admin"

class User(Base):
    """Modelo de Usuario simplificado."""
    __tablename__ = "users"

    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    email: Mapped[EmailStr] = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = Column(String(255), nullable=False)
    is_active: Mapped[bool] = Column(Boolean, default=True)
    role: Mapped[UserRole] = Column(SAEnum(UserRole), nullable=False)
    created_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"

def get_user_by_email(db: Session, email: EmailStr) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

# Modelo temporal mínimo para evitar errores de mapeo de SQLAlchemy
class UserSkill(Base):
    """Modelo temporal para mapear tabla existente user_skill."""
    __tablename__ = "user_skill"

    user_id: Mapped[int] = Column(Integer, ForeignKey("users.id"), primary_key=True)
    skill_id: Mapped[int] = Column(Integer, ForeignKey("skill.id"), primary_key=True)
    proficiency: Mapped[int] = Column(Integer, default=1)

    def __repr__(self) -> str:
        return f"<UserSkill user_id={self.user_id} skill_id={self.skill_id}>"

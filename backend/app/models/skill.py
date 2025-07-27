"""
Modelo de Skill simplificado.
"""
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Mapped

from app.db.base_class import Base

class Skill(Base):
    """Modelo de Skill simplificado."""
    __tablename__ = "skill"

    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    name: Mapped[str] = Column(String(100), unique=True, index=True, nullable=False)

    def __repr__(self) -> str:
        return f"<Skill {self.name}>"

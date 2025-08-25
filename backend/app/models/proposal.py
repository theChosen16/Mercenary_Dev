from __future__ import annotations
"""
SQLAlchemy models for project proposals.
"""
from datetime import datetime

from enum import Enum as EnumType
from typing import Optional

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship, Mapped

from app.db.base_class import Base

class ProposalStatus(EnumType):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    withdrawn = "withdrawn"


class Proposal(Base):
    """Proposal model for storing project proposals from freelancers."""
    
    __tablename__ = "proposal"
    
    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    cover_letter: Mapped[str] = Column(Text, nullable=False)
    bid_amount: Mapped[int] = Column(Integer, nullable=False)
    estimated_days: Mapped[Optional[int]] = Column(Integer, nullable=True)
    status: Mapped[ProposalStatus] = Column(Enum(ProposalStatus), default=ProposalStatus.pending, nullable=False)
    created_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relaciones
    project_id: Mapped[int] = Column(Integer, ForeignKey("projects.id"), nullable=False)
    project: Mapped["Project"] = relationship("Project", back_populates="proposals")
    
    mercenary_id: Mapped[int] = Column(Integer, ForeignKey("users.id"), nullable=False)
    mercenary: Mapped["User"] = relationship("User", back_populates="proposals")
    
    def __repr__(self):
        return f"<Proposal {self.id} for Project {self.project_id}>"

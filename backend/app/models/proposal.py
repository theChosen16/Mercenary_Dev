"""
SQLAlchemy models for project proposals.
"""
from datetime import datetime
from enum import Enum as EnumType

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class ProposalStatus(EnumType):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    withdrawn = "withdrawn"


class Proposal(Base):
    """Proposal model for storing project proposals from freelancers."""
    
    __tablename__ = "proposal"
    
    id = Column(Integer, primary_key=True, index=True)
    cover_letter = Column(Text, nullable=False)
    bid_amount = Column(Integer, nullable=False)
    estimated_days = Column(Integer, nullable=True)
    status = Column(Enum(ProposalStatus), default=ProposalStatus.pending, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relaciones
    project_id = Column(Integer, ForeignKey("project.id"), nullable=False)
    project = relationship("Project", back_populates="proposals")
    
    freelancer_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    freelancer = relationship("User", back_populates="proposals")
    
    def __repr__(self):
        return f"<Proposal {self.id} for Project {self.project_id}>"

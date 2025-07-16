"""
CRUD operations for Proposal model.
"""
from typing import List, Optional

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.proposal import Proposal, ProposalStatus
from app.schemas.proposal import ProposalCreate, ProposalUpdate


class CRUDProposal(CRUDBase[Proposal, ProposalCreate, ProposalUpdate]):
    """CRUD operations for Proposal model."""
    
    def get_multi_by_project(
        self, db: Session, *, project_id: int, skip: int = 0, limit: int = 100
    ) -> List[Proposal]:
        """Get all proposals for a specific project."""
        return (
            db.query(self.model)
            .filter(Proposal.project_id == project_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_multi_by_freelancer(
        self, db: Session, *, freelancer_id: int, skip: int = 0, limit: int = 100
    ) -> List[Proposal]:
        """Get all proposals from a specific freelancer."""
        return (
            db.query(self.model)
            .filter(Proposal.freelancer_id == freelancer_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def create_with_freelancer(
        self, db: Session, *, obj_in: ProposalCreate, freelancer_id: int
    ) -> Proposal:
        """Create a new proposal for a freelancer."""
        db_obj = Proposal(
            cover_letter=obj_in.cover_letter,
            bid_amount=obj_in.bid_amount,
            estimated_days=obj_in.estimated_days,
            status=obj_in.status,
            project_id=obj_in.project_id,
            freelancer_id=freelancer_id,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update_status(
        self, db: Session, *, db_obj: Proposal, status: str
    ) -> Proposal:
        """Update proposal status."""
        return self.update(db, db_obj=db_obj, obj_in={"status": status})
    
    def accept(self, db: Session, *, db_obj: Proposal) -> Proposal:
        """Accept a proposal."""
        # Update the proposal status
        proposal = self.update_status(db, db_obj=db_obj, status=ProposalStatus.accepted)
        
        # Update the project to assign the freelancer
        from app.crud.project import project
        project.assign_freelancer(
            db, db_obj=db_obj.project, freelancer_id=db_obj.freelancer_id
        )
        
        # Reject all other proposals for this project
        self.reject_other_proposals(db, project_id=db_obj.project_id, current_proposal_id=db_obj.id)
        
        return proposal
    
    def reject_other_proposals(
        self, db: Session, *, project_id: int, current_proposal_id: int
    ) -> None:
        """Reject all other proposals for a project."""
        db.query(self.model).filter(
            Proposal.project_id == project_id,
            Proposal.id != current_proposal_id,
            Proposal.status == ProposalStatus.pending
        ).update({"status": ProposalStatus.rejected}, synchronize_session=False)
        db.commit()


# Create a singleton instance
proposal = CRUDProposal(Proposal)

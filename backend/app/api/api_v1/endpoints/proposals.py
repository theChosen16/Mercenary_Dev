"""
Endpoints for proposal management.
"""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.models.proposal import ProposalStatus

router = APIRouter()


@router.get("/", response_model=List[schemas.Proposal])
def read_proposals(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve proposals.
    """
    if crud.user.is_superuser(current_user):
        proposals = crud.proposal.get_multi(db, skip=skip, limit=limit)
    else:
        # Users can only see their own proposals or proposals for their projects
        proposals = crud.proposal.get_multi_by_freelancer(
            db=db, freelancer_id=current_user.id, skip=skip, limit=limit
        )
        
        # Add proposals for projects owned by the user
        if current_user.role == "offerer":
            project_proposals = []
            for project in current_user.client_projects:
                project_proposals.extend(project.proposals)
            
            # Combine and deduplicate proposals
            proposal_ids = {p.id for p in proposals}
            for p in project_proposals:
                if p.id not in proposal_ids:
                    proposals.append(p)
                    proposal_ids.add(p.id)
    
    return proposals


@router.post("/", response_model=schemas.Proposal, status_code=status.HTTP_201_CREATED)
def create_proposal(
    *,
    db: Session = Depends(deps.get_db),
    proposal_in: schemas.ProposalCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new proposal.
    """
    # Only freelancers can create proposals
    if current_user.role != "mercenary":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only freelancers can create proposals",
        )
    
    # Check if project exists
    project = crud.project.get(db, id=proposal_in.project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    # Check if project is open for proposals
    if project.status != "published":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project is not open for proposals",
        )
    
    # Check if user already has a proposal for this project
    existing_proposal = db.query(models.Proposal).filter(
        models.Proposal.project_id == proposal_in.project_id,
        models.Proposal.freelancer_id == current_user.id
    ).first()
    
    if existing_proposal:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted a proposal for this project",
        )
    
    # Create the proposal
    proposal = crud.proposal.create_with_freelancer(
        db=db, obj_in=proposal_in, freelancer_id=current_user.id
    )
    return proposal


@router.get("/{proposal_id}", response_model=schemas.Proposal)
def read_proposal(
    *,
    db: Session = Depends(deps.get_db),
    proposal_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get proposal by ID.
    """
    proposal = crud.proposal.get(db, id=proposal_id)
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proposal not found",
        )
    
    # Only the proposal owner, project owner, or admin can view the proposal
    if not crud.user.is_superuser(current_user) and \
       proposal.freelancer_id != current_user.id and \
       proposal.project.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    return proposal


@router.put("/{proposal_id}/accept", response_model=schemas.Proposal)
def accept_proposal(
    *,
    db: Session = Depends(deps.get_db),
    proposal_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Accept a proposal.
    """
    proposal = crud.proposal.get(db, id=proposal_id)
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proposal not found",
        )
    
    # Only the project owner or admin can accept a proposal
    if not crud.user.is_superuser(current_user) and proposal.project.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Only pending proposals can be accepted
    if proposal.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot accept a {proposal.status} proposal",
        )
    
    # Accept the proposal
    proposal = crud.proposal.accept(db, db_obj=proposal)
    return proposal


@router.put("/{proposal_id}/reject", response_model=schemas.Proposal)
def reject_proposal(
    *,
    db: Session = Depends(deps.get_db),
    proposal_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Reject a proposal.
    """
    proposal = crud.proposal.get(db, id=proposal_id)
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proposal not found",
        )
    
    # Only the project owner, proposal owner, or admin can reject a proposal
    if not crud.user.is_superuser(current_user) and \
       proposal.project.client_id != current_user.id and \
       proposal.freelancer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Only pending proposals can be rejected
    if proposal.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject a {proposal.status} proposal",
        )
    
    # Reject the proposal
    proposal = crud.proposal.update_status(
        db, db_obj=proposal, status=ProposalStatus.rejected
    )
    return proposal


@router.put("/{proposal_id}/withdraw", response_model=schemas.Proposal)
def withdraw_proposal(
    *,
    db: Session = Depends(deps.get_db),
    proposal_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Withdraw a proposal.
    """
    proposal = crud.proposal.get(db, id=proposal_id)
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proposal not found",
        )
    
    # Only the proposal owner or admin can withdraw a proposal
    if not crud.user.is_superuser(current_user) and proposal.freelancer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Only pending proposals can be withdrawn
    if proposal.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot withdraw a {proposal.status} proposal",
        )
    
    # Withdraw the proposal
    proposal = crud.proposal.update_status(
        db, db_obj=proposal, status=ProposalStatus.withdrawn
    )
    return proposal

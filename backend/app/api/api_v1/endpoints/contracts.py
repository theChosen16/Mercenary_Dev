"""
Endpoints for contract management.
"""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()


@router.post("/", response_model=schemas.Contract, status_code=status.HTTP_201_CREATED)
def create_contract(
    *,
    db: Session = Depends(deps.get_db),
    contract_in: schemas.ContractCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Create a new contract. The current user is the offerer."""
    announcement = crud.announcement.get(db, id=contract_in.announcement_id)
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found"
        )
    if announcement.offerer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create contracts for your own announcements.",
        )

    contract = crud.contract.create_with_users(
        db,
        obj_in=contract_in,
        offerer_id=current_user.id,
        mercenary_id=contract_in.mercenary_id,
    )
    return contract


@router.get("/", response_model=List[schemas.Contract])
def read_contracts(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Retrieve contracts for the current user (both as offerer and mercenary)."""
    contracts = crud.contract.get_multi_by_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    return contracts


@router.get("/{contract_id}", response_model=schemas.Contract)
def read_contract(
    *,
    db: Session = Depends(deps.get_db),
    contract_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Get a specific contract by ID."""
    contract = crud.contract.get(db, id=contract_id)
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found"
        )
    if (
        contract.offerer_id != current_user.id
        and contract.mercenary_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this contract.",
        )
    return contract


@router.put("/{contract_id}", response_model=schemas.Contract)
def update_contract(
    *,
    db: Session = Depends(deps.get_db),
    contract_id: int,
    contract_in: schemas.ContractUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Update a contract. Only the offerer can update it."""
    contract = crud.contract.get(db, id=contract_id)
    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found"
        )
    if contract.offerer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the offerer can update the contract.",
        )
    contract = crud.contract.update(db, db_obj=contract, obj_in=contract_in)
    return contract

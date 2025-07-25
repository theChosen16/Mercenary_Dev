"""
CRUD operations for the Contract model.
"""
from typing import List

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.contract import Contract
from app.schemas.contract import ContractCreate, ContractUpdate


class CRUDContract(CRUDBase[Contract, ContractCreate, ContractUpdate]):
    def create_with_users(
        self, db: Session, *, obj_in: ContractCreate, offerer_id: int, mercenary_id: int
    ) -> Contract:
        """Create a new contract linked to an offerer and a mercenary."""
        db_obj = self.model(
            **obj_in.dict(), offerer_id=offerer_id, mercenary_id=mercenary_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_user(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Contract]:
        """Retrieve contracts for a specific user (either as offerer or mercenary)."""
        return (
            db.query(self.model)
            .filter((Contract.offerer_id == user_id) | (Contract.mercenary_id == user_id))
            .offset(skip)
            .limit(limit)
            .all()
        )


contract = CRUDContract(Contract)

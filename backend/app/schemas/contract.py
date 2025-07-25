"""
Pydantic schemas for Contracts and Transactions.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field

from app.models.contract import ContractStatus, TransactionType


# --- Transaction Schemas ---
class TransactionBase(BaseModel):
    """Base schema for a transaction."""
    amount: Decimal = Field(..., gt=0, description="The amount of the transaction")
    transaction_type: TransactionType
    notes: Optional[str] = None


class TransactionCreate(TransactionBase):
    """Schema for creating a transaction."""
    contract_id: int


class Transaction(TransactionBase):
    """Schema for representing a transaction in API responses."""
    id: int
    status: str
    processed_at: Optional[datetime]

    class Config:
        from_attributes = True


# --- Contract Schemas ---
class ContractBase(BaseModel):
    """Base schema for a contract."""
    title: str = Field(..., max_length=255)
    description: str
    terms: Optional[str] = None
    amount: Decimal = Field(..., gt=0, description="Total amount for the contract")
    announcement_id: int


class ContractCreate(ContractBase):
    """Schema for creating a new contract."""
    mercenary_id: int


class ContractUpdate(BaseModel):
    """Schema for updating a contract."""
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    terms: Optional[str] = None
    amount: Optional[Decimal] = Field(None, gt=0)
    status: Optional[ContractStatus] = None


class ContractInDBBase(ContractBase):
    """Base schema for contract data stored in the database."""
    id: int
    offerer_id: int
    mercenary_id: int
    status: ContractStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Contract(ContractInDBBase):
    """Schema for representing a contract in API responses."""
    transactions: list[Transaction] = []


class ContractInDB(ContractInDBBase):
    """Schema for contract data as stored in the database."""
    pass

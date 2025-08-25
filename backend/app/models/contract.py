"""
Modelo de Contrato (Contract).

Define la estructura de los contratos entre oferentes y mercenarios,
incluyendo el depósito en garantía (escrow) y los términos del acuerdo.
"""
from __future__ import annotations
from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import List, Optional

from sqlalchemy import (
    UUID,
    Column,
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, relationship

from app.db.base_class import Base
from .user import User
# from .announcement import Announcement  # Circular import - using forward reference instead
# from .transaction import Transaction

class ContractStatus(str, Enum):
    """Enumeración de estados de un contrato."""
    DRAFT = "draft"  # Borrador, aún no aceptado
    PENDING = "pending"  # Aceptado, esperando pago
    ACTIVE = "active"  # Pago recibido, trabajo en progreso
    COMPLETED = "completed"  # Trabajo completado y pagado
    DISPUTED = "disputed"  # En disputa
    CANCELLED = "cancelled"  # Cancelado
    REFUNDED = "refunded"  # Reembolsado al oferente


class Contract(Base):
    """Modelo de contrato entre oferente y mercenario.

    Atributos:
        title: Título del contrato.
        description: Descripción detallada del trabajo acordado.
        terms: Términos y condiciones del contrato.
        amount: Monto total del contrato.
        status: Estado actual del contrato.
        offerer_id: ID del usuario oferente.
        mercenary_id: ID del usuario mercenario.
        announcement_id: ID del anuncio relacionado.
        created_at: Fecha de creación del contrato.
        updated_at: Fecha de última actualización.
        completed_at: Fecha de finalización del contrato.
        transactions: Lista de transacciones relacionadas con el contrato.
    """
    __tablename__ = "contracts"

    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    title: Mapped[str] = Column(String(255), nullable=False)
    description: Mapped[str] = Column(Text, nullable=False)
    terms: Mapped[Optional[str]] = Column(Text, nullable=True)
    amount: Mapped[Decimal] = Column(Numeric(10, 2), nullable=False)
    status: Mapped[str] = Column(
        SQLEnum(ContractStatus),
        default=ContractStatus.DRAFT,
        nullable=False,
        index=True
    )
    
    # Relaciones
    offerer_id: Mapped[int] = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    mercenary_id: Mapped[int] = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    announcement_id: Mapped[UUID] = Column(UUID(as_uuid=True), ForeignKey("announcements.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Fechas
    created_at: Mapped[datetime] = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
    updated_at: Mapped[datetime] = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )
    completed_at: Mapped[Optional[datetime]] = Column(DateTime, nullable=True)
    
    # Relaciones ORM (temporalmente desactivadas para resolver errores de mapeo)
    # offerer: Mapped[User] = relationship(
    #     User,
    #     foreign_keys=[offerer_id],
    #     back_populates="contracts_as_offerer"
    # )
    # mercenary: Mapped[User] = relationship(
    #     User,
    #     foreign_keys=[mercenary_id],
    #     back_populates="contracts_as_mercenary"
    # )
    announcement: Mapped["Announcement"] = relationship("Announcement", back_populates="contracts")
    transactions: Mapped[List["Transaction"]] = relationship(
        back_populates="contract",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Contract(id={self.id}, title='{self.title}', status='{self.status}')>"


class TransactionType(str, Enum):
    """Tipos de transacciones."""
    DEPOSIT = "deposit"  # Depósito en garantía
    RELEASE = "release"  # Liberación de fondos al mercenario
    REFUND = "refund"  # Reembolso al oferente
    FEE = "fee"  # Comisión de la plataforma


class Transaction(Base):
    """Modelo de transacción financiera.
    
    Registra los movimientos de dinero relacionados con un contrato,
    incluyendo depósitos, liberaciones y reembolsos.
    
    Atributos:
        amount: Monto de la transacción.
        transaction_type: Tipo de transacción.
        status: Estado de la transacción (pending, completed, failed).
        contract_id: ID del contrato relacionado.
        processed_at: Fecha en que se procesó la transacción.
        notes: Notas adicionales sobre la transacción.
    """
    __tablename__ = "transactions"
    
    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    amount: Mapped[Decimal] = Column(Numeric(10, 2), nullable=False)
    transaction_type: Mapped[str] = Column(
        SQLEnum(TransactionType),
        nullable=False,
        index=True
    )
    status: Mapped[str] = Column(
        String(20),
        default="pending",
        nullable=False,
        index=True
    )
    contract_id: Mapped[UUID] = Column(UUID(as_uuid=True), ForeignKey("contracts.id", ondelete="CASCADE"), nullable=False, index=True)
    processed_at: Mapped[Optional[datetime]] = Column(DateTime, nullable=True)
    notes: Mapped[Optional[str]] = Column(Text, nullable=True)
    
    # Relación con el contrato
    contract: Mapped[Contract] = relationship("Contract", back_populates="transactions")
    
    def __repr__(self) -> str:
        return f"<Transaction(id={self.id}, type='{self.transaction_type}', amount={self.amount})>"

"""
Modelo de Reseña (Review).

Define la estructura de las calificaciones y reseñas que los usuarios se dejan.
"""
from __future__ import annotations
from typing import Optional
from uuid import UUID

from sqlalchemy import Column, ForeignKey, Integer, Text, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, relationship, Session

from app.db.base_class import Base
# from app.models.announcement import Announcement  # Circular import - using forward reference instead
from app.models.user import User


class Review(Base):
    """Modelo de reseña entre usuarios.

    Atributos:
        rating: Calificación del 1 al 5.
        comment: Comentario opcional.
        announcement_id: ID del anuncio relacionado.
        reviewer_id: ID del usuario que deja la reseña.
        reviewee_id: ID del usuario que recibe la reseña.
        created_at: Fecha de creación de la reseña.
    """
    __tablename__ = "reviews"
    __table_args__ = (
        CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating_range'),
    )

    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    rating: Mapped[int] = Column(Integer, nullable=False)
    comment: Mapped[Optional[str]] = Column(Text, nullable=True)
    
    # Relaciones
    announcement_id: Mapped[UUID] = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("announcements.id", ondelete="CASCADE"),
        nullable=False,
        unique=True
    )
    reviewer_id: Mapped[int] = Column(
        Integer, 
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False
    )
    reviewee_id: Mapped[int] = Column(
        Integer, 
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False
    )
    
    # Configuración de relaciones con otros modelos
    announcement: Mapped["Announcement"] = relationship("Announcement", back_populates="reviews")
    reviewer: Mapped[User] = relationship(User, foreign_keys=[reviewer_id], back_populates="reviews_written")
    reviewee: Mapped[User] = relationship(User, foreign_keys=[reviewee_id], back_populates="reviews_received")

    def __repr__(self) -> str:
        return f"<Review(id={self.id}, rating={self.rating}, announcement_id={self.announcement_id})>"

    @classmethod
    def create(
        cls,
        db: "Session",
        announcement_id: int,
        reviewer_id: int,
        reviewee_id: int,
        rating: int,
        comment: Optional[str] = None,
    ) -> "Review":
        """Crea una nueva reseña en la base de datos.

        Args:
            db: Sesión de base de datos.
            announcement_id: ID del anuncio relacionado.
            reviewer_id: ID del usuario que deja la reseña.
            reviewee_id: ID del usuario que recibe la reseña.
            rating: Calificación del 1 al 5.
            comment: Comentario opcional.

        Returns:
            Review: La reseña creada.
        """
        review = cls(
            announcement_id=announcement_id,
            reviewer_id=reviewer_id,
            reviewee_id=reviewee_id,
            rating=rating,
            comment=comment,
        )
        db.add(review)
        db.commit()
        db.refresh(review)
        return review

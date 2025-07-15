"""
Modelo de Reseña (Review).

Define la estructura de las calificaciones y reseñas que los usuarios se dejan.
"""
from typing import Optional

from sqlalchemy import Column, ForeignKey, Integer, Text, CheckConstraint
from sqlalchemy.orm import Mapped, relationship, Session

from app.models.base import Base


class Review(Base):
    """Modelo de reseña entre usuarios.

    Atributos:
        rating: Calificación del 1 al 5.
        comment: Comentario opcional.
        job_id: ID del trabajo relacionado.
        reviewer_id: ID del usuario que deja la reseña.
        reviewee_id: ID del usuario que recibe la reseña.
        created_at: Fecha de creación de la reseña.
    """
    __tablename__ = "reviews"
    __table_args__ = (
        CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating_range'),
    )

    rating: Mapped[int] = Column(Integer, nullable=False)
    comment: Mapped[Optional[str]] = Column(Text, nullable=True)
    
    # Relaciones
    job_id: Mapped[int] = Column(
        Integer, 
        ForeignKey("jobs.id", ondelete="CASCADE"), 
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
    
    # Configuración de relaciones
    job: Mapped["Job"] = relationship(
        "Job", 
        back_populates="review"
    )
    reviewer: Mapped["User"] = relationship(
        "User", 
        back_populates="reviews_given", 
        foreign_keys=[reviewer_id]
    )
    reviewee: Mapped["User"] = relationship(
        "User", 
        back_populates="reviews_received", 
        foreign_keys=[reviewee_id]
    )

    def __repr__(self) -> str:
        return f"<Review(id={self.id}, rating={self.rating}, job_id={self.job_id})>"

    @classmethod
    def create(
        cls,
        db: "Session",
        job_id: int,
        reviewer_id: int,
        reviewee_id: int,
        rating: int,
        comment: Optional[str] = None,
    ) -> "Review":
        """Crea una nueva reseña en la base de datos.

        Args:
            db: Sesión de base de datos.
            job_id: ID del trabajo relacionado.
            reviewer_id: ID del usuario que deja la reseña.
            reviewee_id: ID del usuario que recibe la reseña.
            rating: Calificación del 1 al 5.
            comment: Comentario opcional.

        Returns:
            Review: La reseña creada.
        """
        review = cls(
            job_id=job_id,
            reviewer_id=reviewer_id,
            reviewee_id=reviewee_id,
            rating=rating,
            comment=comment,
        )
        db.add(review)
        db.commit()
        db.refresh(review)
        return review

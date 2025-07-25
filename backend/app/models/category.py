"""
Modelo de Categoría.

Define las categorías a las que pueden pertenecer los anuncios.
"""
from typing import List
from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import Mapped, relationship

from app.models.base import Base


class Category(Base):
    """Modelo de categoría para los anuncios.

    Atributos:
        id: Identificador único de la categoría.
        name: Nombre de la categoría (ej: "Desarrollo Web", "Diseño Gráfico").
    """
    __tablename__ = "categories"

    id: Mapped[int] = Column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = Column(String(100), unique=True, nullable=False, index=True)

    # Relación uno a muchos con anuncios
    announcements: Mapped[List["Announcement"]] = relationship(
        "Announcement",
        back_populates="category"
    )

    def __repr__(self) -> str:
        return f"<Category(id={self.id}, name='{self.name}')>"

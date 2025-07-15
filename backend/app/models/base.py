"""Módulo base para modelos de la base de datos.

Contiene la clase Base de la que heredarán todos los modelos y utilidades comunes.
"""
"""Módulo base para modelos de la base de datos.

Contiene la clase Base de la que heredarán todos los modelos y utilidades comunes.
"""
from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import Column, DateTime, event
from sqlalchemy.ext.declarative import as_declarative
from sqlalchemy.orm import Mapped, Session, declared_attr, mapped_column
from sqlalchemy.dialects.postgresql import UUID as PG_UUID


# Configuración de eventos SQLAlchemy
@event.listens_for(Session, 'before_flush')
def set_timestamps(session, context, instances):
    """Actualiza automáticamente los timestamps antes de guardar."""
    for instance in session.new:
        if hasattr(instance, 'created_at'):
            instance.created_at = datetime.utcnow()
        if hasattr(instance, 'updated_at'):
            instance.updated_at = datetime.utcnow()
    
    for instance in session.dirty:
        if hasattr(instance, 'updated_at'):
            instance.updated_at = datetime.utcnow()


@as_declarative()
class Base:
    """Clase base abstracta para todos los modelos de la base de datos.

    Proporciona:
    - Atributos comunes (id, created_at, updated_at)
    - Métodos de utilidad
    """
    id: Any
    __name__: str

    # Campos comunes a todos los modelos
    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        index=True,
        nullable=False,
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    # Generar el nombre de la tabla a partir del nombre de la clase
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()

    def to_dict(self) -> dict[str, Any]:
        """Convierte el objeto a un diccionario."""
        return {
            c.name: getattr(self, c.name)
            for c in self.__table__.columns
        }

    def save(self, db: Session) -> None:
        """Guarda el objeto en la base de datos."""
        db.add(self)
        db.commit()
        db.refresh(self)

    def delete(self, db: Session) -> None:
        """Elimina el objeto de la base de datos."""
        db.delete(self)
        db.commit()

    @classmethod
    def get(cls, db: Session, id: Any) -> 'Base | None':
        """Obtiene un objeto por su ID."""
        return db.query(cls).filter(cls.id == id).first()

    @classmethod
    def get_all(
        cls, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100
    ) -> list['Base']:
        """Obtiene todos los objetos con paginación."""
        return db.query(cls).offset(skip).limit(limit).all()

    def update(self, db: Session, **kwargs: Any) -> None:
        """Actualiza los atributos del modelo.

        Args:
            db: Sesión de base de datos.
            **kwargs: Atributos a actualizar.
        """
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
        db.commit()
        db.refresh(self)


# Configuración de eventos para actualización de timestamps
@event.listens_for(Base, 'before_update')
def receive_before_update(mapper, connection, target):
    """Actualiza automáticamente el campo updated_at."""
    target.updated_at = datetime.utcnow()

@event.listens_for(Base, 'before_update', propagate=True)
def timestamp_before_update(mapper: Any, connection: Any, target: Any) -> None:
    """Actualiza el campo updated_at antes de una actualización."""
    target.updated_at = datetime.utcnow()

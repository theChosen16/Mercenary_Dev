"""
Base class for SQLAlchemy models.
"""
from typing import Any

from sqlalchemy import MetaData
from sqlalchemy.orm import declarative_base, registry, declared_attr


# Create a registry for better mapper configuration
mapper_registry = registry()
Base = mapper_registry.generate_base()

class BaseModel(Base):
    """Base class for all SQLAlchemy models."""
    __abstract__ = True
    
    id: Any
    __name__: str
    
    # Generate __tablename__ automatically
    @declared_attr
    def __tablename__(cls) -> str:
        """Generate table name from class name."""
        return cls.__name__.lower()

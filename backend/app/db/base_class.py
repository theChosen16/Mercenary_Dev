"""
Base class for SQLAlchemy models.
"""
from typing import Any

from sqlalchemy.ext.declarative import as_declarative, declared_attr


@as_declarative()
class Base:
    """Base class for all SQLAlchemy models."""
    
    id: Any
    __name__: str
    
    # Generate __tablename__ automatically
    @declared_attr
    def __tablename__(cls) -> str:
        """Generate table name from class name."""
        return cls.__name__.lower()

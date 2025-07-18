"""
Módulo que maneja la configuración de la sesión de base de datos.
"""
from typing import Generator

from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings


# Configuración de la conexión a la base de datos
# Convertir la URL de la base de datos a string para SQLAlchemy
SQLALCHEMY_DATABASE_URL = str(settings.SQLALCHEMY_DATABASE_URI)

# Crear el motor de SQLAlchemy
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,  # Verifica la conexión antes de usarla
    pool_recycle=300,    # Recicla las conexiones después de 5 minutos
)

# Configurar la sesión de SQLAlchemy
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Metadatos para las migraciones
metadata = MetaData()

# Base para los modelos
Base = declarative_base(metadata=metadata)

def get_db() -> Generator[Session, None, None]:
    """
    Dependencia que proporciona una sesión de base de datos.
    La sesión se cierra automáticamente después de su uso.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Crea todas las tablas definidas en los modelos."""
    from app.models.base import Base  # Importación local para evitar dependencias circulares
    Base.metadata.create_all(bind=engine)

def drop_tables():
    """Elimina todas las tablas de la base de datos."""
    from app.models.base import Base  # Importación local para evitar dependencias circulares
    Base.metadata.drop_all(bind=engine)


if __name__ == "__main__":
    create_tables()

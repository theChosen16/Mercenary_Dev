from typing import Generator

from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings


# Configuración de la conexión a la base de datos
SQLALCHEMY_DATABASE_URL = str(settings.SQLALCHEMY_DATABASE_URI)

# Crear el motor de SQLAlchemy
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,  # Verifica la conexión antes de usarla
    pool_recycle=300,    # Recicla las conexiones después de 5 minutos
)

# Configurar la sesión de SQLAlchemy
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Configurar metadatos para las restricciones de clave foránea
metadata = MetaData()

# Configurar la base declarativa
Base = declarative_base(metadata=metadata)


def get_db() -> Generator[Session, None, None]:
    """
    Dependencia que proporciona una sesión de base de datos.
    La sesión se cierra automáticamente después de su uso.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


def create_tables():
    """Crea todas las tablas definidas en los modelos."""
    # Importar los modelos aquí para evitar importaciones circulares
    from . import models  # noqa: F401

    print("Creando tablas en la base de datos...")
    Base.metadata.create_all(bind=engine)
    print("Tablas creadas exitosamente.")


def drop_tables():
    """Elimina todas las tablas de la base de datos."""
    print("Eliminando todas las tablas...")
    Base.metadata.drop_all(bind=engine)
    print("Todas las tablas han sido eliminadas.")


if __name__ == "__main__":
    create_tables()

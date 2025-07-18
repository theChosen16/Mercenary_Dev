"""
Script para inicializar la base de datos.
Crea las tablas y datos iniciales necesarios.
"""
import os
import sys
from pathlib import Path

# Añadir el directorio raíz al path para importaciones
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

# Configurar la variable de entorno para el entorno de Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from sqlalchemy.orm import Session

from core.config import settings
from database import SessionLocal, engine, Base
from models.user import User, UserRole
from core.security import get_password_hash


def init_db() -> None:
    """Inicializa la base de datos con las tablas necesarias."""
    print("Creando tablas en la base de datos...")
    Base.metadata.create_all(bind=engine)
    print("¡Tablas creadas exitosamente!")


def create_initial_admin() -> None:
    """Crea un usuario administrador inicial si no existe."""
    db = SessionLocal()
    try:
        admin_email = "admin@mercenary.dev"
        admin = db.query(User).filter(User.email == admin_email).first()
        
        if not admin:
            admin = User(
                email=admin_email,
                hashed_password=get_password_hash("admin123"),
                is_active=True,
                role=UserRole.ADMIN,
                full_name="Administrador",
            )
            db.add(admin)
            db.commit()
            print("Usuario administrador creado exitosamente!")
        else:
            print("El usuario administrador ya existe.")
    except Exception as e:
        print(f"Error al crear el administrador: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Inicializando base de datos...")
    init_db()
    print("Creando usuario administrador...")
    create_initial_admin()
    print("¡Base de datos inicializada exitosamente!")

"""
Script para verificar la conexion a la base de datos.
"""
import os
import sys
from pathlib import Path

# Anadir el directorio raiz al path para importaciones
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

# Configurar la variable de entorno para el entorno de Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from sqlalchemy import text
from database import SessionLocal, engine


def check_db_connection():
    """Verifica la conexion a la base de datos."""
    print("Verificando conexion a la base de datos...")
    
    try:
        # Verificar conexion con el motor
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            if result.scalar() == 1:
                print("[OK] Conexion exitosa a la base de datos")
                return True
    except Exception as e:
        print(f"[ERROR] Error al conectar a la base de datos: {e}")
        return False


def check_tables():
    """Verifica que las tablas existan en la base de datos."""
    print("\nVerificando tablas en la base de datos...")
    
    try:
        with engine.connect() as connection:
            # Obtener la lista de tablas
            result = connection.execute(
                text(
                    """
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                    """
                )
            )
            tables = [row[0] for row in result]
            
            if tables:
                print("[OK] Tablas encontradas en la base de datos:")
                for table in tables:
                    print(f"   - {table}")
                return True
            else:
                print("[INFO] No se encontraron tablas en la base de datos.")
                return False
    except Exception as e:
        print(f"[ERROR] Error al verificar las tablas: {e}")
        return False


if __name__ == "__main__":
    print("Iniciando verificacion de la base de datos...")
    
    # Verificar conexion
    # Verificar conexión
    if check_db_connection():
        # Verificar tablas
        check_tables()
    
    print("\nVerificacion completada")

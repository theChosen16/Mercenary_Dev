import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Configuración de la consola para soportar caracteres Unicode
import codecs
sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

# Configuración por defecto
DEFAULT_CONFIG = {
    'POSTGRES_USER': 'postgres',
    'POSTGRES_PASSWORD': 'mercenary123',
    'POSTGRES_SERVER': 'localhost',
    'POSTGRES_PORT': '5432',
    'POSTGRES_DB': 'mercenary_db'
}

# Intentar importar la configuración del proyecto
try:
    # Asegurarse de que el directorio raíz esté en el path
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    # Intentar importar la configuración dinámicamente
    try:
        from app.core.config import settings
        print("Configuración importada correctamente.")
        
        # Obtener valores de configuración o usar valores por defecto
        config = {}
        for key, default in DEFAULT_CONFIG.items():
            try:
                config[key] = getattr(settings, key, default)
            except Exception as e:
                print(f"Advertencia: No se pudo obtener {key} de la configuración. Usando valor por defecto.")
                config[key] = default
                
        # Construir la URL de conexión
        DATABASE_URL = f"postgresql://{config['POSTGRES_USER']}:{config['POSTGRES_PASSWORD']}@{config['POSTGRES_SERVER']}:{config['POSTGRES_PORT']}/{config['POSTGRES_DB']}"
        
    except ImportError as e:
        print(f"No se pudo importar la configuración: {e}")
        print("Usando configuración por defecto...")
        DATABASE_URL = f"postgresql://{DEFAULT_CONFIG['POSTGRES_USER']}:{DEFAULT_CONFIG['POSTGRES_PASSWORD']}@{DEFAULT_CONFIG['POSTGRES_SERVER']}:{DEFAULT_CONFIG['POSTGRES_PORT']}/{DEFAULT_CONFIG['POSTGRES_DB']}"
        
except Exception as e:
    print(f"Error inesperado al cargar la configuración: {e}")
    print("Usando configuración por defecto...")
    DATABASE_URL = f"postgresql://{DEFAULT_CONFIG['POSTGRES_USER']}:{DEFAULT_CONFIG['POSTGRES_PASSWORD']}@{DEFAULT_CONFIG['POSTGRES_SERVER']}:{DEFAULT_CONFIG['POSTGRES_PORT']}/{DEFAULT_CONFIG['POSTGRES_DB']}"

def test_connection():
    try:
        print("\n=== Prueba de conexión a PostgreSQL ===")
        print(f"URL de conexión: {DATABASE_URL.split('@')[-1]}")
        
        # Crear motor de SQLAlchemy con configuración para manejar conexiones
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,  # Verifica la conexión antes de usarla
            pool_recycle=300     # Recicla las conexiones después de 5 minutos
        )
        
        # Probar la conexión
        with engine.connect() as connection:
            print("\n✅ Conexión exitosa a PostgreSQL!")
            
            # Obtener versión de PostgreSQL
            result = connection.execute(text("SELECT version();"))
            version = result.scalar()
            print(f"Versión de PostgreSQL: {version}")
            
            # Verificar si la base de datos existe
            db_name = DATABASE_URL.split('/')[-1].split('?')[0]
            result = connection.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :dbname"),
                {"dbname": db_name}
            )
            
            if result.scalar():
                print(f"✅ Base de datos '{db_name}' encontrada.")
                
                # Verificar tablas en la base de datos
                result = connection.execute(
                    text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
                )
                tables = [row[0] for row in result]
                
                if tables:
                    print("\nTablas encontradas en la base de datos:")
                    for table in tables:
                        print(f"- {table}")
                else:
                    print("\nNo se encontraron tablas en la base de datos.")
                
            else:
                print(f"\n⚠️  La base de datos '{db_name}' no existe.")
                print("Puedes crearla con el siguiente comando SQL:")
                print(f"CREATE DATABASE {db_name};")
            
            return True
            
    except Exception as e:
        print(f"\n❌ Error al conectar a la base de datos: {e}")
        print("\nSolución de problemas:")
        print("1. Verifica que PostgreSQL esté en ejecución.")
        print("2. Comprueba el nombre de usuario y contraseña en la configuración.")
        print("3. Asegúrate de que la base de datos exista o crea una nueva.")
        print("4. Verifica que el puerto sea el correcto (por defecto: 5432).")
        print(f"\nURL de conexión completa: {DATABASE_URL}")
        return False
        
    finally:
        if 'engine' in locals():
            engine.dispose()

if __name__ == "__main__":
    test_connection()

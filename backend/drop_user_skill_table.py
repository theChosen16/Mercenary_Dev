#!/usr/bin/env python3
"""
Script para eliminar la tabla user_skill problemática de la base de datos.
"""
import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Obtener la URL de la base de datos
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL no encontrada en las variables de entorno")
    sys.exit(1)

print(f"Conectando a la base de datos...")

try:
    # Crear conexión a la base de datos
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as connection:
        # Eliminar la tabla user_skill si existe
        print("Eliminando tabla user_skill...")
        connection.execute(text("DROP TABLE IF EXISTS user_skill CASCADE;"))
        connection.commit()
        print("✅ Tabla user_skill eliminada exitosamente")
        
        # Verificar que la tabla ya no existe
        result = connection.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'user_skill';
        """))
        
        if result.fetchone() is None:
            print("✅ Confirmado: La tabla user_skill ya no existe")
        else:
            print("❌ Error: La tabla user_skill aún existe")
            
except Exception as e:
    print(f"❌ Error al conectar o eliminar la tabla: {e}")
    sys.exit(1)

print("🎉 Script completado exitosamente")

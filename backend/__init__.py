"""
Paquete principal de la aplicación backend de Mercenary.

Este paquete contiene toda la lógica del servidor, incluyendo:
- Configuración de la base de datos
- Modelos de datos
- Rutas de la API
- Lógica de autenticación
- Utilidades varias
"""

# Importaciones principales para facilitar el acceso a los módulos comunes
from .database import Base, SessionLocal, engine, get_db  # noqa: F401
from .models import User, Project, Offer, Rating, Skill, Category  # noqa: F401
from .auth import (  # noqa: F401
    get_current_user,
    get_current_active_user,
    get_current_active_admin,
    create_access_token,
    create_refresh_token,
    authenticate_user,
    get_password_hash,
    verify_password
)

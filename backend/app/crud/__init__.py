"""
Módulo que contiene las operaciones CRUD para los modelos de la aplicación.
"""
from .base import CRUDBase
from .user import user

# Re-exportar las operaciones CRUD para que estén disponibles directamente desde app.crud
__all__ = ["user", "CRUDBase"]

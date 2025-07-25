"""
Módulo que contiene las operaciones CRUD para los modelos de la aplicación.
"""
from .base import CRUDBase
from .user import user
from .announcement import announcement
from .category import category
from .contract import contract

# Re-exportar las operaciones CRUD para que estén disponibles directamente desde app.crud
__all__ = ["user", "announcement", "category", "contract", "CRUDBase"]

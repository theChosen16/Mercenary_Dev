"""
Enrutador principal de la API v1.
"""
from fastapi import APIRouter

from app.api.api_v1.endpoints import auth, users

api_router = APIRouter()

# Incluir routers específicos
api_router.include_router(auth.router, prefix="/auth", tags=["autenticación"])
api_router.include_router(users.router, prefix="/users", tags=["usuarios"])

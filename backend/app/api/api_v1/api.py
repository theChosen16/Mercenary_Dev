"""
Enrutador principal de la API v1.
"""
from fastapi import APIRouter

from app.api.api_v1.endpoints import auth, users, jobs

api_router = APIRouter(prefix="/api/v1")

# Incluir routers específicos
api_router.include_router(auth.router, prefix="/auth", tags=["autenticación"])
api_router.include_router(users.router, prefix="/users", tags=["usuarios"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["trabajos"])

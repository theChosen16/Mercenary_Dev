"""
Punto de entrada principal de la aplicación FastAPI.
"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.api_v1.api import api_router
from app.core.config import settings
from app.db.session import engine
from app.models.base import Base

# Crear tablas en la base de datos (solo en desarrollo)
if settings.DEBUG:
    Base.metadata.create_all(bind=engine)

# Configuración de la aplicación FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API para la plataforma de freelancing Mercenary",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    """Endpoint raíz que devuelve información básica de la API."""
    return {
        "message": "Bienvenido a la API de Mercenary",
        "version": settings.VERSION,
        "docs": "/docs"
    }

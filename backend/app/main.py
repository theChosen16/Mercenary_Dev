"""Punto de entrada principal de la aplicación FastAPI."""
import logging
import sys
import traceback
from datetime import datetime
from typing import Any

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session  # noqa: F401

from app.api.api_v1.api import api_router
from app.core.config import settings
from app.db.session import engine
from app.models.base import Base

# Configurar logging detallado
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('debug.log')
    ]
)
logger = logging.getLogger(__name__)

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


@app.middleware("http")
async def catch_exceptions_middleware(
    request: Request,
    call_next: Any
) -> JSONResponse:
    """Middleware para capturar excepciones no manejadas.
    
    Args:
        request: Objeto de solicitud HTTP
        call_next: Función para llamar al siguiente middleware
        
    Returns:
        JSONResponse: Respuesta HTTP
    """
    request_id = f"{datetime.utcnow().timestamp()}-{id(request)}"
    logger.info("Request %s: %s %s", request_id, request.method, request.url)
    
    try:
        response = await call_next(request)
        logger.info(
            "Response %s: %s",
            request_id,
            response.status_code
        )
        return response
        
    except HTTPException as http_exc:
        logger.error(
            "HTTPException %s: %s - %s",
            request_id,
            http_exc.status_code,
            str(http_exc.detail)
        )
        logger.error("Traceback: %s", traceback.format_exc())
        return JSONResponse(
            status_code=http_exc.status_code,
            content={"detail": str(http_exc.detail)}
        )
        
    except Exception as e:
        error_msg = f"Unhandled exception in {request.method} {request.url}"
        logger.error("%s: %s", error_msg, str(e))
        logger.error("Traceback: %s", traceback.format_exc())
        
        # Capturar información detallada del error
        error_detail = {
            "error": str(e),
            "type": type(e).__name__,
            "path": request.url.path,
            "method": request.method,
            "traceback": traceback.format_exc()
        }
        
        # Log completo del error
        logger.error("Error details: %s", jsonable_encoder(error_detail))
        
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": "Internal Server Error",
                "error": str(e),
                "type": type(e).__name__
            }
        )


# Incluir routers
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root() -> dict[str, str]:
    """Endpoint raíz que devuelve información básica de la API.
    
    Returns:
        dict: Información básica de la API
    """
    return {
        "message": "Bienvenido a la API de Mercenary",
        "version": settings.VERSION,
        "docs": "/docs"
    }

from datetime import timedelta
from typing import Dict, Any

from fastapi import Depends, FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from . import models, schemas, crud, auth
from .database import SessionLocal, engine, get_db
from .config import settings

# Crear tablas en la base de datos (solo en desarrollo)
if settings.ENVIRONMENT == "development":
    models.Base.metadata.create_all(bind=engine)

# Configuración de la aplicación FastAPI
app = FastAPI(
    title="Mercenary API",
    description="API para la plataforma de freelancing Mercenary",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware para manejo de errores global
@app.middleware("http")
async def global_error_handler(request: Request, call_next):
    try:
        return await call_next(request)
    except HTTPException as http_exc:
        raise http_exc
    except Exception as exc:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Error interno del servidor"},
        )

# Rutas de autenticación
@app.post("/api/auth/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Obtiene un token de acceso para el usuario autenticado.
    
    Args:
        form_data: Datos del formulario con username/email y contraseña
        db: Sesión de base de datos
        
    Returns:
        Token de acceso JWT y tipo de token
        
    Raises:
        HTTPException: Si las credenciales son inválidas
    """
    user = auth.authenticate_user(
        db, 
        email=form_data.username if "@" in form_data.username else None,
        username=None if "@" in form_data.username else form_data.username,
        password=form_data.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Crear tokens de acceso y actualización
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    access_token = auth.create_access_token(
        subject=user.email,
        user_id=user.id,
        user_type=user.user_type,
        expires_delta=access_token_expires
    )
    
    refresh_token = auth.create_refresh_token(
        subject=user.email,
        user_id=user.id,
        expires_delta=refresh_token_expires
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)


@app.get("/users/me/", response_model=schemas.User)
def read_users_me(
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    return current_user


@app.get("/")
def read_root():
    return {"message": "¡El backend de Mercenary App está funcionando!"}

"""
Enrutador principal de la API v1.
"""
from fastapi import APIRouter

from app.api.api_v1.endpoints import auth, users, announcements, categories, contracts, payments

api_router = APIRouter()

# Incluir routers específicos
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(announcements.router, prefix="/announcements", tags=["Announcements"])
api_router.include_router(categories.router, prefix="/categories", tags=["Categories"])
api_router.include_router(contracts.router, prefix="/contracts", tags=["Contracts"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])

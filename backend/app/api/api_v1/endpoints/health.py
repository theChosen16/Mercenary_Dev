"""
Health check endpoints for monitoring the application status.
"""
from datetime import datetime
from typing import Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.core.config import settings

router = APIRouter()


@router.get("/health", response_model=Dict[str, Any])
async def health_check(
    db: Session = Depends(deps.get_db),
) -> Dict[str, Any]:
    """
    Health check endpoint that verifies the application and its dependencies are running.
    """
    # Check database connection
    try:
        db.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    # Check Redis connection (if used)
    try:
        # You would implement actual Redis check here
        redis_status = "healthy"
    except Exception as e:
        redis_status = f"unhealthy: {str(e)}"
    
    # Get application info
    app_info = {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "status": "healthy" if all([
            db_status == "healthy",
            redis_status == "healthy"
        ]) else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "checks": {
            "database": {
                "status": db_status,
                "details": {
                    "database": settings.POSTGRES_DB,
                    "host": settings.POSTGRES_SERVER,
                },
            },
            "redis": {
                "status": redis_status,
            },
            "storage": {
                "status": "healthy",  # Add actual storage check if needed
            },
        },
    }
    
    # If any critical service is down, return 503
    if app_info["status"] == "degraded":
        raise HTTPException(
            status_code=503,
            detail=app_info,
            headers={"Retry-After": "30"},
        )
    
    return app_info


@router.get("/health/live", status_code=204)
async def liveness_probe() -> None:
    """
    Liveness probe for Kubernetes.
    Returns 204 if the application is running.
    """
    return None


@router.get("/health/ready", status_code=204)
async def readiness_probe(
    db: Session = Depends(deps.get_db),
) -> None:
    """
    Readiness probe for Kubernetes.
    Returns 204 if the application is ready to receive traffic.
    """
    try:
        # Check database connection
        db.execute("SELECT 1")
        # Add other dependency checks here
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail={"status": "unhealthy", "reason": str(e)},
            headers={"Retry-After": "30"},
        )
    
    return None

import time
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.session import get_db

router = APIRouter(tags=["Health"])


@router.get("/health")
@router.get("/health/live")
def liveness_check():
    """Liveness probe confirming the FastAPI application process is running without database dependency."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "demo_mode": settings.DEMO_MODE,
        "llm_provider": settings.LLM_PROVIDER,
        "embedding_provider": settings.EMBEDDING_PROVIDER,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/health/ready")
def readiness_check(db: Session = Depends(get_db)):
    """Readiness probe confirming the application and its primary database are ready to serve traffic."""
    start_time = time.perf_counter()
    try:
        db.execute(text("SELECT 1")).scalar_one()
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return {
            "status": "ready",
            "app": settings.APP_NAME,
            "database": "connected",
            "latency_ms": latency_ms,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Application database is not ready or connection failed.",
        ) from exc


@router.get("/health/database")
def database_health(db: Session = Depends(get_db)):
    """Detailed connectivity check for the application database."""
    start_time = time.perf_counter()
    try:
        db.execute(text("SELECT 1")).scalar_one()
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return {
            "status": "connected",
            "latency_ms": latency_ms,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection probe failed.",
        ) from exc
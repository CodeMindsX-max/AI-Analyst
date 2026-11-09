from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.core.config import settings
from app.core.logging_config import logger
from app.core.exceptions import AnalystAIException
from app.api.router import api_router
from app.db.init_db import init_analytics_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup lifecycle:
      1. Verify PostgreSQL application DB is reachable.
      2. Ensure analytics schema + tables exist (idempotent, checkfirst=True).
      3. Do NOT auto-seed application data or run Alembic migrations.
         Run 'alembic upgrade head' and then 'python -m app.db.seed' manually.
    """
    logger.info("Starting AnalystAI Backend...")

    # 1. Verify application database connectivity
    try:
        from app.db.session import engine
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Application database (PostgreSQL) connection verified.")
    except Exception as e:
        logger.error(f"CRITICAL: Application database is unreachable: {e}")
        raise RuntimeError(
            "Cannot start AnalystAI: PostgreSQL application database is unreachable. "
            "Check DATABASE_URL in backend/.env and ensure Supabase is accessible."
        ) from e

    # 2. Initialize analytics schema and tables (safe, idempotent)
    try:
        init_analytics_db()
        logger.info("Analytics schema and business tables are ready.")
    except Exception as e:
        logger.error(f"Analytics schema initialization failed: {e}")
        # Non-fatal — application can still serve API requests
        logger.warning("Proceeding without analytics tables. Run seed script to populate.")

    logger.info(
        "AnalystAI Backend ready. "
        "If tables are missing, run: cd backend && python -m alembic upgrade head && python -m app.db.seed"
    )

    yield

    logger.info("AnalystAI Backend stopped.")


app = FastAPI(
    title="AnalystAI API",
    description="Agentic Business Intelligence & AI Business Data Analyst API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Custom exception handler
@app.exception_handler(AnalystAIException)
async def analystai_exception_handler(request: Request, exc: AnalystAIException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "code": exc.code,
            "extra": exc.extra,
        },
    )


# Mount API router
app.include_router(api_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to AnalystAI API. Explore OpenAPI documentation at /docs",
        "health": "/api/v1/health",
        "health_ready": "/api/v1/health/ready",
        "demo_mode": settings.DEMO_MODE,
        "database": "PostgreSQL (Supabase)",
    }

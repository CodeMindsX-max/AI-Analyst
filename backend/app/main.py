from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging_config import logger
from app.core.exceptions import AnalystAIException
from app.api.router import api_router
from app.db.seed import seed_all


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for application initialization."""
    logger.info("Starting AnalystAI Backend...")
    if settings.APP_ENV == "development" or settings.DEMO_MODE:
        try:
            # Seed local demo dataset when running in development/demo mode
            seed_all()
            logger.info("AnalystAI development demo dataset verified and ready.")
        except Exception as e:
            logger.warning(f"Database development seed encountered an issue: {e}")
    else:
        logger.info("Running in production mode. Database migrations must be managed via Alembic.")
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

# CORS configuration allowing frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Custom exception handler for uniform structured errors across the application
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


# Mount the v1 API router
app.include_router(api_router)


@app.get("/")
def root():
    """Root endpoint verifying API is live and pointing to documentation/health routes."""
    return {
        "message": "Welcome to AnalystAI API. Explore OpenAPI documentation at /docs",
        "health": "/api/v1/health",
        "health_ready": "/api/v1/health/ready",
        "demo_mode": settings.DEMO_MODE,
    }
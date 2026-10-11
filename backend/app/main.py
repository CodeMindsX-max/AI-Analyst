from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging_config import logger
from app.core.exceptions import AnalystAIException
from app.api.router import api_router
from app.db.seed import seed_all


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for database initialization and seeding."""
    logger.info("Starting AnalystAI Backend...")
    try:
        # Seed database idempotently on startup
        seed_all()
        logger.info("AnalystAI demo dataset verified.")
    except Exception as e:
        logger.error(f"Failed to initialize database on startup: {e}")
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

# Custom exception handler for uniform structured errors
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


# Mount main API router
app.include_router(api_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to AnalystAI API. Explore OpenAPI documentation at /docs",
        "health": "/api/v1/health",
        "demo_mode": settings.DEMO_MODE,
    }

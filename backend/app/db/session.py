from pathlib import Path
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings


def _resolve_db_url(db_url: str) -> str:
    """Resolve SQLite relative paths against BASE_DIR and ensure parent directories exist."""
    if db_url.startswith("sqlite:///./"):
        rel_path = db_url.replace("sqlite:///./", "")
        abs_path = settings.BASE_DIR / rel_path
        abs_path.parent.mkdir(parents=True, exist_ok=True)
        return f"sqlite:///{abs_path.as_posix()}"
    return db_url


APP_DB_URL = _resolve_db_url(settings.DATABASE_URL)
ANALYTICS_DB_URL = _resolve_db_url(settings.ANALYTICS_DATABASE_URL)

# 1. Primary Engine for Application Metadata Database (PostgreSQL / Supabase / SQLite dev fallback)
if "postgresql" in APP_DB_URL:
    engine = create_engine(
        APP_DB_URL,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        pool_recycle=300,
        echo=False,
    )
else:
    engine = create_engine(
        APP_DB_URL,
        connect_args={"check_same_thread": False} if "sqlite" in APP_DB_URL else {},
        echo=False,
    )

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)


# 2. Analytics Engine (Customer / Demo Analytics Database)
if "postgresql" in ANALYTICS_DB_URL:
    analytics_engine = create_engine(
        ANALYTICS_DB_URL,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        pool_recycle=300,
        echo=False,
    )
else:
    analytics_engine = create_engine(
        ANALYTICS_DB_URL,
        connect_args={"check_same_thread": False} if "sqlite" in ANALYTICS_DB_URL else {},
        echo=False,
    )

AnalyticsSessionLocal = sessionmaker(
    bind=analytics_engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)


def get_db() -> Generator[Session, None, None]:
    """Dependency providing an application metadata database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_analytics_db() -> Generator[Session, None, None]:
    """Dependency providing an analytical / demo warehouse database session."""
    db = AnalyticsSessionLocal()
    try:
        yield db
    finally:
        db.close()
from pathlib import Path
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

# Resolve SQLite DB absolute paths if relative
def _resolve_sqlite_url(db_url: str) -> str:
    if db_url.startswith("sqlite:///./"):
        rel_path = db_url.replace("sqlite:///./", "")
        abs_path = settings.BASE_DIR / rel_path
        abs_path.parent.mkdir(parents=True, exist_ok=True)
        return f"sqlite:///{abs_path.as_posix()}"
    return db_url

APP_DB_URL = _resolve_sqlite_url(settings.DATABASE_URL)
ANALYTICS_DB_URL = _resolve_sqlite_url(settings.ANALYTICS_DATABASE_URL)

# Engine for application metadata (users, runs, dashboards, reports, etc.)
engine = create_engine(
    APP_DB_URL,
    connect_args={"check_same_thread": False} if "sqlite" in APP_DB_URL else {},
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Engine for analytics data (read/write during seed, read-only during query execution)
analytics_engine = create_engine(
    ANALYTICS_DB_URL,
    connect_args={"check_same_thread": False} if "sqlite" in ANALYTICS_DB_URL else {},
    echo=False,
)

AnalyticsSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=analytics_engine)


def get_db() -> Generator[Session, None, None]:
    """Dependency for application metadata database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_analytics_db() -> Generator[Session, None, None]:
    """Dependency for analytics database session."""
    db = AnalyticsSessionLocal()
    try:
        yield db
    finally:
        db.close()

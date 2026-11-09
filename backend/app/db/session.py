"""
SQLAlchemy engine and session factories for AnalystAI.

Architecture:
  - Application Engine  → Supabase PostgreSQL, public schema (ApplicationBase)
  - Analytics Engine    → Supabase PostgreSQL, analytics schema (AnalyticsBase)

The analytics schema is a separate PostgreSQL schema within the same Supabase
database, keeping business data cleanly isolated from application metadata.
"""
from pathlib import Path
from typing import Generator

from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings


def _require_postgresql(url: str, label: str) -> str:
    """Fail fast if the given URL is not a PostgreSQL URL."""
    if url.startswith("sqlite"):
        raise RuntimeError(
            f"{label} is configured with SQLite ({url!r}). "
            "AnalystAI requires PostgreSQL (Supabase) for the application and analytics "
            "databases. Update DATABASE_URL in backend/.env to a postgresql+psycopg:// URL."
        )
    return url


APP_DB_URL = _require_postgresql(settings.DATABASE_URL, "DATABASE_URL")

# ---------------------------------------------------------------------------
# 1. Application Engine — public schema (Supabase PostgreSQL)
# ---------------------------------------------------------------------------
engine = create_engine(
    APP_DB_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    pool_recycle=300,
    echo=False,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)

# ---------------------------------------------------------------------------
# 2. Analytics Engine — analytics schema (same Supabase PostgreSQL database)
#
#    We reuse the same connection URL and restrict queries to the 'analytics'
#    PostgreSQL schema via search_path on every new connection.  This ensures
#    unqualified table names (sales_orders, customers, …) resolve to
#    analytics.sales_orders etc., while SQLAlchemy model definitions use the
#    explicit schema= keyword for migrations/introspection.
# ---------------------------------------------------------------------------
analytics_engine = create_engine(
    APP_DB_URL,
    pool_pre_ping=True,
    pool_size=3,
    max_overflow=5,
    pool_recycle=300,
    echo=False,
)


@event.listens_for(analytics_engine, "connect")
def _set_analytics_search_path_on_connect(dbapi_conn, connection_record):
    """Set search_path to 'analytics' on physical connection creation."""
    with dbapi_conn.cursor() as cursor:
        cursor.execute("SET search_path TO analytics, public")


@event.listens_for(analytics_engine, "checkout")
def _set_analytics_search_path_on_checkout(dbapi_conn, connection_record, connection_proxy):
    """Ensure search_path is set to 'analytics' on every pool checkout."""
    with dbapi_conn.cursor() as cursor:
        cursor.execute("SET search_path TO analytics, public")


AnalyticsSessionLocal = sessionmaker(
    bind=analytics_engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)


# ---------------------------------------------------------------------------
# FastAPI dependency functions
# ---------------------------------------------------------------------------
def get_db() -> Generator[Session, None, None]:
    """Dependency providing an application metadata database session (public schema)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_analytics_db() -> Generator[Session, None, None]:
    """Dependency providing an analytics warehouse session (analytics schema)."""
    db = AnalyticsSessionLocal()
    try:
        yield db
    finally:
        db.close()

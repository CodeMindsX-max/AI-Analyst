"""
Database initialization utilities for AnalystAI.

Responsibilities:
  - Application schema (public):   Alembic manages all DDL.
                                    init_application_db() is a no-op except for logging.
  - Analytics schema (analytics):  Created here via AnalyticsBase.metadata.create_all()
                                    because analytics tables are NOT Alembic-managed.
                                    Safe: CREATE TABLE IF NOT EXISTS semantics via checkfirst=True.

NEVER call ApplicationBase.metadata.create_all() in this file.
"""
from sqlalchemy import text

from app.db.base import AnalyticsBase
from app.db.session import engine, analytics_engine
from app.core.config import settings
from app.core.logging_config import logger
import app.models  # Ensure all models are imported and registered


def _ensure_analytics_schema() -> None:
    """Create the 'analytics' PostgreSQL schema if it does not already exist."""
    with analytics_engine.connect() as conn:
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS analytics"))
        conn.commit()
    logger.info("Analytics schema verified/created.")


def init_application_db() -> None:
    """
    Application tables are managed exclusively by Alembic migrations.
    This function only logs the status and does NOT run create_all.

    To apply migrations:
        cd backend
        python -m alembic upgrade head
    """
    logger.info(
        "Application metadata schema (public) is managed by Alembic. "
        "Run 'alembic upgrade head' to apply pending migrations."
    )


def init_analytics_db() -> None:
    """
    Create analytics schema and business tables (sales_orders, customers, products, regions)
    using checkfirst=True so this is idempotent and never drops existing data.
    """
    _ensure_analytics_schema()
    logger.info("Initializing analytics business tables in 'analytics' schema...")
    AnalyticsBase.metadata.create_all(bind=analytics_engine, checkfirst=True)
    logger.info("Analytics tables ready (sales_orders, customers, products, regions).")


def init_db() -> None:
    """
    Convenience initializer called at startup.
    - Logs Alembic instructions for application tables.
    - Creates analytics schema and tables if they don't exist.
    """
    init_application_db()
    init_analytics_db()


if __name__ == "__main__":
    init_db()

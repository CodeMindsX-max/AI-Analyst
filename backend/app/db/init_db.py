from app.db.base import ApplicationBase, AnalyticsBase
from app.db.session import engine, analytics_engine
from app.core.config import settings
from app.core.logging_config import logger
import app.models  # Ensure all models are imported and registered


def init_application_db():
    """Initialize application metadata tables.
    Note: In production with PostgreSQL, schema migrations must be applied using Alembic.
    In local development (SQLite), create_all is supported for quick bootstrapping.
    """
    if "sqlite" in settings.DATABASE_URL or settings.APP_ENV == "development":
        logger.info("Initializing application metadata database tables (Development/SQLite)...")
        ApplicationBase.metadata.create_all(bind=engine)
        logger.info("Application metadata tables ready.")
    else:
        logger.info("Production database detected. Application schema is managed via Alembic migrations.")


def init_analytics_db():
    """Initialize local demo analytical database tables (sales_orders, customers, products, regions)."""
    logger.info("Initializing demo analytics database tables...")
    AnalyticsBase.metadata.create_all(bind=analytics_engine)
    logger.info("Demo analytics database tables ready.")


def init_db():
    """Convenience initializer for development environments."""
    init_application_db()
    init_analytics_db()


if __name__ == "__main__":
    init_db()

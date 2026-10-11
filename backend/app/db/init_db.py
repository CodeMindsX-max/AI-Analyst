from app.db.base import Base
from app.db.session import engine, analytics_engine
from app.core.logging_config import logger
import app.models  # Ensure all models are registered


def init_db():
    """Create all tables in metadata and analytics databases."""
    logger.info("Initializing application metadata database tables...")
    Base.metadata.create_all(bind=engine)

    logger.info("Initializing demo analytics database tables...")
    Base.metadata.create_all(bind=analytics_engine)
    logger.info("Database tables successfully initialized.")


if __name__ == "__main__":
    init_db()

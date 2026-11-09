from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

from app.core.config import settings
from app.db.base import ApplicationBase
from app.db.session import APP_DB_URL

# Import all application models so Alembic registers them for autogenerate
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceSetting
from app.models.data_source import DataSource, UploadedDataset
from app.models.analyst import AgentRun, AgentRunEvent, SavedAnalysis
from app.models.sql import QueryHistory, SavedQuery
from app.models.knowledge import KnowledgeDocument, DocumentChunk, GlossaryTerm
from app.models.bi import Dashboard, DashboardWidget, Report, ScheduledJob
from app.models.operations import Notification, TeamMember, AuditEvent
# Note: Demo analytics tables (SalesOrder, Customer, Product, Region) inherit from AnalyticsBase
# and are intentionally excluded from application database migrations.

# this is the Alembic Config object, which provides access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Target metadata is strictly the ApplicationBase metadata
target_metadata = ApplicationBase.metadata

# Ensure alembic config uses the resolved APP_DB_URL safely with escaped percent characters
config.set_main_option(
    "sqlalchemy.url",
    APP_DB_URL.replace("%", "%%")
)


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_as_batch="sqlite" in url,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    url = config.get_main_option("sqlalchemy.url")
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = url

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_as_batch="sqlite" in url,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

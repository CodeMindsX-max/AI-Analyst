"""
Alembic migration environment for AnalystAI.

Target: ApplicationBase.metadata only (public schema, Supabase PostgreSQL).
Analytics tables (analytics schema) are intentionally excluded.

IMPORTANT: Uses isolation_level=AUTOCOMMIT on the connection to avoid
psycopg3's implicit transaction wrapping silently rolling back DDL on
Supabase's session pooler. This is the correct pattern for psycopg3
when running schema migrations.
"""
from logging.config import fileConfig

from sqlalchemy import create_engine, text
from alembic import context

from app.core.config import settings
from app.db.base import ApplicationBase

# Import all application models so Alembic registers them for autogenerate
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceSetting
from app.models.data_source import DataSource, UploadedDataset
from app.models.analyst import AgentRun, AgentRunEvent, SavedAnalysis
from app.models.sql import QueryHistory, SavedQuery
from app.models.knowledge import KnowledgeDocument, DocumentChunk, GlossaryTerm
from app.models.bi import Dashboard, DashboardWidget, Report, ScheduledJob
from app.models.operations import Notification, TeamMember, AuditEvent
# Note: Analytics models use AnalyticsBase — excluded from application migrations.

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = ApplicationBase.metadata

_db_url = settings.DATABASE_URL
if _db_url.startswith("sqlite"):
    raise RuntimeError(
        "Alembic requires a PostgreSQL DATABASE_URL. "
        "Update DATABASE_URL in backend/.env before running migrations."
    )
config.set_main_option("sqlalchemy.url", _db_url.replace("%", "%%"))


def include_object(object, name, type_, reflected, compare_to):
    """Exclude objects in the 'analytics' schema from Alembic's scope."""
    if type_ == "table" and getattr(object, "schema", None) == "analytics":
        return False
    return True


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_object=include_object,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations with AUTOCOMMIT isolation.

    psycopg3 wraps every connection in an implicit transaction by default.
    Without AUTOCOMMIT, Alembic's CREATE TABLE DDL statements are silently
    rolled back when the connection closes on Supabase's pooler. Setting
    isolation_level='AUTOCOMMIT' on the connection makes each DDL statement
    commit immediately, which is the correct behaviour for schema migrations.
    """
    # Build a dedicated DDL engine with AUTOCOMMIT for migration runs
    ddl_engine = create_engine(
        _db_url,
        isolation_level="AUTOCOMMIT",
        pool_pre_ping=True,
    )

    with ddl_engine.connect() as connection:
        connection.execute(text("SET search_path TO public"))
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            include_object=include_object,
            # With AUTOCOMMIT, Alembic must NOT wrap in BEGIN/COMMIT
            transactional_ddl=False,
        )
        with context.begin_transaction():
            context.run_migrations()

    ddl_engine.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

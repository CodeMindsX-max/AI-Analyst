from datetime import datetime, timezone
from sqlalchemy import DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class ApplicationBase(DeclarativeBase):
    """Declarative Base for AnalystAI application metadata (PostgreSQL/Supabase)."""
    pass


# Backward-compatible alias for existing imports
Base = ApplicationBase


class AnalyticsBase(DeclarativeBase):
    """Declarative Base for analytical / business dataset (customer warehouse or demo SQLite)."""
    pass


class TimestampMixin:
    """Mixin providing created_at and updated_at timestamps."""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

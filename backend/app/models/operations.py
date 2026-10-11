from datetime import datetime
from sqlalchemy import String, Text, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base, TimestampMixin


class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    notification_type: Mapped[str] = mapped_column(String(50), default="insight", nullable=False)  # source, insight, agent, security, report
    severity: Mapped[str] = mapped_column(String(50), default="info", nullable=False)  # info, warning, success, error
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    link_url: Mapped[str] = mapped_column(String(255), nullable=True)


class TeamMember(Base, TimestampMixin):
    __tablename__ = "team_members"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    user_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="Analyst", nullable=False)  # Owner, Admin, Analyst, Viewer
    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)  # active, invited, suspended
    last_active_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)


class AuditEvent(Base, TimestampMixin):
    __tablename__ = "audit_events"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    actor_email: Mapped[str] = mapped_column(String(255), default="demo@analystai.local", nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False)  # user.login, query.execute, report.create, etc.
    resource_type: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_id: Mapped[str] = mapped_column(String(100), nullable=True)
    outcome: Mapped[str] = mapped_column(String(50), default="success", nullable=False)  # success, failure, denied
    detail_json: Mapped[str] = mapped_column(Text, default="{}", nullable=False)
    ip_address: Mapped[str] = mapped_column(String(50), default="127.0.0.1", nullable=False)

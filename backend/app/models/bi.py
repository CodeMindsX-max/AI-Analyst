from datetime import datetime
from sqlalchemy import String, Integer, Text, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base, TimestampMixin


class Dashboard(Base, TimestampMixin):
    __tablename__ = "dashboards"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    visibility: Mapped[str] = mapped_column(String(50), default="team", nullable=False)  # private, team, public
    owner: Mapped[str] = mapped_column(String(100), default="Demo Admin", nullable=False)
    layout_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)


class DashboardWidget(Base, TimestampMixin):
    __tablename__ = "dashboard_widgets"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    dashboard_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    widget_type: Mapped[str] = mapped_column(String(50), nullable=False)  # kpi, chart, table, ai_insight
    chart_type: Mapped[str] = mapped_column(String(50), default="line", nullable=False)  # line, bar, area, donut
    metric: Mapped[str] = mapped_column(String(100), default="revenue", nullable=False)
    dimension: Mapped[str] = mapped_column(String(100), default="month", nullable=False)
    config_json: Mapped[str] = mapped_column(Text, default="{}", nullable=False)
    position_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class Report(Base, TimestampMixin):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    subtitle: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    report_type: Mapped[str] = mapped_column(String(50), default="Executive Summary", nullable=False)
    audience: Mapped[str] = mapped_column(String(100), default="Leadership", nullable=False)
    period: Mapped[str] = mapped_column(String(100), default="Q3 2026", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="published", nullable=False)  # draft, published, scheduled
    owner: Mapped[str] = mapped_column(String(100), default="Demo Admin", nullable=False)
    sections_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)


class ScheduledJob(Base, TimestampMixin):
    __tablename__ = "scheduled_jobs"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    task_type: Mapped[str] = mapped_column(String(50), default="report_generation", nullable=False)
    target_id: Mapped[str] = mapped_column(String(50), nullable=True)
    frequency: Mapped[str] = mapped_column(String(50), default="weekly", nullable=False)  # daily, weekly, monthly
    cron_expr: Mapped[str] = mapped_column(String(100), default="0 9 * * 1", nullable=False)
    run_time: Mapped[str] = mapped_column(String(50), default="09:00", nullable=False)
    timezone: Mapped[str] = mapped_column(String(50), default="UTC", nullable=False)
    output_type: Mapped[str] = mapped_column(String(50), default="in_app", nullable=False)  # in_app, csv, pdf
    recipients_json: Mapped[str] = mapped_column(String(500), default="[]", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_run_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    next_run_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    owner: Mapped[str] = mapped_column(String(100), default="Demo Admin", nullable=False)

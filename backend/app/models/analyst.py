from sqlalchemy import String, Integer, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base, TimestampMixin


class AgentRun(Base, TimestampMixin):
    __tablename__ = "agent_runs"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    user_email: Mapped[str] = mapped_column(String(255), default="demo@analystai.local", nullable=False)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    task_summary: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="completed", nullable=False)  # pending, running, completed, failed
    duration_ms: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    source_id: Mapped[str] = mapped_column(String(50), default="demo-source-1", nullable=False)
    query_sql: Mapped[str] = mapped_column(Text, nullable=True)
    error_message: Mapped[str] = mapped_column(Text, nullable=True)
    result_json: Mapped[str] = mapped_column(Text, nullable=True)  # Full structured result payload


class AgentRunEvent(Base, TimestampMixin):
    __tablename__ = "agent_run_events"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    run_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    step_index: Mapped[int] = mapped_column(Integer, nullable=False)
    step_name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="completed", nullable=False)  # completed, running, failed
    description: Mapped[str] = mapped_column(Text, nullable=False)
    tool_name: Mapped[str] = mapped_column(String(100), nullable=False)
    details_json: Mapped[str] = mapped_column(Text, default="{}", nullable=False)
    duration_ms: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class SavedAnalysis(Base, TimestampMixin):
    __tablename__ = "saved_analyses"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    run_id: Mapped[str] = mapped_column(String(50), nullable=True)
    chart_config_json: Mapped[str] = mapped_column(Text, default="{}", nullable=False)
    query_sql: Mapped[str] = mapped_column(Text, nullable=True)
    tags_json: Mapped[str] = mapped_column(String(500), default="[]", nullable=False)
    owner: Mapped[str] = mapped_column(String(100), default="Demo Admin", nullable=False)
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

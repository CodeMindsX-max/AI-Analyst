from sqlalchemy import String, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base, TimestampMixin


class Workspace(Base, TimestampMixin):
    __tablename__ = "workspaces"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    organization: Mapped[str] = mapped_column(String(255), nullable=False)
    industry: Mapped[str] = mapped_column(String(100), default="SaaS", nullable=False)
    size: Mapped[str] = mapped_column(String(50), default="50-200", nullable=False)
    domain: Mapped[str] = mapped_column(String(100), default="Sales", nullable=False)
    is_onboarded: Mapped[bool] = mapped_column(default=True, nullable=False)


class WorkspaceSetting(Base, TimestampMixin):
    __tablename__ = "workspace_settings"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    llm_provider: Mapped[str] = mapped_column(String(50), default="mock", nullable=False)
    embedding_provider: Mapped[str] = mapped_column(String(50), default="mock", nullable=False)
    response_style: Mapped[str] = mapped_column(String(50), default="analytical", nullable=False)  # concise, analytical, executive
    max_output_tokens: Mapped[int] = mapped_column(Integer, default=2048, nullable=False)
    default_chart_type: Mapped[str] = mapped_column(String(50), default="bar", nullable=False)
    citation_preference: Mapped[str] = mapped_column(String(50), default="detailed", nullable=False)
    top_k: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    allowed_tools: Mapped[str] = mapped_column(Text, default="schema,glossary,sql,analysis,chart,report", nullable=False)
    max_sql_rows: Mapped[int] = mapped_column(Integer, default=500, nullable=False)

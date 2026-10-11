from sqlalchemy import String, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base, TimestampMixin


class KnowledgeDocument(Base, TimestampMixin):
    __tablename__ = "knowledge_documents"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)  # pdf, docx, txt, csv, xlsx
    file_size_bytes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="ready", nullable=False)  # uploading, extracting, chunking, indexed, failed
    char_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    chunk_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    indexing_mode: Mapped[str] = mapped_column(String(50), default="mock", nullable=False)
    owner: Mapped[str] = mapped_column(String(100), default="Demo Admin", nullable=False)


class DocumentChunk(Base, TimestampMixin):
    __tablename__ = "document_chunks"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    document_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    metadata_json: Mapped[str] = mapped_column(Text, default="{}", nullable=False)


class GlossaryTerm(Base, TimestampMixin):
    __tablename__ = "glossary_terms"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    workspace_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    term: Mapped[str] = mapped_column(String(150), nullable=False)
    definition: Mapped[str] = mapped_column(Text, nullable=False)
    synonyms: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    formula: Mapped[str] = mapped_column(String(500), default="", nullable=False)
    domain: Mapped[str] = mapped_column(String(100), default="Sales", nullable=False)
    source_tables: Mapped[str] = mapped_column(String(255), default="sales_orders", nullable=False)
    source_columns: Mapped[str] = mapped_column(String(255), default="net_amount", nullable=False)
    steward: Mapped[str] = mapped_column(String(100), default="Lead Data Analyst", nullable=False)
    notes: Mapped[str] = mapped_column(Text, default="", nullable=False)

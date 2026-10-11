from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class SqlValidateRequest(BaseModel):
    query_sql: str


class SqlValidateResponse(BaseModel):
    is_valid: bool
    is_read_only: bool
    tables_referenced: List[str]
    message: str
    reasons: List[str] = []


class SqlExecuteRequest(BaseModel):
    query_sql: str
    source_id: Optional[str] = "demo-source-1"
    limit: Optional[int] = 100


class SqlExecuteResponse(BaseModel):
    columns: List[str]
    rows: List[Dict[str, Any]]
    row_count: int
    duration_ms: int
    status: str
    error_message: Optional[str] = None


class SqlExplainRequest(BaseModel):
    query_sql: str


class SqlExplainResponse(BaseModel):
    plan_explanation: str
    estimated_cost: str
    indexes_used: List[str]
    scanned_tables: List[str]


class SqlFormatRequest(BaseModel):
    query_sql: str


class SqlFormatResponse(BaseModel):
    formatted_sql: str


class SavedQueryCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    query_sql: str


class SavedQueryResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    query_sql: str
    owner: str
    created_at: str
    updated_at: str

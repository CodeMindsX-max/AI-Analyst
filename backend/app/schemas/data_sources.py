from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class DataSourceCreate(BaseModel):
    name: str
    kind: str  # demo_dataset, csv, excel, postgresql, mysql, snowflake
    config: Dict[str, Any] = {}


class DataSourceResponse(BaseModel):
    id: str
    name: str
    kind: str
    status: str
    table_count: int
    row_count: int
    last_synced_at: Optional[str]
    owner: str
    created_at: str


class TestConnectionResponse(BaseModel):
    success: bool
    message: str
    latency_ms: int
    tables_found: int
    is_simulated: bool = False


class ColumnProfile(BaseModel):
    name: str
    data_type: str
    null_count: int
    null_percentage: float
    distinct_count: int
    sample_values: List[Any] = []
    min_val: Optional[Any] = None
    max_val: Optional[Any] = None
    mean_val: Optional[float] = None


class TableSchemaInfo(BaseModel):
    table_name: str
    description: str
    row_count: int
    columns: List[ColumnProfile]


class TablePreviewResponse(BaseModel):
    table_name: str
    columns: List[str]
    rows: List[Dict[str, Any]]
    total_rows: int
    page: int
    page_size: int

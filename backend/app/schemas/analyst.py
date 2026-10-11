from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class AnalystRunRequest(BaseModel):
    question: str
    source_id: Optional[str] = "demo-source-1"
    date_range: Optional[str] = "last_90_days"
    region_filter: Optional[str] = None
    category_filter: Optional[str] = None
    scope: Optional[str] = "standard"


class FollowUpRequest(BaseModel):
    follow_up_question: str


class FindingCard(BaseModel):
    title: str
    statement: str
    metric_value: str
    change_direction: str  # up, down, flat, alert
    significance: str  # high, medium, low


class ChartConfig(BaseModel):
    chart_type: str  # line, bar, area, pie, grouped_bar
    title: str
    x_key: str
    y_keys: List[str]
    data: List[Dict[str, Any]]
    series_labels: Optional[Dict[str, str]] = None


class EvidenceItem(BaseModel):
    type: str  # schema, glossary, document_chunk, query_result, calculation
    title: str
    source_name: str
    source_id: Optional[str] = None
    excerpt: str
    table_name: Optional[str] = None
    column_name: Optional[str] = None
    url_or_location: Optional[str] = None
    is_demo: bool = True


class DataCoverage(BaseModel):
    selected_source: str
    tables_used: List[str]
    columns_used: List[str]
    row_count: int
    date_range_applied: str
    last_updated: str
    execution_duration_ms: int


class AnalystResult(BaseModel):
    question: str
    task_summary: str
    executive_answer: str
    findings: List[FindingCard]
    charts: List[ChartConfig]
    table_columns: List[str]
    table_rows: List[Dict[str, Any]]
    candidate_sql: str
    query_safety_status: str
    evidence: List[EvidenceItem]
    data_coverage: DataCoverage
    is_demo_generated: bool = True
    model_provider: str = "mock"


class AgentRunEventResponse(BaseModel):
    id: str
    run_id: str
    step_index: int
    step_name: str
    status: str
    description: str
    tool_name: str
    details: Dict[str, Any]
    duration_ms: int
    created_at: str


class AgentRunResponse(BaseModel):
    id: str
    question: str
    task_summary: Optional[str]
    status: str
    duration_ms: int
    source_id: str
    query_sql: Optional[str]
    result: Optional[AnalystResult]
    events: List[AgentRunEventResponse] = []
    created_at: str


class SaveAnalysisRequest(BaseModel):
    title: str
    run_id: str
    tags: List[str] = []
    is_pinned: bool = False


class SavedAnalysisResponse(BaseModel):
    id: str
    title: str
    question: str
    summary: str
    run_id: Optional[str]
    query_sql: Optional[str]
    chart_config: Optional[Dict[str, Any]]
    tags: List[str]
    owner: str
    is_pinned: bool
    created_at: str
    updated_at: str


class PromptSuggestion(BaseModel):
    id: str
    category: str
    question: str
    description: str
    suggested_date_range: str

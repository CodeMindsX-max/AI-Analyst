from typing import List, Dict, Any, Optional
from pydantic import BaseModel, EmailStr


class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    notification_type: str
    severity: str
    is_read: bool
    link_url: Optional[str]
    created_at: str


class TeamMemberCreate(BaseModel):
    email: str
    name: str
    role: str = "Analyst"


class TeamMemberUpdate(BaseModel):
    role: Optional[str] = None
    status: Optional[str] = None


class TeamMemberResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    status: str
    last_active_at: Optional[str]
    created_at: str


class WorkspaceSettingUpdate(BaseModel):
    llm_provider: Optional[str] = None
    embedding_provider: Optional[str] = None
    response_style: Optional[str] = None
    max_output_tokens: Optional[int] = None
    default_chart_type: Optional[str] = None
    citation_preference: Optional[str] = None
    top_k: Optional[int] = None
    allowed_tools: Optional[str] = None
    max_sql_rows: Optional[int] = None


class WorkspaceSettingResponse(BaseModel):
    llm_provider: str
    embedding_provider: str
    response_style: str
    max_output_tokens: int
    default_chart_type: str
    citation_preference: str
    top_k: int
    allowed_tools: str
    max_sql_rows: int


class AuditEventResponse(BaseModel):
    id: str
    actor_email: str
    action: str
    resource_type: str
    resource_id: Optional[str]
    outcome: str
    detail: Dict[str, Any]
    ip_address: str
    created_at: str


class GlobalSearchResultItem(BaseModel):
    id: str
    title: str
    description: str
    category: str  # navigation, analysis, dashboard, report, glossary, source, document
    url: str


class GlobalSearchResponse(BaseModel):
    query: str
    results: List[GlobalSearchResultItem]

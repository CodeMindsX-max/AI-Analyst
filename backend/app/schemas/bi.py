from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class WidgetConfig(BaseModel):
    id: Optional[str] = None
    title: str
    widget_type: str  # kpi, chart, table, ai_insight
    chart_type: Optional[str] = "line"
    metric: Optional[str] = "revenue"
    dimension: Optional[str] = "month"
    config: Dict[str, Any] = {}
    position_order: int = 0


class DashboardCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    visibility: Optional[str] = "team"
    widgets: List[WidgetConfig] = []


class DashboardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    visibility: Optional[str] = None
    widgets: Optional[List[WidgetConfig]] = None


class DashboardResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    visibility: str
    owner: str
    widget_count: int
    widgets: List[WidgetConfig] = []
    created_at: str
    updated_at: str


class ReportSection(BaseModel):
    id: str
    title: str
    section_type: str  # executive_summary, kpi_overview, trends, findings, recommendations, data_table
    content: str
    chart_data: Optional[Dict[str, Any]] = None
    order: int


class ReportCreate(BaseModel):
    title: str
    subtitle: Optional[str] = ""
    report_type: Optional[str] = "Executive Summary"
    audience: Optional[str] = "Leadership"
    period: Optional[str] = "Q3 2026"
    sections: List[ReportSection] = []


class ReportUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    report_type: Optional[str] = None
    audience: Optional[str] = None
    period: Optional[str] = None
    status: Optional[str] = None
    sections: Optional[List[ReportSection]] = None


class ReportResponse(BaseModel):
    id: str
    title: str
    subtitle: str
    report_type: str
    audience: str
    period: str
    status: str
    owner: str
    sections: List[ReportSection]
    created_at: str
    updated_at: str


class ScheduledJobCreate(BaseModel):
    name: str
    task_type: Optional[str] = "report_generation"
    target_id: Optional[str] = None
    frequency: str = "weekly"  # daily, weekly, monthly
    cron_expr: Optional[str] = "0 9 * * 1"
    run_time: Optional[str] = "09:00"
    timezone: Optional[str] = "UTC"
    output_type: Optional[str] = "in_app"
    recipients: List[str] = []
    is_active: bool = True


class ScheduledJobResponse(BaseModel):
    id: str
    name: str
    task_type: str
    target_id: Optional[str]
    frequency: str
    cron_expr: str
    run_time: str
    timezone: str
    output_type: str
    recipients: List[str]
    is_active: bool
    last_run_at: Optional[str]
    next_run_at: Optional[str]
    owner: str
    created_at: str

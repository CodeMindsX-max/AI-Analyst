from typing import List, Optional
from pydantic import BaseModel


class KpiMetric(BaseModel):
    label: str
    value: float
    formatted_value: str
    change_pct: float
    change_type: str  # positive, negative, neutral
    previous_period_label: str
    sparkline: List[float] = []


class RevenueTrendPoint(BaseModel):
    period: str
    revenue: float
    orders: int
    target: float


class RegionPerformanceItem(BaseModel):
    region_name: str
    actual_revenue: float
    target_revenue: float
    attainment_pct: float
    order_count: int


class CategorySalesItem(BaseModel):
    category: str
    revenue: float
    units_sold: int
    share_pct: float


class InsightItem(BaseModel):
    id: str
    severity: str  # high, medium, low, info
    statement: str
    supporting_metric: str
    period: str
    recommended_action: str
    investigate_question: str


class OverviewSummaryResponse(BaseModel):
    workspace_name: str
    selected_period: str
    kpis: List[KpiMetric]
    revenue_trend: List[RevenueTrendPoint]
    region_performance: List[RegionPerformanceItem]
    category_sales: List[CategorySalesItem]
    insights: List[InsightItem]
    last_refreshed_at: str

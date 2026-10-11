from fastapi import APIRouter, Query
from app.schemas.overview import (
    OverviewSummaryResponse,
    RevenueTrendPoint,
    RegionPerformanceItem,
    InsightItem,
)
from app.services.overview_service import overview_service
from typing import List

router = APIRouter(prefix="/overview", tags=["Overview Dashboard"])


@router.get("/summary", response_model=OverviewSummaryResponse)
def get_overview_summary(period: str = Query("Q3 2026", description="Reporting period")):
    """Get complete executive overview metrics, KPIs, trends, and AI-detected insights."""
    return overview_service.get_summary(period=period)


@router.get("/revenue-trend", response_model=List[RevenueTrendPoint])
def get_revenue_trend():
    """Get monthly revenue, order volume, and quota target trend."""
    summary = overview_service.get_summary()
    return summary.revenue_trend


@router.get("/region-performance", response_model=List[RegionPerformanceItem])
def get_region_performance():
    """Get regional performance vs target quota."""
    summary = overview_service.get_summary()
    return summary.region_performance


@router.get("/insights", response_model=List[InsightItem])
def get_insights():
    """Get AI-detected business anomalies and variance insights."""
    summary = overview_service.get_summary()
    return summary.insights

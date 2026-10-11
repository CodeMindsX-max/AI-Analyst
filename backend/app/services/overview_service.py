from typing import List
from datetime import datetime, timezone
from app.schemas.overview import (
    KpiMetric,
    RevenueTrendPoint,
    RegionPerformanceItem,
    CategorySalesItem,
    InsightItem,
    OverviewSummaryResponse,
)


class OverviewService:
    """Service providing unified metrics and summaries for the Executive Dashboard."""

    def get_summary(self, period: str = "Q3 2026") -> OverviewSummaryResponse:
        # Coherent figures matching the September dip scenario and annual metrics
        kpis: List[KpiMetric] = [
            KpiMetric(
                label="Total Revenue",
                value=2485600.0,
                formatted_value="$2,485,600",
                change_pct=8.4,
                change_type="positive",
                previous_period_label="vs Q2 2026 ($2,293,000)",
                sparkline=[275000, 292000, 310000, 315000, 331600, 284500, 325000, 347500],
            ),
            KpiMetric(
                label="Total Orders",
                value=1420.0,
                formatted_value="1,420",
                change_pct=5.2,
                change_type="positive",
                previous_period_label="vs Q2 2026 (1,350)",
                sparkline=[155, 168, 175, 180, 192, 164, 185, 201],
            ),
            KpiMetric(
                label="Active Customers",
                value=482.0,
                formatted_value="482",
                change_pct=12.1,
                change_type="positive",
                previous_period_label="vs Q2 2026 (430)",
                sparkline=[410, 422, 430, 445, 460, 472, 482, 495],
            ),
            KpiMetric(
                label="Gross Margin",
                value=76.8,
                formatted_value="76.8%",
                change_pct=-1.4,
                change_type="negative",
                previous_period_label="vs Q2 2026 (77.9%)",
                sparkline=[78.1, 77.9, 78.0, 77.5, 77.2, 75.8, 76.8, 77.0],
            ),
            KpiMetric(
                label="Average Order Value",
                value=1750.42,
                formatted_value="$1,750",
                change_pct=3.1,
                change_type="positive",
                previous_period_label="vs Q2 2026 ($1,698)",
                sparkline=[1774, 1738, 1771, 1750, 1727, 1734, 1756, 1728],
            ),
            KpiMetric(
                label="Conversion Rate",
                value=3.42,
                formatted_value="3.42%",
                change_pct=0.3,
                change_type="positive",
                previous_period_label="vs Q2 2026 (3.32%)",
                sparkline=[3.1, 3.2, 3.3, 3.3, 3.4, 3.2, 3.4, 3.5],
            ),
        ]

        # Monthly revenue trend showing the September dip (August: $331.6k -> Sept: $284.5k)
        revenue_trend: List[RevenueTrendPoint] = [
            RevenueTrendPoint(period="Jan 2026", revenue=275000, orders=155, target=270000),
            RevenueTrendPoint(period="Feb 2026", revenue=292000, orders=168, target=280000),
            RevenueTrendPoint(period="Mar 2026", revenue=310000, orders=175, target=300000),
            RevenueTrendPoint(period="Apr 2026", revenue=305000, orders=172, target=300000),
            RevenueTrendPoint(period="May 2026", revenue=315000, orders=180, target=310000),
            RevenueTrendPoint(period="Jun 2026", revenue=320000, orders=182, target=315000),
            RevenueTrendPoint(period="Jul 2026", revenue=328000, orders=188, target=320000),
            RevenueTrendPoint(period="Aug 2026", revenue=331600, orders=192, target=325000),
            RevenueTrendPoint(period="Sep 2026", revenue=284500, orders=164, target=330000),
            RevenueTrendPoint(period="Oct 2026", revenue=325000, orders=185, target=330000),
        ]

        region_performance: List[RegionPerformanceItem] = [
            RegionPerformanceItem(
                region_name="North America",
                actual_revenue=1205000,
                target_revenue=1150000,
                attainment_pct=104.8,
                order_count=685,
            ),
            RegionPerformanceItem(
                region_name="EMEA",
                actual_revenue=682000,
                target_revenue=780000,
                attainment_pct=87.4,
                order_count=390,
            ),
            RegionPerformanceItem(
                region_name="APAC",
                actual_revenue=428600,
                target_revenue=400000,
                attainment_pct=107.1,
                order_count=245,
            ),
            RegionPerformanceItem(
                region_name="LATAM",
                actual_revenue=170000,
                target_revenue=180000,
                attainment_pct=94.4,
                order_count=100,
            ),
        ]

        category_sales: List[CategorySalesItem] = [
            CategorySalesItem(
                category="Enterprise SaaS",
                revenue=1551000,
                units_sold=450,
                share_pct=62.4,
            ),
            CategorySalesItem(
                category="Professional Services",
                revenue=485000,
                units_sold=220,
                share_pct=19.5,
            ),
            CategorySalesItem(
                category="Analytics Add-on",
                revenue=295600,
                units_sold=420,
                share_pct=11.9,
            ),
            CategorySalesItem(
                category="AI Inference Pack",
                revenue=154000,
                units_sold=330,
                share_pct=6.2,
            ),
        ]

        insights: List[InsightItem] = [
            InsightItem(
                id="ins-1",
                severity="high",
                statement="September Revenue dropped by $47,100 (-14.2%) compared with August.",
                supporting_metric="-14.2% MoM revenue shift in September",
                period="Sep 2026",
                recommended_action="Review EMEA deal slippage and evaluate Professional Services billing timelines.",
                investigate_question="Why did revenue decrease in September compared with August?",
            ),
            InsightItem(
                id="ins-2",
                severity="medium",
                statement="EMEA regional quota attainment fell to 87.4% due to deferred renewal closures.",
                supporting_metric="$98,000 deficit against regional Q3 quota",
                period="Q3 2026",
                recommended_action="Run pipeline acceleration campaign for enterprise accounts in UK and Germany.",
                investigate_question="Compare regional sales performance and quota attainment across Q3.",
            ),
            InsightItem(
                id="ins-3",
                severity="info",
                statement="Analytics Add-on adoption reached all-time high with +22.1% YoY expansion.",
                supporting_metric="$295,600 annualized recurring run rate",
                period="Year-to-Date",
                recommended_action="Bundle Analytics Add-on in mid-market renewal packages.",
                investigate_question="Which products are growing fastest across our active customer base?",
            ),
        ]

        return OverviewSummaryResponse(
            workspace_name="Acme Enterprise Analytics",
            selected_period=period,
            kpis=kpis,
            revenue_trend=revenue_trend,
            region_performance=region_performance,
            category_sales=category_sales,
            insights=insights,
            last_refreshed_at=datetime.now(timezone.utc).isoformat(),
        )


overview_service = OverviewService()

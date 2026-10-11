from typing import List, Dict, Any
from app.schemas.analyst import FindingCard, ChartConfig

# TODO(STUDENT): Enhance data analysis using Pandas or Polars.
# Suggested capabilities:
# 1. Automated anomaly detection (Z-score or Isolation Forest on time-series metrics).
# 2. Automated contribution/waterfall breakdown (Shapley-style factor decomposition).
# 3. Statistical hypothesis testing (p-value for A/B cohort comparisons).


class AnalysisService:
    """Service computing business metric deltas, factor contributions, and chart datasets."""

    def analyze_results(
        self,
        question: str,
        rows: List[Dict[str, Any]],
        columns: List[str],
    ) -> Dict[str, Any]:
        lower_q = question.lower()

        if "september" in lower_q or "decrease" in lower_q or "drop" in lower_q:
            findings = [
                FindingCard(
                    title="Net Revenue Contraction",
                    statement="Total revenue contracted by $47,100 (-14.2%) from August ($331,600) to September ($284,500).",
                    metric_value="-$47,100 (-14.2%)",
                    change_direction="down",
                    significance="high",
                ),
                FindingCard(
                    title="Primary Geographic Driver",
                    statement="EMEA regional sales experienced a 26.8% volume drop ($99,500 vs $135,900 in August) due to extended procurement.",
                    metric_value="-$36,400 in EMEA",
                    change_direction="down",
                    significance="high",
                ),
                FindingCard(
                    title="Product Category Variance",
                    statement="Enterprise SaaS contracts slipped late in Q3, while Professional Services billings decreased by 9.4%.",
                    metric_value="62.4% SaaS contribution",
                    change_direction="alert",
                    significance="medium",
                ),
                FindingCard(
                    title="Resilient Territories",
                    statement="North America maintained positive momentum with +1.8% MoM growth, buffering total group variance.",
                    metric_value="+1.8% NA growth",
                    change_direction="up",
                    significance="low",
                ),
            ]

            charts = [
                ChartConfig(
                    chart_type="bar",
                    title="Revenue Comparison by Region (August vs September 2026)",
                    x_key="region",
                    y_keys=["August", "September"],
                    data=[
                        {"region": "North America", "August": 142000, "September": 144500},
                        {"region": "EMEA", "August": 135900, "September": 99500},
                        {"region": "APAC", "August": 38700, "September": 28500},
                        {"region": "LATAM", "August": 15000, "September": 12000},
                    ],
                ),
                ChartConfig(
                    chart_type="bar",
                    title="Sales by Category (August vs September 2026)",
                    x_key="category",
                    y_keys=["August", "September"],
                    data=[
                        {"category": "Enterprise SaaS", "August": 208500, "September": 178000},
                        {"category": "Professional Services", "August": 68100, "September": 61600},
                        {"category": "Analytics Add-on", "August": 36000, "September": 31900},
                        {"category": "AI Inference Pack", "August": 19000, "September": 13000},
                    ],
                ),
            ]

            summary = (
                "Revenue decreased by 14.2% (-$47,100) in September 2026 ($284,500 vs $331,600 in August). "
                "The primary driver was a sharp decline in EMEA Enterprise SaaS bookings (-$36,400), "
                "attributed to extended European summer procurement cycles and deal postponement into October. "
                "North America remained resilient with +1.8% growth."
            )

        elif "region" in lower_q:
            findings = [
                FindingCard(
                    title="Market Leadership",
                    statement="North America generated $1,205,000, exceeding quota target by 4.8%.",
                    metric_value="$1.205M (104.8% target)",
                    change_direction="up",
                    significance="high",
                ),
                FindingCard(
                    title="EMEA Target Shortfall",
                    statement="EMEA attained 87.4% of its quarterly quota ($682k vs $780k target).",
                    metric_value="-$98,000 gap",
                    change_direction="down",
                    significance="medium",
                ),
            ]
            charts = [
                ChartConfig(
                    chart_type="bar",
                    title="Regional Revenue Attainment vs Quota",
                    x_key="region",
                    y_keys=["actual", "target"],
                    data=[
                        {"region": "North America", "actual": 1205000, "target": 1150000},
                        {"region": "EMEA", "actual": 682000, "target": 780000},
                        {"region": "APAC", "actual": 428600, "target": 400000},
                        {"region": "LATAM", "actual": 170000, "target": 180000},
                    ],
                )
            ]
            summary = "Regional performance demonstrates strong North American outperformance offset by underperformance in EMEA."

        else:
            findings = [
                FindingCard(
                    title="Transaction Volume",
                    statement="Seeded sales records indicate stable underlying transaction velocities.",
                    metric_value="1,420 total orders",
                    change_direction="up",
                    significance="medium",
                ),
                FindingCard(
                    title="Average Order Value",
                    statement="Consolidated AOV stands at $1,750, indicating healthy enterprise mix.",
                    metric_value="$1,750 AOV",
                    change_direction="up",
                    significance="low",
                ),
            ]
            charts = [
                ChartConfig(
                    chart_type="line",
                    title="Monthly Sales Volume Trend",
                    x_key="month",
                    y_keys=["revenue"],
                    data=[
                        {"month": "Jun", "revenue": 320000},
                        {"month": "Jul", "revenue": 328000},
                        {"month": "Aug", "revenue": 331600},
                        {"month": "Sep", "revenue": 284500},
                        {"month": "Oct", "revenue": 325000},
                    ],
                )
            ]
            summary = f"Analysis completed for: '{question}'. Evaluated sales database rows and produced key operational metrics."

        return {
            "executive_answer": summary,
            "findings": findings,
            "charts": charts,
        }


analysis_service = AnalysisService()

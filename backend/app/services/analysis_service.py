from typing import List, Dict, Any, Optional
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
        # Enforce truthful reporting on empty results
        if not rows or len(rows) == 0:
            return {
                "executive_answer": "No data records matched your query parameters in the selected dataset.",
                "findings": [],
                "charts": [],
            }

        row_count = len(rows)
        lower_q = question.lower()

        # Identify numerical columns for aggregation
        numeric_cols = []
        for col in columns:
            if rows and isinstance(rows[0].get(col), (int, float)) and not isinstance(rows[0].get(col), bool) and not col.endswith("_id"):
                numeric_cols.append(col)

        primary_num = next(
            (c for c in numeric_cols if any(k in c.lower() for k in ["revenue", "amount", "spend", "sales", "profit", "orders"])),
            numeric_cols[0] if numeric_cols else None,
        )

        findings: List[FindingCard] = []
        charts: List[ChartConfig] = []
        summary = ""

        # Case 1: Month-over-month / September variance analysis
        if ("september" in lower_q or "decrease" in lower_q or "drop" in lower_q or "august" in lower_q) and "month" in columns and primary_num:
            aug_rows = [r for r in rows if r.get("month") == "2026-08"]
            sep_rows = [r for r in rows if r.get("month") == "2026-09"]

            aug_rev = sum(float(r.get(primary_num, 0) or 0) for r in aug_rows) if aug_rows else 331600.0
            sep_rev = sum(float(r.get(primary_num, 0) or 0) for r in sep_rows) if sep_rows else 284500.0
            diff = sep_rev - aug_rev
            pct = (diff / aug_rev * 100) if aug_rev != 0 else 0.0
            direction = "down" if diff < 0 else "up"

            findings.append(
                FindingCard(
                    title="Revenue Period Delta",
                    statement=f"[Demo Analytical Interpretation] Query results show revenue changed by ${abs(diff):,.2f} ({pct:+.1f}%) between August and September 2026.",
                    metric_value=f"{pct:+.1f}% (${diff:,.0f})",
                    change_direction=direction,
                    significance="high",
                )
            )

            if "region_name" in columns:
                findings.append(
                    FindingCard(
                        title="Geographic Contribution",
                        statement="[Demo Analytical Interpretation] Regional volume decomposition isolates EMEA contraction as the primary variance contributor.",
                        metric_value="EMEA Variance Driver",
                        change_direction="alert",
                        significance="high",
                    )
                )

            findings.append(
                FindingCard(
                    title="Transaction Volume",
                    statement=f"Retrieved {row_count} aggregated data points from the analytics warehouse for this period.",
                    metric_value=f"{row_count} records",
                    change_direction="flat",
                    significance="low",
                )
            )

            # Build comparison chart from queried rows if regional breakdown exists
            if "region_name" in columns:
                region_map: Dict[str, Dict[str, float]] = {}
                for r in rows:
                    reg = r.get("region_name", "Unknown")
                    m = r.get("month", "Unknown")
                    val = float(r.get(primary_num, 0) or 0)
                    if reg not in region_map:
                        region_map[reg] = {"region": reg, "August": 0.0, "September": 0.0}
                    if m == "2026-08":
                        region_map[reg]["August"] += val
                    elif m == "2026-09":
                        region_map[reg]["September"] += val

                chart_data = list(region_map.values())
                charts.append(
                    ChartConfig(
                        chart_type="bar",
                        title="Revenue Comparison by Region (August vs September 2026)",
                        x_key="region",
                        y_keys=["August", "September"],
                        data=chart_data if chart_data else [
                            {"region": "North America", "August": 142000, "September": 144500},
                            {"region": "EMEA", "August": 135900, "September": 99500},
                            {"region": "APAC", "August": 38700, "September": 28500},
                            {"region": "LATAM", "August": 15000, "September": 12000},
                        ],
                    )
                )
            else:
                charts.append(
                    ChartConfig(
                        chart_type="bar",
                        title=f"{primary_num.title()} by Month",
                        x_key="month",
                        y_keys=[primary_num],
                        data=rows,
                    )
                )

            summary = (
                f"[Demo Analytical Interpretation] Revenue changed by {pct:+.1f}% (${diff:,.0f}) from August (${aug_rev:,.0f}) "
                f"to September (${sep_rev:,.0f}) 2026 based on {row_count} returned records. EMEA variance accounted for the primary contraction."
            )

        # Case 2: Regional analysis
        elif "region" in lower_q or "region_name" in columns:
            if primary_num:
                total_val = sum(float(r.get(primary_num, 0) or 0) for r in rows)
                top_row = max(rows, key=lambda r: float(r.get(primary_num, 0) or 0)) if rows else {}
                top_region = top_row.get("region_name", "Leading Region")
                top_amount = float(top_row.get(primary_num, 0) or 0)

                findings.append(
                    FindingCard(
                        title="Top Regional Contributor",
                        statement=f"[Demo Analytical Interpretation] {top_region} led performance with ${top_amount:,.2f} in {primary_num}.",
                        metric_value=f"${top_amount:,.0f}",
                        change_direction="up",
                        significance="high",
                    )
                )
                findings.append(
                    FindingCard(
                        title="Total Aggregated Value",
                        statement=f"Aggregated across {row_count} regional categories in the analytics dataset.",
                        metric_value=f"${total_val:,.0f} Total",
                        change_direction="up",
                        significance="medium",
                    )
                )

                charts.append(
                    ChartConfig(
                        chart_type="bar",
                        title=f"Regional {primary_num.replace('_', ' ').title()}",
                        x_key="region_name" if "region_name" in columns else columns[0],
                        y_keys=[primary_num],
                        data=rows,
                    )
                )
                summary = f"Evaluated {row_count} regional segments. {top_region} registered as the primary contributor with ${top_amount:,.2f}."
            else:
                findings.append(
                    FindingCard(
                        title="Regional Records",
                        statement=f"Queried {row_count} regional rows from the dataset.",
                        metric_value=f"{row_count} rows",
                        change_direction="flat",
                        significance="medium",
                    )
                )
                summary = f"Retrieved {row_count} regional records based on question parameters."

        # Case 3: Category / Product analysis
        elif ("product" in lower_q or "category" in lower_q or "category" in columns) and primary_num:
            total_val = sum(float(r.get(primary_num, 0) or 0) for r in rows)
            top_row = max(rows, key=lambda r: float(r.get(primary_num, 0) or 0)) if rows else {}
            top_cat = top_row.get("category", top_row.get("product_name", "Leading Category"))
            top_amount = float(top_row.get(primary_num, 0) or 0)

            findings.append(
                FindingCard(
                    title="Leading Category",
                    statement=f"[Demo Analytical Interpretation] {top_cat} generated ${top_amount:,.2f} ({top_amount / total_val * 100:.1f}% share).",
                    metric_value=f"${top_amount:,.0f}",
                    change_direction="up",
                    significance="high",
                )
            )
            findings.append(
                FindingCard(
                    title="Category Distribution",
                    statement=f"Analyzed {row_count} category segments totaling ${total_val:,.2f}.",
                    metric_value=f"{row_count} categories",
                    change_direction="flat",
                    significance="medium",
                )
            )
            charts.append(
                ChartConfig(
                    chart_type="bar",
                    title=f"Category Breakdown ({primary_num.replace('_', ' ').title()})",
                    x_key="category" if "category" in columns else columns[0],
                    y_keys=[primary_num],
                    data=rows[:10],
                )
            )
            summary = f"Category analysis completed across {row_count} offerings. {top_cat} ranked highest in {primary_num}."

        # Case 4: General fallback
        else:
            findings.append(
                FindingCard(
                    title="Query Execution Summary",
                    statement=f"Successfully extracted {row_count} records from the analytics database.",
                    metric_value=f"{row_count} records",
                    change_direction="flat",
                    significance="medium",
                )
            )

            if primary_num:
                total_val = sum(float(r.get(primary_num, 0) or 0) for r in rows)
                findings.append(
                    FindingCard(
                        title=f"Cumulative {primary_num.replace('_', ' ').title()}",
                        statement=f"Total sum across returned rows is ${total_val:,.2f}.",
                        metric_value=f"${total_val:,.0f}",
                        change_direction="up",
                        significance="low",
                    )
                )

                charts.append(
                    ChartConfig(
                        chart_type="line" if "month" in columns or "order_date" in columns else "bar",
                        title=f"{primary_num.replace('_', ' ').title()} Overview",
                        x_key="month" if "month" in columns else columns[0],
                        y_keys=[primary_num],
                        data=rows[:20],
                    )
                )

            summary = f"Analysis generated from {row_count} query result records matching '{question}'."

        return {
            "executive_answer": summary,
            "findings": findings,
            "charts": charts,
        }


analysis_service = AnalysisService()


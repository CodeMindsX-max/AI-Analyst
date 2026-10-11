from typing import Dict, Any, List
from app.services.sql_validation_service import sql_validation_service

# TODO(STUDENT): Implement model-backed Text-to-SQL generation.
# Suggested NLP/LLM engineering approaches:
# 1. Few-shot in-context learning with domain-specific SQLite schema prompts.
# 2. Grammar-constrained decoding (e.g. using outlines or guidance) to guarantee syntactically valid SQL.
# 3. Spider/BIRD benchmark evaluation techniques for measuring execution accuracy (EX) and valid SQL rate.


class TextToSqlService:
    """Service translating natural language questions into safe, executable SQL queries."""

    def generate_candidate_sql(
        self,
        question: str,
        schema_context: Dict[str, Any],
        glossary_context: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Generate deterministic candidate SQL grounded in schema context and question intent."""
        lower_q = question.lower()

        if "september" in lower_q or "decrease" in lower_q or "drop" in lower_q or "august" in lower_q:
            candidate_sql = (
                "SELECT strftime('%Y-%m', order_date) as month, region_name, category, "
                "ROUND(SUM(net_amount), 2) as revenue, COUNT(order_id) as orders "
                "FROM sales_orders "
                "WHERE order_date >= '2026-08-01' AND order_date <= '2026-09-30' "
                "GROUP BY month, region_name, category "
                "ORDER BY month ASC, revenue DESC;"
            )
            explanation = (
                "Aggregated revenue and order volumes across August and September 2026, "
                "grouped by month, geographic sales region, and product category to isolate variance drivers."
            )
        elif "region" in lower_q or "regional" in lower_q:
            candidate_sql = (
                "SELECT region_name, ROUND(SUM(net_amount), 2) as actual_revenue, "
                "ROUND(AVG(discount_rate) * 100, 1) as avg_discount_pct, COUNT(order_id) as total_orders "
                "FROM sales_orders "
                "GROUP BY region_name "
                "ORDER BY actual_revenue DESC;"
            )
            explanation = "Aggregated total net sales and order counts grouped by operating region."
        elif "product" in lower_q or "growing" in lower_q or "fastest" in lower_q:
            candidate_sql = (
                "SELECT category, product_name, ROUND(SUM(net_amount), 2) as revenue, "
                "SUM(quantity) as units_sold, ROUND(SUM(profit_amount), 2) as total_profit "
                "FROM sales_orders "
                "GROUP BY category, product_name "
                "ORDER BY revenue DESC;"
            )
            explanation = "Grouped sales volume and net profits across product lines and offerings."
        elif "segment" in lower_q or "customer" in lower_q or "churn" in lower_q:
            candidate_sql = (
                "SELECT c.segment, c.churn_risk, COUNT(DISTINCT c.customer_id) as customer_count, "
                "ROUND(SUM(s.net_amount), 2) as total_spend "
                "FROM customers c "
                "JOIN sales_orders s ON c.customer_id = s.customer_id "
                "GROUP BY c.segment, c.churn_risk "
                "ORDER BY total_spend DESC;"
            )
            explanation = "Joined customers dimension with sales orders to compute spend distribution across risk tiers."
        else:
            candidate_sql = (
                "SELECT strftime('%Y-%m', order_date) as month, "
                "ROUND(SUM(net_amount), 2) as monthly_revenue, COUNT(order_id) as order_count "
                "FROM sales_orders "
                "GROUP BY month "
                "ORDER BY month ASC;"
            )
            explanation = "Computed monthly sales totals and transaction counts across all historical orders."

        # Run safety validation on generated SQL
        validation = sql_validation_service.validate_query(candidate_sql)

        return {
            "sql": candidate_sql,
            "explanation": explanation,
            "validation": validation.model_dump(),
            "is_mock_generation": True,
        }


text_to_sql_service = TextToSqlService()

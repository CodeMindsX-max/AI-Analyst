from typing import List, Dict, Any, Optional
from app.providers.sqlite_demo_connector import SqliteDemoConnector
from app.schemas.data_sources import TableSchemaInfo, ColumnProfile

# TODO(STUDENT): Implement advanced schema retrieval and grounding.
# Techniques to evaluate:
# 1. Vector similarity search over table descriptions and column comments.
# 2. Join graph discovery: inferring primary-foreign key relationships from schema conventions.
# 3. Dynamic schema pruning: token-efficient schema compression for LLM prompt context.


class SchemaRetrievalService:
    """Service for retrieving database schema, column definitions, and join graphs."""

    def __init__(self, connector: Optional[SqliteDemoConnector] = None):
        self.connector = connector or SqliteDemoConnector()

    def get_all_tables(self) -> List[str]:
        return self.connector.list_tables()

    def get_table_schema(self, table_name: str) -> TableSchemaInfo:
        meta = self.connector.get_table_schema(table_name)
        profiles: List[ColumnProfile] = []
        for col in meta.columns:
            profiles.append(
                ColumnProfile(
                    name=col.name,
                    data_type=col.data_type,
                    null_count=0,
                    null_percentage=0.0,
                    distinct_count=meta.row_count,
                    sample_values=[],
                )
            )

        return TableSchemaInfo(
            table_name=meta.table_name,
            description=meta.description or f"Table {meta.table_name}",
            row_count=meta.row_count,
            columns=profiles,
        )

    def retrieve_relevant_schema_context(self, question: str) -> Dict[str, Any]:
        """Select schema context most relevant to the user's natural language question."""
        lower_q = question.lower()
        relevant_tables = ["sales_orders"]
        if "region" in lower_q or "country" in lower_q or "emea" in lower_q:
            relevant_tables.append("regions")
        if "product" in lower_q or "category" in lower_q or "saas" in lower_q:
            relevant_tables.append("products")
        if "customer" in lower_q or "segment" in lower_q or "churn" in lower_q:
            relevant_tables.append("customers")

        schema_summaries = []
        for t in relevant_tables:
            schema_info = self.get_table_schema(t)
            col_names = [c.name for c in schema_info.columns]
            schema_summaries.append(
                {
                    "table": t,
                    "description": schema_info.description,
                    "columns": col_names,
                    "row_count": schema_info.row_count,
                }
            )

        return {
            "tables_selected": relevant_tables,
            "schemas": schema_summaries,
            "join_keys": [
                {"from": "sales_orders.customer_id", "to": "customers.customer_id"},
                {"from": "sales_orders.product_id", "to": "products.product_id"},
                {"from": "sales_orders.region_id", "to": "regions.region_id"},
            ],
        }


schema_retrieval_service = SchemaRetrievalService()

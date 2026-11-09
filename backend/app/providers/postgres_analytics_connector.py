"""
PostgreSQL Analytics Connector for AnalystAI.

Executes read-only SQL queries against the 'analytics' schema in Supabase PostgreSQL.
This connector replaces the SQLite demo connector when PostgreSQL is configured.

Safety boundaries:
  - AST-level validation applied before this connector is called (sql_validation_service).
  - Queries are executed with query_timeout set via statement_timeout.
  - Results are hard-capped at MAX_QUERY_ROWS.
  - No DDL, DML, or multi-statement execution is permitted.
"""
import time
import re
from typing import List, Dict, Any

from sqlalchemy import text

from app.providers.database_connector_base import (
    DatabaseConnector,
    TableMeta,
    ColumnMeta,
    QueryExecutionResult,
)
from app.core.config import settings
from app.core.exceptions import UnsafeQueryException


# Tables visible to the analytics connector
_ANALYTICS_TABLES = ("sales_orders", "customers", "products", "regions")

_TABLE_DESCRIPTIONS = {
    "sales_orders": "Fact table containing historical sales transactions, net revenues, margins, and discounts.",
    "customers": "Customer master dimension including segment, geography, and churn risk classification.",
    "products": "Product catalog dimension with category, unit price, unit cost, and standard gross margin.",
    "regions": "Regional sales targets, current actual revenues, and regional leadership metadata.",
}


class PostgresAnalyticsConnector(DatabaseConnector):
    """
    Read-only PostgreSQL connector for the analytics schema (Supabase).

    Uses the shared analytics_engine from app.db.session which has
    search_path set to 'analytics, public' on every connection.
    """

    def __init__(self):
        # Import here to avoid circular imports during app startup
        from app.db.session import analytics_engine
        self._engine = analytics_engine

    def _safe_identifier(self, name: str) -> str:
        """Validate a table/column identifier to prevent injection."""
        if not re.match(r'^[a-zA-Z_][a-zA-Z0-9_]*$', name):
            raise UnsafeQueryException(f"Invalid identifier: {name!r}")
        return name

    def test_connection(self) -> Dict[str, Any]:
        start = time.perf_counter()
        try:
            with self._engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            latency = int((time.perf_counter() - start) * 1000)
            tables = self.list_tables()
            return {
                "success": True,
                "message": f"Connected to PostgreSQL analytics schema. Found {len(tables)} business tables.",
                "latency_ms": latency,
                "tables_found": len(tables),
                "is_simulated": False,
                "backend": "PostgreSQL (Supabase analytics schema)",
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Connection failed: {str(e)[:200]}",
                "latency_ms": 0,
                "tables_found": 0,
                "is_simulated": False,
            }

    def list_tables(self) -> List[str]:
        with self._engine.connect() as conn:
            rows = conn.execute(text(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_schema = 'analytics' ORDER BY table_name"
            )).fetchall()
        return [r[0] for r in rows]

    def get_table_schema(self, table_name: str) -> TableMeta:
        self._safe_identifier(table_name)
        with self._engine.connect() as conn:
            # Column metadata from information_schema
            col_rows = conn.execute(text(
                "SELECT column_name, data_type, is_nullable, "
                "CASE WHEN column_name IN ("
                "  SELECT kcu.column_name FROM information_schema.table_constraints tc "
                "  JOIN information_schema.key_column_usage kcu "
                "    ON tc.constraint_name = kcu.constraint_name "
                "    AND tc.table_schema = kcu.table_schema "
                "  WHERE tc.constraint_type = 'PRIMARY KEY' "
                "    AND tc.table_name = :tname AND tc.table_schema = 'analytics'"
                ") THEN true ELSE false END AS is_primary_key "
                "FROM information_schema.columns "
                "WHERE table_schema = 'analytics' AND table_name = :tname "
                "ORDER BY ordinal_position"
            ), {"tname": table_name}).fetchall()

            # Row count
            cnt = conn.execute(text(
                f"SELECT COUNT(*) FROM analytics.{table_name}"
            )).scalar()

        columns = [
            ColumnMeta(
                name=r[0],
                data_type=r[1],
                is_nullable=(r[2] == "YES"),
                is_primary_key=bool(r[3]),
            )
            for r in col_rows
        ]

        return TableMeta(
            table_name=table_name,
            columns=columns,
            row_count=cnt or 0,
            description=_TABLE_DESCRIPTIONS.get(table_name, f"Business table: {table_name}"),
        )

    def execute_read_only_query(self, query: str, limit: int = 500) -> QueryExecutionResult:
        clean_q = query.strip().rstrip(";")

        # Disallow multiple statements
        if ";" in clean_q:
            raise UnsafeQueryException("Multiple statements are strictly prohibited in SQL execution.")

        # Ensure query is SELECT or WITH ... SELECT
        upper_q = clean_q.upper().lstrip()
        if not (upper_q.startswith("SELECT") or upper_q.startswith("WITH")):
            raise UnsafeQueryException("Only SELECT and read-only CTE statements are permitted.")

        # Inject LIMIT if not already present
        if "LIMIT" not in upper_q:
            clean_q = f"{clean_q} LIMIT {limit}"

        start = time.perf_counter()
        try:
            with self._engine.connect() as conn:
                conn.execute(text("SET search_path TO analytics, public"))
                # Apply statement-level timeout (milliseconds)
                timeout_ms = settings.QUERY_TIMEOUT_SECONDS * 1000
                conn.execute(text(f"SET LOCAL statement_timeout = {timeout_ms}"))
                result = conn.execute(text(clean_q))
                columns = list(result.keys())
                rows_raw = result.fetchmany(limit + 1)

            duration_ms = int((time.perf_counter() - start) * 1000)
            is_truncated = len(rows_raw) > limit
            rows = rows_raw[:limit]
            rows_dict = [dict(zip(columns, r)) for r in rows]

            return QueryExecutionResult(
                columns=columns,
                rows=rows_dict,
                row_count=len(rows_dict),
                duration_ms=duration_ms,
                is_truncated=is_truncated,
            )
        except UnsafeQueryException:
            raise
        except Exception as e:
            err = str(e)
            if "statement_timeout" in err.lower() or "canceling statement" in err.lower():
                raise UnsafeQueryException(
                    f"Query exceeded the {settings.QUERY_TIMEOUT_SECONDS}s execution timeout."
                )
            raise UnsafeQueryException(f"SQL execution failed: {err[:300]}")

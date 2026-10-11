import sqlite3
import time
from pathlib import Path
from typing import List, Dict, Any, Optional
from app.providers.database_connector_base import (
    DatabaseConnector,
    TableMeta,
    ColumnMeta,
    QueryExecutionResult,
)
from app.core.config import settings
from app.core.exceptions import UnsafeQueryException


def sqlite_read_only_authorizer(action_code, arg1, arg2, db_name, trigger_name):
    """SQLite authorizer callback that enforces strict read-only execution."""
    # Allow safe read operations
    # SQLITE_OK = 0, SQLITE_DENY = 1, SQLITE_IGNORE = 2
    SAFE_ACTIONS = {
        sqlite3.SQLITE_SELECT,
        sqlite3.SQLITE_READ,
        sqlite3.SQLITE_FUNCTION,
    }
    if action_code in SAFE_ACTIONS:
        return sqlite3.SQLITE_OK

    # Explicitly deny write/DDL/administrative actions
    return sqlite3.SQLITE_DENY


class SqliteDemoConnector(DatabaseConnector):
    """Safe read-only SQLite connector for demo business analytics dataset."""

    def __init__(self, db_path: Optional[str] = None):
        if not db_path:
            p = settings.BASE_DIR / "data" / "analystai_analytics.db"
            self.db_path = str(p.resolve())
        else:
            self.db_path = db_path

    def _get_connection(self, read_only: bool = True) -> sqlite3.Connection:
        # Connect to SQLite
        conn = sqlite3.connect(self.db_path, timeout=settings.QUERY_TIMEOUT_SECONDS)
        conn.row_factory = sqlite3.Row
        if read_only:
            # Enforce read-only authorizer
            conn.set_authorizer(sqlite_read_only_authorizer)
        return conn

    def test_connection(self) -> Dict[str, Any]:
        start = time.perf_counter()
        try:
            conn = self._get_connection(read_only=True)
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchone()
            conn.close()
            latency = int((time.perf_counter() - start) * 1000)
            tables = self.list_tables()
            return {
                "success": True,
                "message": f"Successfully connected to demo analytics dataset. Found {len(tables)} business tables.",
                "latency_ms": latency,
                "tables_found": len(tables),
                "is_simulated": False,
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Connection failed: {str(e)}",
                "latency_ms": 0,
                "tables_found": 0,
                "is_simulated": False,
            }

    def list_tables(self) -> List[str]:
        conn = self._get_connection(read_only=False)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        tables = [row["name"] for row in cursor.fetchall()]
        conn.close()
        return tables

    def get_table_schema(self, table_name: str) -> TableMeta:
        conn = self._get_connection(read_only=False)
        cursor = conn.cursor()
        cursor.execute(f"PRAGMA table_info('{table_name}')")
        raw_cols = cursor.fetchall()
        columns: List[ColumnMeta] = []
        for c in raw_cols:
            columns.append(
                ColumnMeta(
                    name=c["name"],
                    data_type=c["type"],
                    is_nullable=bool(not c["notnull"]),
                    is_primary_key=bool(c["pk"]),
                )
            )

        cursor.execute(f"SELECT COUNT(*) AS cnt FROM '{table_name}'")
        cnt = cursor.fetchone()["cnt"]
        conn.close()

        descriptions = {
            "sales_orders": "Fact table containing historical sales transactions, net revenues, margins, and discounts.",
            "customers": "Customer master dimension including segment, geography, and churn risk classification.",
            "products": "Product catalog dimension with category, unit price, unit cost, and standard gross margin.",
            "regions": "Regional sales targets, current actual revenues, and regional leadership metadata.",
        }

        return TableMeta(
            table_name=table_name,
            columns=columns,
            row_count=cnt,
            description=descriptions.get(table_name, f"Business table: {table_name}"),
        )

    def execute_read_only_query(self, query: str, limit: int = 500) -> QueryExecutionResult:
        clean_q = query.strip()
        # Disallow multiple statements
        if ";" in clean_q.rstrip(";"):
            raise UnsafeQueryException("Multiple statements are strictly prohibited in SQL execution.")

        # Ensure query is SELECT or WITH ... SELECT
        upper_q = clean_q.upper()
        if not (upper_q.startswith("SELECT") or upper_q.startswith("WITH")):
            raise UnsafeQueryException("Only SELECT and read-only CTE statements are permitted.")

        start = time.perf_counter()
        conn = self._get_connection(read_only=True)
        cursor = conn.cursor()

        try:
            cursor.execute(clean_q)
            rows_raw = cursor.fetchmany(limit + 1)
            duration_ms = int((time.perf_counter() - start) * 1000)

            is_truncated = len(rows_raw) > limit
            rows = rows_raw[:limit]

            columns = [desc[0] for desc in cursor.description] if cursor.description else []
            rows_dict = [dict(r) for r in rows]

            return QueryExecutionResult(
                columns=columns,
                rows=rows_dict,
                row_count=len(rows_dict),
                duration_ms=duration_ms,
                is_truncated=is_truncated,
            )
        except sqlite3.DatabaseError as e:
            raise UnsafeQueryException(f"SQL execution restricted or failed: {str(e)}")
        finally:
            conn.close()

"""
SQL Execution Service for AnalystAI.

Executes validated, read-only SQL queries against the analytics schema
in Supabase PostgreSQL. The PostgresAnalyticsConnector enforces:
  - AST pre-validation (via sql_validation_service)
  - statement_timeout for query duration control
  - Hard row count limits
  - SELECT-only execution (no DDL, DML, or multi-statement)
"""
from typing import Optional
from sqlalchemy.orm import Session

from app.providers.postgres_analytics_connector import PostgresAnalyticsConnector
from app.services.sql_validation_service import sql_validation_service
from app.schemas.sql import SqlExecuteResponse
from app.core.exceptions import UnsafeQueryException
from app.models.data_source import DataSource


class SqlExecutionService:
    """Service safely executing read-only SQL queries against the analytics PostgreSQL schema."""

    def __init__(self, connector: Optional[PostgresAnalyticsConnector] = None):
        self.connector = connector or PostgresAnalyticsConnector()

    def execute(
        self,
        query_sql: str,
        limit: int = 500,
        source_id: Optional[str] = None,
        db: Optional[Session] = None,
    ) -> SqlExecuteResponse:
        # Validate the data source if explicitly specified
        if source_id and source_id not in ("demo-source-1", "default", None):
            if db is not None:
                ds = db.query(DataSource).filter(DataSource.id == source_id).first()
                if not ds:
                    return SqlExecuteResponse(
                        columns=[],
                        rows=[],
                        row_count=0,
                        duration_ms=0,
                        status="error",
                        error_message=f"Data source '{source_id}' was not found in the workspace.",
                    )
                # Only allow demo dataset and postgresql sources; block scaffolded external connectors
                if ds.kind not in ("demo_dataset", "postgresql") or ds.status == "scaffold":
                    return SqlExecuteResponse(
                        columns=[],
                        rows=[],
                        row_count=0,
                        duration_ms=0,
                        status="error",
                        error_message=(
                            f"Data source '{ds.name}' ({ds.kind}) is a scaffolded connector. "
                            "Only the demo analytical dataset supports direct query execution."
                        ),
                    )
            else:
                return SqlExecuteResponse(
                    columns=[],
                    rows=[],
                    row_count=0,
                    duration_ms=0,
                    status="error",
                    error_message=f"Remote data source '{source_id}' execution requires database session context.",
                )

        # Pre-execution AST-level validation
        validation = sql_validation_service.validate_query(query_sql)
        if not validation.is_valid:
            reasons_str = "; ".join(validation.reasons)
            return SqlExecuteResponse(
                columns=[],
                rows=[],
                row_count=0,
                duration_ms=0,
                status="error",
                error_message=f"Validation failed: {reasons_str}",
            )

        try:
            result = self.connector.execute_read_only_query(query_sql, limit=limit)
            return SqlExecuteResponse(
                columns=result.columns,
                rows=result.rows,
                row_count=result.row_count,
                duration_ms=result.duration_ms,
                status="success",
                error_message=None,
            )
        except UnsafeQueryException as e:
            return SqlExecuteResponse(
                columns=[],
                rows=[],
                row_count=0,
                duration_ms=0,
                status="error",
                error_message=str(e.detail),
            )
        except Exception as e:
            return SqlExecuteResponse(
                columns=[],
                rows=[],
                row_count=0,
                duration_ms=0,
                status="error",
                error_message=f"Execution error: {str(e)[:200]}",
            )


sql_execution_service = SqlExecutionService()

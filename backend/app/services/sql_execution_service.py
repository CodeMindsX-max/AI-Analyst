from typing import Optional
from app.providers.sqlite_demo_connector import SqliteDemoConnector
from app.services.sql_validation_service import sql_validation_service
from app.schemas.sql import SqlExecuteResponse
from app.core.exceptions import UnsafeQueryException


class SqlExecutionService:
    """Service safely executing read-only SQL queries against the analytics database."""

    def __init__(self, connector: Optional[SqliteDemoConnector] = None):
        self.connector = connector or SqliteDemoConnector()

    def execute(self, query_sql: str, limit: int = 500) -> SqlExecuteResponse:
        # Pre-execution validation
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
                error_message=f"Execution error: {str(e)}",
            )


sql_execution_service = SqlExecutionService()

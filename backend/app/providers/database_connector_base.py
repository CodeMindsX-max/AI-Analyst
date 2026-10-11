from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class ColumnMeta(BaseModel):
    name: str
    data_type: str
    is_nullable: bool = True
    is_primary_key: bool = False


class TableMeta(BaseModel):
    table_name: str
    columns: List[ColumnMeta]
    row_count: int = 0
    description: Optional[str] = None


class QueryExecutionResult(BaseModel):
    columns: List[str]
    rows: List[Dict[str, Any]]
    row_count: int
    duration_ms: int
    is_truncated: bool = False


class DatabaseConnector(ABC):
    """Abstract Base Class for Database Connectors."""

    # TODO(STUDENT): Implement a production connector (e.g. PostgresConnector or MySQLConnector)
    # Ensure:
    # 1. Connection pooling with timeout
    # 2. Read-only user credentials with strict SELECT permissions only
    # 3. Parameterized queries or AST safety verification
    # 4. Row limits to protect against memory exhaustion

    @abstractmethod
    def test_connection(self) -> Dict[str, Any]:
        """Test whether database connection succeeds."""
        pass

    @abstractmethod
    def list_tables(self) -> List[str]:
        """List tables accessible in the database."""
        pass

    @abstractmethod
    def get_table_schema(self, table_name: str) -> TableMeta:
        """Get column metadata and row count for a table."""
        pass

    @abstractmethod
    def execute_read_only_query(self, query: str, limit: int = 500) -> QueryExecutionResult:
        """Execute validated read-only SQL and return tabular results."""
        pass

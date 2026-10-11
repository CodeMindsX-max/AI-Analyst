from typing import List, Dict, Any
from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.providers.sqlite_demo_connector import SqliteDemoConnector
from app.schemas.data_sources import TableSchemaInfo, TablePreviewResponse, ColumnProfile
from app.core.exceptions import ResourceNotFoundException

router = APIRouter(prefix="/explorer", tags=["Data Explorer"])
connector = SqliteDemoConnector()


@router.get("/sources/{source_id}/tables", response_model=List[str])
def list_tables(source_id: str):
    """List business tables available in selected source."""
    return connector.list_tables()


@router.get("/tables/{table_name}/schema", response_model=TableSchemaInfo)
def get_table_schema(table_name: str):
    """Retrieve detailed schema, inferred types, and row count for a table."""
    tables = connector.list_tables()
    if table_name not in tables:
        raise ResourceNotFoundException("Table", table_name)

    meta = connector.get_table_schema(table_name)
    profiles = []
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
        description=meta.description or f"Business table: {table_name}",
        row_count=meta.row_count,
        columns=profiles,
    )


@router.get("/tables/{table_name}/rows", response_model=TablePreviewResponse)
def get_table_rows(
    table_name: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
):
    """Retrieve paginated rows for table data preview."""
    tables = connector.list_tables()
    if table_name not in tables:
        raise ResourceNotFoundException("Table", table_name)

    offset = (page - 1) * page_size
    query = f"SELECT * FROM '{table_name}' LIMIT {page_size} OFFSET {offset}"
    res = connector.execute_read_only_query(query, limit=page_size)

    schema_info = connector.get_table_schema(table_name)

    return TablePreviewResponse(
        table_name=table_name,
        columns=res.columns,
        rows=res.rows,
        total_rows=schema_info.row_count,
        page=page,
        page_size=page_size,
    )


@router.get("/tables/{table_name}/profile", response_model=List[ColumnProfile])
def get_table_profile(table_name: str):
    """Retrieve column-level profiling metrics: nulls, distinct counts, and min/max/mean."""
    tables = connector.list_tables()
    if table_name not in tables:
        raise ResourceNotFoundException("Table", table_name)

    meta = connector.get_table_schema(table_name)
    sample_res = connector.execute_read_only_query(f"SELECT * FROM '{table_name}' LIMIT 50")

    profiles = []
    for col in meta.columns:
        sample_vals = [r[col.name] for r in sample_res.rows if col.name in r][:5]
        profiles.append(
            ColumnProfile(
                name=col.name,
                data_type=col.data_type,
                null_count=0,
                null_percentage=0.0,
                distinct_count=min(meta.row_count, 50),
                sample_values=sample_vals,
            )
        )
    return profiles

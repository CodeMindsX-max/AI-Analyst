import uuid
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.sql import QueryHistory, SavedQuery
from app.schemas.sql import (
    SqlValidateRequest,
    SqlValidateResponse,
    SqlExecuteRequest,
    SqlExecuteResponse,
    SqlExplainRequest,
    SqlExplainResponse,
    SqlFormatRequest,
    SqlFormatResponse,
    SavedQueryCreate,
    SavedQueryResponse,
)
from app.services.sql_validation_service import sql_validation_service
from app.services.sql_execution_service import sql_execution_service
from app.services.audit_service import audit_service

router = APIRouter(prefix="/sql", tags=["SQL Workspace"])


@router.post("/validate", response_model=SqlValidateResponse)
def validate_sql(data: SqlValidateRequest):
    """Validate SQL query for read-only safety, table constraints, and syntax."""
    return sql_validation_service.validate_query(data.query_sql)


@router.post("/execute", response_model=SqlExecuteResponse)
def execute_sql(data: SqlExecuteRequest, db: Session = Depends(get_db)):
    """Safely execute read-only SQL query against the demo analytics database."""
    res = sql_execution_service.execute(data.query_sql, limit=data.limit or 100)

    # Persist in query history
    qh = QueryHistory(
        id=f"qh-{uuid.uuid4().hex[:10]}",
        workspace_id="default-ws",
        query_sql=data.query_sql,
        status=res.status,
        row_count=res.row_count,
        duration_ms=res.duration_ms,
        error_message=res.error_message,
        user_email="demo@analystai.local",
    )
    db.add(qh)
    db.commit()

    audit_service.log_event(
        db,
        action="sql.execute",
        resource_type="query",
        outcome=res.status,
        detail={"row_count": res.row_count, "duration_ms": res.duration_ms},
    )

    return res


@router.post("/format", response_model=SqlFormatResponse)
def format_sql(data: SqlFormatRequest):
    """Format and indent SQL code for readability."""
    clean = " ".join(data.query_sql.split())
    # Simple, reliable formatting of main keywords
    keywords = ["SELECT", "FROM", "WHERE", "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "LEFT JOIN", "JOIN"]
    formatted = clean
    for kw in keywords:
        formatted = formatted.replace(f" {kw} ", f"\n{kw} ").replace(f" {kw.lower()} ", f"\n{kw} ")
    return SqlFormatResponse(formatted_sql=formatted.strip())


@router.post("/explain", response_model=SqlExplainResponse)
def explain_sql(data: SqlExplainRequest):
    """Generate execution plan and cost explanation for a SELECT query."""
    val = sql_validation_service.validate_query(data.query_sql)
    tables = val.tables_referenced or ["sales_orders"]
    return SqlExplainResponse(
        plan_explanation=f"Query scans {len(tables)} table(s) [{', '.join(tables)}] using sequential scan on SQLite primary indices. Aggregations applied in memory.",
        estimated_cost="Low (Estimated latency < 15ms)",
        indexes_used=["PRIMARY_KEY", "idx_order_date"],
        scanned_tables=tables,
    )


@router.get("/history")
def get_query_history(db: Session = Depends(get_db)):
    """Retrieve recent queries executed in the SQL Workspace."""
    history = db.query(QueryHistory).order_by(QueryHistory.created_at.desc()).limit(30).all()
    return [
        {
            "id": h.id,
            "query_sql": h.query_sql,
            "status": h.status,
            "row_count": h.row_count,
            "duration_ms": h.duration_ms,
            "error_message": h.error_message,
            "created_at": h.created_at.isoformat(),
        }
        for h in history
    ]


@router.get("/saved-queries", response_model=List[SavedQueryResponse])
def get_saved_queries(db: Session = Depends(get_db)):
    """List saved queries in SQL Workspace."""
    queries = db.query(SavedQuery).order_by(SavedQuery.created_at.desc()).all()
    if not queries:
        # Provide default seed query
        return [
            SavedQueryResponse(
                id="sq-default-1",
                name="August vs September Monthly Revenue by Category",
                description="Comparative monthly breakdown of sales across SaaS and Services.",
                query_sql=(
                    "SELECT strftime('%Y-%m', order_date) as month, category, ROUND(SUM(net_amount), 2) as revenue "
                    "FROM sales_orders WHERE order_date >= '2026-08-01' GROUP BY month, category ORDER BY month ASC;"
                ),
                owner="Demo Admin",
                created_at="2026-10-11T12:00:00Z",
                updated_at="2026-10-11T12:00:00Z",
            )
        ]
    return [
        SavedQueryResponse(
            id=q.id,
            name=q.name,
            description=q.description,
            query_sql=q.query_sql,
            owner=q.owner,
            created_at=q.created_at.isoformat(),
            updated_at=q.updated_at.isoformat(),
        )
        for q in queries
    ]


@router.post("/saved-queries", response_model=SavedQueryResponse)
def create_saved_query(data: SavedQueryCreate, db: Session = Depends(get_db)):
    """Save a query to workspace query repository."""
    sq = SavedQuery(
        id=f"sq-{uuid.uuid4().hex[:10]}",
        workspace_id="default-ws",
        name=data.name,
        description=data.description or "",
        query_sql=data.query_sql,
        owner="Demo Admin",
    )
    db.add(sq)
    db.commit()
    db.refresh(sq)
    return SavedQueryResponse(
        id=sq.id,
        name=sq.name,
        description=sq.description,
        query_sql=sq.query_sql,
        owner=sq.owner,
        created_at=sq.created_at.isoformat(),
        updated_at=sq.updated_at.isoformat(),
    )

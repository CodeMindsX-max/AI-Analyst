from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.analyst import AgentRun
from app.schemas.analyst import AgentRunResponse, AnalystRunRequest
from app.services.analyst_service import analyst_service
from app.core.exceptions import ResourceNotFoundException

router = APIRouter(prefix="/agent-runs", tags=["Agent Runs & Monitoring"])


@router.get("", response_model=List[AgentRunResponse])
def list_agent_runs(
    status: Optional[str] = Query(None, description="Filter by run status"),
    db: Session = Depends(get_db),
):
    """List agent execution runs with status and latency metrics."""
    query = db.query(AgentRun)
    if status:
        query = query.filter(AgentRun.status == status)
    runs = query.order_by(AgentRun.created_at.desc()).limit(50).all()
    return [analyst_service.get_run_response(db, r.id) for r in runs]


@router.get("/{run_id}", response_model=AgentRunResponse)
def get_agent_run(run_id: str, db: Session = Depends(get_db)):
    """Retrieve full timeline and details for a specific agent execution."""
    return analyst_service.get_run_response(db, run_id)


@router.post("/{run_id}/retry", response_model=AgentRunResponse)
def retry_agent_run(run_id: str, db: Session = Depends(get_db)):
    """Retry an agent analysis run."""
    run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
    if not run:
        raise ResourceNotFoundException("AgentRun", run_id)
    req = AnalystRunRequest(question=run.question, source_id=run.source_id)
    return analyst_service.create_run(db, req, user_email="demo@analystai.local")

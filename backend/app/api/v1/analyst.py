from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.analyst import (
    AnalystRunRequest,
    FollowUpRequest,
    AgentRunResponse,
    AgentRunEventResponse,
    SaveAnalysisRequest,
    SavedAnalysisResponse,
    PromptSuggestion,
)
from app.services.analyst_service import analyst_service
from app.services.audit_service import audit_service

router = APIRouter(prefix="/analyst", tags=["AI Analyst"])


@router.get("/suggestions", response_model=List[PromptSuggestion])
def get_prompt_suggestions():
    """Get suggested business questions and templates for exploration."""
    return analyst_service.get_suggestions()


@router.post("/runs", response_model=AgentRunResponse)
def create_analyst_run(data: AnalystRunRequest, db: Session = Depends(get_db)):
    """Run business data analyst pipeline on a natural language question."""
    resp = analyst_service.create_run(db, data, user_email="demo@analystai.local")
    audit_service.log_event(
        db,
        action="analyst.run",
        resource_type="agent_run",
        resource_id=resp.id,
        detail={"question": data.question, "source_id": data.source_id},
    )
    return resp


@router.get("/runs/{run_id}", response_model=AgentRunResponse)
def get_analyst_run(run_id: str, db: Session = Depends(get_db)):
    """Retrieve full analysis run result, findings, charts, data, and timeline."""
    return analyst_service.get_run_response(db, run_id)


@router.get("/runs/{run_id}/events", response_model=List[AgentRunEventResponse])
def get_analyst_run_events(run_id: str, db: Session = Depends(get_db)):
    """Retrieve execution events and step log for a specific run."""
    run = analyst_service.get_run_response(db, run_id)
    return run.events


@router.post("/runs/{run_id}/follow-up", response_model=AgentRunResponse)
def follow_up_run(run_id: str, data: FollowUpRequest, db: Session = Depends(get_db)):
    """Submit a contextual follow-up question extending a previous analysis."""
    req = AnalystRunRequest(question=data.follow_up_question)
    return analyst_service.create_run(db, req, user_email="demo@analystai.local")


@router.post("/analyses/{analysis_id}/save", response_model=SavedAnalysisResponse)
def save_analysis(analysis_id: str, data: SaveAnalysisRequest, db: Session = Depends(get_db)):
    """Save an analysis to workspace library for bookmarking and sharing."""
    saved = analyst_service.save_analysis(db, data, user_email="demo@analystai.local")
    audit_service.log_event(
        db,
        action="analysis.save",
        resource_type="saved_analysis",
        resource_id=saved.id,
        detail={"title": data.title, "run_id": data.run_id},
    )
    return saved

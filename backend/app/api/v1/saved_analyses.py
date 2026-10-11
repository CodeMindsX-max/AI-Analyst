import json
import uuid
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.analyst import SavedAnalysis
from app.schemas.analyst import SavedAnalysisResponse, SaveAnalysisRequest
from app.services.analyst_service import analyst_service
from app.core.exceptions import ResourceNotFoundException

router = APIRouter(prefix="/saved-analyses", tags=["Saved Analyses"])


@router.get("", response_model=List[SavedAnalysisResponse])
def list_saved_analyses(db: Session = Depends(get_db)):
    """List all saved business analyses."""
    return analyst_service.list_saved_analyses(db)


@router.post("", response_model=SavedAnalysisResponse)
def save_analysis(data: SaveAnalysisRequest, db: Session = Depends(get_db)):
    """Save an analysis to workspace library."""
    return analyst_service.save_analysis(db, data, user_email="demo@analystai.local")


@router.get("/{analysis_id}", response_model=SavedAnalysisResponse)
def get_saved_analysis(analysis_id: str, db: Session = Depends(get_db)):
    """Retrieve saved analysis record by ID."""
    s = db.query(SavedAnalysis).filter(SavedAnalysis.id == analysis_id).first()
    if not s:
        raise ResourceNotFoundException("SavedAnalysis", analysis_id)
    return SavedAnalysisResponse(
        id=s.id,
        title=s.title,
        question=s.question,
        summary=s.summary,
        run_id=s.run_id,
        query_sql=s.query_sql,
        chart_config=json.loads(s.chart_config_json) if s.chart_config_json else {},
        tags=json.loads(s.tags_json) if s.tags_json else [],
        owner=s.owner,
        is_pinned=s.is_pinned,
        created_at=s.created_at.isoformat(),
        updated_at=s.updated_at.isoformat(),
    )


@router.delete("/{analysis_id}")
def delete_saved_analysis(analysis_id: str, db: Session = Depends(get_db)):
    """Delete a saved analysis from library."""
    s = db.query(SavedAnalysis).filter(SavedAnalysis.id == analysis_id).first()
    if not s:
        raise ResourceNotFoundException("SavedAnalysis", analysis_id)
    db.delete(s)
    db.commit()
    return {"message": "Saved analysis deleted successfully."}

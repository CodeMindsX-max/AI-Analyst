from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.bi import ScheduledJobCreate, ScheduledJobResponse
from app.services.scheduling_service import scheduling_service

router = APIRouter(prefix="/schedules", tags=["Schedules"])


@router.get("", response_model=List[ScheduledJobResponse])
def list_schedules(db: Session = Depends(get_db)):
    """List scheduled analysis and report jobs."""
    return scheduling_service.list_jobs(db)


@router.post("", response_model=ScheduledJobResponse)
def create_schedule(data: ScheduledJobCreate, db: Session = Depends(get_db)):
    """Create a new recurring scheduled briefing or report job."""
    return scheduling_service.create_job(db, data, owner="demo@analystai.local")


@router.delete("/{job_id}")
def delete_schedule(job_id: str, db: Session = Depends(get_db)):
    """Delete a scheduled job."""
    scheduling_service.delete_job(db, job_id)
    return {"message": "Scheduled job deleted successfully."}

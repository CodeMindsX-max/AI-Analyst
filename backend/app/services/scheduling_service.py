import json
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.bi import ScheduledJob
from app.schemas.bi import ScheduledJobCreate, ScheduledJobResponse
from app.core.exceptions import ResourceNotFoundException


class SchedulingService:
    """Service managing scheduled analysis briefing runs and report triggers."""

    def list_jobs(self, db: Session) -> List[ScheduledJobResponse]:
        jobs = db.query(ScheduledJob).order_by(ScheduledJob.created_at.desc()).all()
        return [self._to_response(j) for j in jobs]

    def create_job(self, db: Session, data: ScheduledJobCreate, owner: str = "Demo Admin") -> ScheduledJobResponse:
        now = datetime.now(timezone.utc)
        next_run = now + timedelta(days=7 if data.frequency == "weekly" else 1)

        job = ScheduledJob(
            id=f"job-{uuid.uuid4().hex[:10]}",
            workspace_id="default-ws",
            name=data.name,
            task_type=data.task_type or "report_generation",
            target_id=data.target_id,
            frequency=data.frequency,
            cron_expr=data.cron_expr or "0 9 * * 1",
            run_time=data.run_time or "09:00",
            timezone=data.timezone or "UTC",
            output_type=data.output_type or "in_app",
            recipients_json=json.dumps(data.recipients),
            is_active=data.is_active,
            last_run_at=now - timedelta(days=7),
            next_run_at=next_run,
            owner=owner,
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        return self._to_response(job)

    def delete_job(self, db: Session, job_id: str) -> bool:
        job = db.query(ScheduledJob).filter(ScheduledJob.id == job_id).first()
        if not job:
            raise ResourceNotFoundException("ScheduledJob", job_id)
        db.delete(job)
        db.commit()
        return True

    def _to_response(self, j: ScheduledJob) -> ScheduledJobResponse:
        recipients = json.loads(j.recipients_json) if j.recipients_json else []
        return ScheduledJobResponse(
            id=j.id,
            name=j.name,
            task_type=j.task_type,
            target_id=j.target_id,
            frequency=j.frequency,
            cron_expr=j.cron_expr,
            run_time=j.run_time,
            timezone=j.timezone,
            output_type=j.output_type,
            recipients=recipients,
            is_active=j.is_active,
            last_run_at=j.last_run_at.isoformat() if j.last_run_at else None,
            next_run_at=j.next_run_at.isoformat() if j.next_run_at else None,
            owner=j.owner,
            created_at=j.created_at.isoformat(),
        )


scheduling_service = SchedulingService()

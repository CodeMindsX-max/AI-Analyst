import json
import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.operations import AuditEvent
from app.schemas.operations import AuditEventResponse


class AuditService:
    """Service recording and querying security and administrative audit events."""

    def log_event(
        self,
        db: Session,
        action: str,
        resource_type: str,
        resource_id: Optional[str] = None,
        actor_email: str = "demo@analystai.local",
        outcome: str = "success",
        detail: Optional[Dict[str, Any]] = None,
        ip_address: str = "127.0.0.1",
    ) -> AuditEvent:
        safe_detail = detail.copy() if detail else {}
        # Scrub any sensitive keys if accidentally present
        for key in list(safe_detail.keys()):
            if "password" in key.lower() or "token" in key.lower() or "secret" in key.lower():
                safe_detail[key] = "[REDACTED]"

        event = AuditEvent(
            id=f"aud-{uuid.uuid4().hex[:10]}",
            workspace_id="default-ws",
            actor_email=actor_email,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            outcome=outcome,
            detail_json=json.dumps(safe_detail),
            ip_address=ip_address,
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event

    def list_events(self, db: Session, limit: int = 100) -> List[AuditEventResponse]:
        events = db.query(AuditEvent).order_by(AuditEvent.created_at.desc()).limit(limit).all()
        return [
            AuditEventResponse(
                id=e.id,
                actor_email=e.actor_email,
                action=e.action,
                resource_type=e.resource_type,
                resource_id=e.resource_id,
                outcome=e.outcome,
                detail=json.loads(e.detail_json) if e.detail_json else {},
                ip_address=e.ip_address,
                created_at=e.created_at.isoformat(),
            )
            for e in events
        ]


audit_service = AuditService()

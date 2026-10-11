import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.operations import Notification
from app.schemas.operations import NotificationResponse
from app.core.exceptions import ResourceNotFoundException


class NotificationService:
    """Service managing workspace operational and analytical notifications."""

    def list_notifications(self, db: Session) -> List[NotificationResponse]:
        items = db.query(Notification).order_by(Notification.created_at.desc()).all()
        return [
            NotificationResponse(
                id=n.id,
                title=n.title,
                message=n.message,
                notification_type=n.notification_type,
                severity=n.severity,
                is_read=n.is_read,
                link_url=n.link_url,
                created_at=n.created_at.isoformat(),
            )
            for n in items
        ]

    def mark_as_read(self, db: Session, notification_id: str) -> bool:
        n = db.query(Notification).filter(Notification.id == notification_id).first()
        if not n:
            raise ResourceNotFoundException("Notification", notification_id)
        n.is_read = True
        db.commit()
        return True

    def mark_all_as_read(self, db: Session) -> int:
        count = db.query(Notification).filter(Notification.is_read == False).update({"is_read": True})
        db.commit()
        return count


notification_service = NotificationService()

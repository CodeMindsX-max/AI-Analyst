from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.operations import NotificationResponse
from app.services.notification_service import notification_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=List[NotificationResponse])
def list_notifications(db: Session = Depends(get_db)):
    """List operational and analytical notifications."""
    return notification_service.list_notifications(db)


@router.post("/{notification_id}/read")
def mark_notification_read(notification_id: str, db: Session = Depends(get_db)):
    """Mark a notification as read."""
    notification_service.mark_as_read(db, notification_id)
    return {"message": "Notification marked as read."}


@router.post("/read-all")
def mark_all_read(db: Session = Depends(get_db)):
    """Mark all notifications as read."""
    count = notification_service.mark_all_as_read(db)
    return {"message": f"{count} notifications marked as read."}

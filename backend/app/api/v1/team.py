import uuid
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.operations import TeamMember
from app.schemas.operations import TeamMemberCreate, TeamMemberUpdate, TeamMemberResponse
from app.core.exceptions import ResourceNotFoundException
from app.services.audit_service import audit_service

router = APIRouter(prefix="/team", tags=["Team & Access"])


@router.get("", response_model=List[TeamMemberResponse])
def list_team_members(db: Session = Depends(get_db)):
    """List members of current workspace."""
    members = db.query(TeamMember).order_by(TeamMember.created_at.asc()).all()
    return [
        TeamMemberResponse(
            id=m.id,
            email=m.email,
            name=m.name,
            role=m.role,
            status=m.status,
            last_active_at=m.last_active_at.isoformat() if m.last_active_at else None,
            created_at=m.created_at.isoformat(),
        )
        for m in members
    ]


@router.post("/invitations", response_model=TeamMemberResponse)
def invite_member(data: TeamMemberCreate, db: Session = Depends(get_db)):
    """Invite a new user to the workspace with specified role."""
    tm = TeamMember(
        id=f"tm-{uuid.uuid4().hex[:8]}",
        workspace_id="default-ws",
        user_id=f"usr-{uuid.uuid4().hex[:8]}",
        email=data.email,
        name=data.name,
        role=data.role,
        status="active",
        last_active_at=datetime.now(timezone.utc),
    )
    db.add(tm)
    db.commit()
    db.refresh(tm)

    audit_service.log_event(
        db,
        action="team.invite",
        resource_type="team_member",
        resource_id=tm.id,
        detail={"email": tm.email, "role": tm.role},
    )

    return TeamMemberResponse(
        id=tm.id,
        email=tm.email,
        name=tm.name,
        role=tm.role,
        status=tm.status,
        last_active_at=tm.last_active_at.isoformat() if tm.last_active_at else None,
        created_at=tm.created_at.isoformat(),
    )


@router.patch("/{member_id}", response_model=TeamMemberResponse)
def update_member_role(member_id: str, data: TeamMemberUpdate, db: Session = Depends(get_db)):
    """Update role or account status of a team member."""
    tm = db.query(TeamMember).filter(TeamMember.id == member_id).first()
    if not tm:
        raise ResourceNotFoundException("TeamMember", member_id)

    if data.role is not None:
        tm.role = data.role
    if data.status is not None:
        tm.status = data.status

    db.commit()
    db.refresh(tm)
    return TeamMemberResponse(
        id=tm.id,
        email=tm.email,
        name=tm.name,
        role=tm.role,
        status=tm.status,
        last_active_at=tm.last_active_at.isoformat() if tm.last_active_at else None,
        created_at=tm.created_at.isoformat(),
    )


@router.delete("/{member_id}")
def remove_member(member_id: str, db: Session = Depends(get_db)):
    """Remove a member from the workspace."""
    tm = db.query(TeamMember).filter(TeamMember.id == member_id).first()
    if not tm:
        raise ResourceNotFoundException("TeamMember", member_id)
    db.delete(tm)
    db.commit()
    return {"message": "Team member removed successfully."}

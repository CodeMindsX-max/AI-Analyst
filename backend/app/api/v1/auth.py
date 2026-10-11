from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    SimpleMessageResponse,
)
from app.services.auth_service import auth_service
from app.core.security import decode_access_token
from app.core.exceptions import UnauthorizedException
from app.services.audit_service import audit_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with email and password."""
    try:
        resp = auth_service.authenticate_user(db, data)
        audit_service.log_event(
            db,
            action="user.login",
            resource_type="session",
            actor_email=data.email,
            outcome="success",
        )
        return resp
    except Exception as e:
        audit_service.log_event(
            db,
            action="user.login_attempt",
            resource_type="session",
            actor_email=data.email,
            outcome="failure",
            detail={"error": str(e)},
        )
        raise e


@router.post("/logout", response_model=SimpleMessageResponse)
def logout():
    """Logout current session (demo acknowledgement)."""
    return SimpleMessageResponse(message="Successfully logged out.")


@router.get("/me", response_model=UserResponse)
def get_me(authorization: str = Header(None), db: Session = Depends(get_db)):
    """Retrieve profile of authenticated user."""
    if not authorization or not authorization.startswith("Bearer "):
        # In demo mode, if unauthenticated, fallback to seeded demo admin for ease of exploration
        from app.models.user import User
        demo_user = db.query(User).filter(User.email == "demo@analystai.local").first()
        if demo_user:
            return UserResponse(
                id=demo_user.id,
                email=demo_user.email,
                full_name=demo_user.full_name,
                role=demo_user.role,
                is_active=demo_user.is_active,
                avatar_url=demo_user.avatar_url,
            )
        raise UnauthorizedException("No token provided.")

    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise UnauthorizedException("Token is invalid or expired.")

    user = auth_service.get_current_user_from_token(db, payload)
    if not user:
        raise UnauthorizedException("User not found.")

    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        avatar_url=user.avatar_url,
    )


@router.post("/forgot-password", response_model=SimpleMessageResponse)
def forgot_password(data: ForgotPasswordRequest):
    """Demo password reset request acknowledgement."""
    return SimpleMessageResponse(
        message=f"If an account exists for {data.email}, password reset instructions have been sent (Simulated demo mode)."
    )


@router.post("/reset-password", response_model=SimpleMessageResponse)
def reset_password(data: ResetPasswordRequest):
    """Demo password reset confirmation."""
    return SimpleMessageResponse(message="Password has been reset successfully (Simulated demo mode).")

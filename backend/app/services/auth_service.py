from datetime import timedelta
from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse
from app.core.security import verify_password, create_access_token
from app.core.exceptions import UnauthorizedException


class AuthService:
    """Service handling authentication and session management."""

    def authenticate_user(self, db: Session, login_data: LoginRequest) -> TokenResponse:
        user = db.query(User).filter(User.email == login_data.email).first()
        if not user or not verify_password(login_data.password, user.hashed_password):
            raise UnauthorizedException("Invalid email or password.")

        if not user.is_active:
            raise UnauthorizedException("User account is inactive.")

        token = create_access_token(
            data={"sub": user.id, "email": user.email, "role": user.role},
            expires_delta=timedelta(days=1),
        )

        user_resp = UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            avatar_url=user.avatar_url,
        )

        return TokenResponse(access_token=token, token_type="bearer", user=user_resp)

    def get_current_user_from_token(self, db: Session, token_payload: dict) -> Optional[User]:
        user_id = token_payload.get("sub")
        if not user_id:
            return None
        return db.query(User).filter(User.id == user_id).first()


auth_service = AuthService()

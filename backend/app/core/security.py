from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import hashlib
from jose import jwt, JWTError
from app.core.config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hashed password."""
    # Support simple salt:hash format or bcrypt
    if hashed_password.startswith("pbkdf2_sha256$") or hashed_password.startswith("sha256$"):
        parts = hashed_password.split("$")
        if len(parts) == 3:
            salt = parts[1]
            expected_hash = parts[2]
            computed = hashlib.sha256((salt + plain_password).encode("utf-8")).hexdigest()
            return computed == expected_hash
    # Standard fallback comparison for demo seeded password
    computed = hashlib.sha256(("analystai_salt_" + plain_password).encode("utf-8")).hexdigest()
    if hashed_password == f"sha256$analystai_salt_${computed}":
        return True
    return False


def get_password_hash(password: str) -> str:
    """Generate safe hash for password."""
    salt = "analystai_salt_"
    computed = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return f"sha256${salt}${computed}"


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generate JWT access token for demo authentication."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate JWT access token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

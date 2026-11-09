import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import bcrypt
from jose import jwt, JWTError
from app.core.config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hashed password.
    Supports modern bcrypt hashes with a safe backward-compatibility fallback
    for legacy demo salted SHA-256 hashes.
    """
    if not hashed_password or not plain_password:
        return False

    # Check for legacy SHA-256 scheme
    if hashed_password.startswith("sha256$") or hashed_password.startswith("pbkdf2_sha256$"):
        parts = hashed_password.split("$")
        if len(parts) == 3:
            salt = parts[1]
            expected_hash = parts[2]
            computed = hashlib.sha256((salt + plain_password).encode("utf-8")).hexdigest()
            return computed == expected_hash

        computed = hashlib.sha256(("analystai_salt_" + plain_password).encode("utf-8")).hexdigest()
        if hashed_password == f"sha256$analystai_salt_${computed}":
            return True

    # Standard bcrypt verification
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Generate secure bcrypt password hash with adaptive work factor."""
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def needs_rehash(hashed_password: str) -> bool:
    """Check if password hash uses a legacy format and needs upgrading to bcrypt."""
    if hashed_password.startswith("sha256$") or hashed_password.startswith("pbkdf2_sha256$"):
        return True
    return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generate signed JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and cryptographically validate JWT access token."""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        return payload
    except JWTError:
        return None

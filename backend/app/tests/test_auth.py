import hashlib
from datetime import timedelta
from app.core.security import (
    get_password_hash,
    verify_password,
    needs_rehash,
    create_access_token,
    decode_access_token,
)


def test_demo_login_success(client):
    """Test login with demo credentials succeeds."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "demo@analystai.local", "password": "AnalystAI123!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "demo@analystai.local"
    assert data["user"]["role"] == "Admin"


def test_invalid_login_fails(client):
    """Test login with wrong credentials fails with 401."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "demo@analystai.local", "password": "WrongPassword!"},
    )
    assert response.status_code == 401
    data = response.json()
    assert data["code"] == "UNAUTHORIZED"


def test_bcrypt_hashing_and_verification():
    """Verify modern bcrypt password hashing and verification."""
    password = "SecureTestPassword2026!"
    hashed = get_password_hash(password)
    assert hashed != password
    assert hashed.startswith("$2b$") or hashed.startswith("$2a$")
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False
    assert needs_rehash(hashed) is False


def test_legacy_sha256_hash_compatibility():
    """Verify legacy SHA-256 password hash verifies and flags needs_rehash."""
    password = "LegacyPassword123"
    salt = "analystai_salt_"
    digest = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    legacy_hash = f"sha256${salt}${digest}"

    assert verify_password(password, legacy_hash) is True
    assert verify_password("WrongLegacyPass", legacy_hash) is False
    assert needs_rehash(legacy_hash) is True


def test_jwt_token_lifecycle():
    """Verify JWT access token issuance and signature decoding."""
    payload = {"sub": "user-test-1", "email": "test@analystai.local", "role": "Analyst"}
    token = create_access_token(payload, expires_delta=timedelta(minutes=15))
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "user-test-1"
    assert decoded["email"] == "test@analystai.local"

    # Invalid token verification
    assert decode_access_token("invalid.jwt.token") is None

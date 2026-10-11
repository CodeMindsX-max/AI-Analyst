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

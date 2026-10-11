def test_health_endpoint(client):
    """Test health endpoint returns 200 OK and healthy status."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["demo_mode"] is True
    assert data["llm_provider"] == "mock"

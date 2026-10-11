import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.seed import seed_all


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Ensure database tables and demo seed data exist before running tests."""
    seed_all()


@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    with TestClient(app) as test_client:
        yield test_client

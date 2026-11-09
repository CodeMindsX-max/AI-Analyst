import pytest
from pydantic import ValidationError
from app.core.config import Settings


def test_settings_load_development_defaults():
    """Verify Settings loads development configuration safely."""
    settings = Settings(
        APP_ENV="development",
        DATABASE_URL="sqlite:///./data/test_analystai.db",
        SECRET_KEY="test-dev-secret-key-that-is-safe",
    )
    assert settings.APP_NAME == "AnalystAI"
    assert settings.APP_ENV == "development"
    assert settings.ALGORITHM == "HS256"


def test_settings_production_rejects_insecure_secret():
    """Verify production environment strictly rejects insecure demo secret key."""
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            APP_ENV="production",
            DATABASE_URL="postgresql+psycopg://user:pass@localhost:5432/prod_db",
            SECRET_KEY="analystai-insecure-demo-secret-key-change-in-production",
        )
    assert "Production requires a secure" in str(exc_info.value)


def test_settings_production_rejects_sqlite():
    """Verify production environment strictly rejects SQLite database URL."""
    with pytest.raises(ValidationError) as exc_info:
        Settings(
            APP_ENV="production",
            DATABASE_URL="sqlite:///./data/analystai.db",
            SECRET_KEY="production-secure-random-key-minimum-length-verified",
        )
    assert "Production environment requires a production database" in str(exc_info.value)


def test_settings_repr_redacts_secrets():
    """Verify string representation of Settings redacts SECRET_KEY and DB password."""
    settings = Settings(
        APP_ENV="development",
        DATABASE_URL="postgresql+psycopg://analyst_user:SuperSecretPassword123@db.example.com:5432/db",
        SECRET_KEY="UltraSecretKeyForJwtSigning",
    )
    repr_str = repr(settings)
    assert "SuperSecretPassword123" not in repr_str
    assert "UltraSecretKeyForJwtSigning" not in repr_str
    assert "AnalystAI" in repr_str

import os
from pathlib import Path
from typing import List, Union
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base directory for the backend (root of the backend package)
BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """AnalystAI System Settings with safe development defaults and strict production validation."""

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    APP_NAME: str = "AnalystAI"
    APP_ENV: str = "development"
    DEBUG: bool = False
    DEMO_MODE: bool = True

    # Base directory reference
    BASE_DIR: Path = BASE_DIR

    # Application metadata database (e.g. Supabase PostgreSQL in prod, SQLite fallback in dev)
    DATABASE_URL: str = "sqlite:///./data/analystai.db"

    # Analytical / customer demo database (defaults to local SQLite warehouse)
    ANALYTICS_DATABASE_URL: str = "sqlite:///./data/analystai_analytics.db"

    # CORS origins
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://127.0.0.1:5173"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # File uploads
    UPLOAD_DIR: str = "./data/uploads"
    MAX_UPLOAD_MB: int = 20

    # Query execution controls
    MAX_QUERY_ROWS: int = 500
    QUERY_TIMEOUT_SECONDS: int = 5

    # Providers
    LLM_PROVIDER: str = "mock"
    EMBEDDING_PROVIDER: str = "mock"
    VECTOR_STORE_PROVIDER: str = "mock"
    LOG_LEVEL: str = "INFO"

    # Security
    SECRET_KEY: str = "analystai-insecure-demo-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    @model_validator(mode="after")
    def validate_production_configuration(self) -> "Settings":
        """Validate that production environment does not use insecure defaults."""
        if self.APP_ENV.lower() == "production":
            if (
                self.SECRET_KEY == "analystai-insecure-demo-secret-key-change-in-production"
                or len(self.SECRET_KEY) < 32
            ):
                raise ValueError(
                    "Production requires a secure, high-entropy SECRET_KEY with at least 32 characters."
                )
            if self.DATABASE_URL.startswith("sqlite"):
                raise ValueError(
                    "Production environment requires a production database (e.g. PostgreSQL), not SQLite."
                )
        return self

    def get_upload_path(self) -> Path:
        """Resolve and ensure the upload directory exists."""
        p = Path(self.UPLOAD_DIR)
        if not p.is_absolute():
            p = self.BASE_DIR / p
        p.mkdir(parents=True, exist_ok=True)
        return p

    def get_data_dir(self) -> Path:
        """Resolve and ensure the data directory exists."""
        p = self.BASE_DIR / "data"
        p.mkdir(parents=True, exist_ok=True)
        return p

    def __repr__(self) -> str:
        """Safe string representation that never exposes database URLs or secret keys."""
        return (
            f"<Settings app_name={self.APP_NAME!r} app_env={self.APP_ENV!r} "
            f"demo_mode={self.DEMO_MODE} llm_provider={self.LLM_PROVIDER!r} "
            f"embedding_provider={self.EMBEDDING_PROVIDER!r}>"
        )


settings = Settings()

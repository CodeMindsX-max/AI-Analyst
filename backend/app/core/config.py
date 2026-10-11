import os
from pathlib import Path
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """AnalystAI System Settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_ENV: str = "development"
    APP_NAME: str = "AnalystAI"
    DEMO_MODE: bool = True

    # Database URLs
    # Base dir resolves to the backend directory
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATABASE_URL: str = "sqlite:///./data/analystai.db"
    ANALYTICS_DATABASE_URL: str = "sqlite:///./data/analystai_analytics.db"

    # CORS origins
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://127.0.0.1:5173"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # Uploads
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

    def get_upload_path(self) -> Path:
        p = Path(self.UPLOAD_DIR)
        if not p.is_absolute():
            p = self.BASE_DIR / p
        p.mkdir(parents=True, exist_ok=True)
        return p

    def get_data_dir(self) -> Path:
        p = self.BASE_DIR / "data"
        p.mkdir(parents=True, exist_ok=True)
        return p


settings = Settings()

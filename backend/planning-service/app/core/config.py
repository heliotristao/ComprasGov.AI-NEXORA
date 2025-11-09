"""Application configuration and runtime settings."""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration loaded from environment variables or .env files."""

    database_url: str = Field(
        "sqlite:///./test.db",
        alias="DATABASE_URL",
        description="SQLAlchemy connection string for the primary database.",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


@lru_cache()
def get_settings() -> Settings:
    """Return a cached Settings instance to avoid re-reading the environment."""

    return Settings()


settings = get_settings()

# Legacy constants kept for backwards compatibility with existing imports.
# In a production setup these should also be sourced from environment secrets.
SECRET_KEY = "a_very_secret_key"  # This should be securely managed
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
API_V1_STR = "/api/v1"

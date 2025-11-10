"""Application configuration powered by Pydantic settings."""

from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralized configuration for the planning service."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False)

    env: str = Field("development", alias="ENV")
    api_v1_str: str = Field("/api/v1", alias="API_V1_STR")
    secret_key: str = Field("a_very_secret_key", alias="SECRET_KEY")
    algorithm: str = Field("HS256", alias="ALGORITHM")
    access_token_expire_minutes: int = Field(30, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    database_url: str = Field("sqlite:///./test.db", alias="DATABASE_URL")
    encryption_key: str = Field(
        "change-me-32-bytes-key", alias="ENCRYPTION_KEY", min_length=8,
        description="Key used for pgcrypto symmetric encryption"
    )


@lru_cache
def get_settings() -> Settings:
    """Return a cached settings instance."""

    return Settings()


settings = get_settings()

# Backwards compatibility exports -------------------------------------------------
SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes
API_V1_STR = settings.api_v1_str

"""Database session and engine configuration for the planning service."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings


def _normalize_database_url(url: str) -> str:
    """Ensure SQLAlchemy accepts postgres URLs by converting legacy prefixes."""

    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


DATABASE_URL = _normalize_database_url(settings.database_url)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

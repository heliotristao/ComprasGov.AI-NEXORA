import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError

from app.main import app
from app.api.deps import get_db
from app.db.base import Base  # Import Base with all models loaded

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Workaround for fragile test environment: create tables once and ignore
# "index already exists" errors that can occur on subsequent runs.
try:
    Base.metadata.create_all(bind=engine)
except OperationalError as e:
    if "already exists" not in str(e):
        raise


@pytest.fixture(scope="function")
def db() -> sessionmaker:
    """
    Pytest fixture to provide a clean, isolated database session for each test.
    """
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db_session = TestingSessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()


@pytest.fixture(scope="function")
def client(db: sessionmaker) -> TestClient:
    """
    Pytest fixture to provide a TestClient with overridden dependencies for
    the database session.
    """
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as c:
        yield c

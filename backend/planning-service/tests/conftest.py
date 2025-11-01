import sys
import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base import Base
from app.api.deps import get_db
from app.main import app
from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError
from app.api.v1.dependencies import get_current_user

# Add the project root to the Python path to allow absolute imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Mock the get_current_user dependency
def get_current_user_override():
    return {"sub": "test@example.com", "scopes": ["etp:read", "etp:write", "etp:delete"]}

app.dependency_overrides[get_current_user] = get_current_user_override

@pytest.fixture(scope="function")
def db():
    """
    Pytest fixture to create a new database session for each test function,
    handling potential pre-existing indexes.
    """
    try:
        Base.metadata.create_all(bind=engine)
    except OperationalError as e:
        if "index" in str(e) and "already exists" in str(e):
            # This is expected if the tests are run multiple times without cleaning up
            pass
        else:
            raise

    connection = engine.connect()
    transaction = connection.begin()
    db_session = TestingSessionLocal(bind=connection)

    yield db_session

    db_session.close()
    transaction.rollback()
    connection.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """
    Pytest fixture to create a new TestClient for each test function,
    which uses the same database session as the test function.
    """

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    del app.dependency_overrides[get_db]

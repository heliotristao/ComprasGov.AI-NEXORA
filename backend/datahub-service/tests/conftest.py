import pytest
from unittest.mock import patch, MagicMock

# --- Pre-emptive Mocking for Import-Time Side Effects ---
# Several services are instantiated as singletons at the module level,
# which causes them to try and connect to external services (Milvus, MinIO)
# during the test collection phase. To prevent this, we patch the underlying
# clients *before* any application modules are imported.

mock_collection_instance = MagicMock()
patcher_milvus_check = patch("app.db.milvus.check_and_create_collection", return_value=None)
patcher_milvus_collection = patch("pymilvus.orm.collection.Collection", return_value=mock_collection_instance)

mock_s3_client = MagicMock()
patcher_boto3 = patch("boto3.client", return_value=mock_s3_client)

patcher_milvus_check.start()
patcher_milvus_collection.start()
patcher_boto3.start()


# It's now safe to import the application modules
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.main import app
from app.api.deps import get_db
from app.db.base import Base

# Teardown hook to stop the patchers after tests are done
def pytest_unconfigure(config):
    patcher_milvus_check.stop()
    patcher_milvus_collection.stop()
    patcher_boto3.stop()

# --- Fixtures ---

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine
)

@pytest.fixture(scope="function")
def db() -> Session:
    """
    Fixture to set up the database with a transactional scope.
    """
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    connection = engine.connect()
    transaction = connection.begin()
    db_session = TestingSessionLocal(bind=connection)

    yield db_session

    db_session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db: Session):
    """
    Fixture to get a test client with the database dependency overridden.
    """
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import sys

# Add the service root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Set a valid DATABASE_URL for the test environment BEFORE importing the app
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from app.main import app
from app.api.deps import get_db
from app.db.base_class import Base
from app.db.models.user import User
from app.db.models.role import Role
from app.core.security import get_password_hash

# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the get_db dependency to use the test database
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def create_test_database():
    # Create tables once before any tests run
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="module")
def client():
    # Seed data once per module
    seed_test_database()
    yield TestClient(app)
    # The database is dropped at the end of the session

def seed_test_database():
    db = TestingSessionLocal()
    try:
        # Seed Roles
        master_role = Role(name="Master", description="Super user")
        db.add(master_role)
        db.commit()
        db.refresh(master_role)

        # Seed Master User
        master_user = User(
            email="master@nexora.ai",
            hashed_password=get_password_hash("string"),
        )
        master_user.roles.append(master_role)
        db.add(master_user)
        db.commit()
    finally:
        db.close()

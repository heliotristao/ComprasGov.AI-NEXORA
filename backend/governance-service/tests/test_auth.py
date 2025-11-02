from fastapi.testclient import TestClient
import jwt
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.api.deps import get_db

# Use the file-based test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_login_for_access_token():
    response = client.post(
        "/api/v1/token",
        data={"username": "master@nexora.ai", "password": "string"},
    )
    assert response.status_code == 200, response.text
    token_data = response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

    # Decode the token to verify its contents
    token = token_data["access_token"]
    payload = jwt.decode(token, options={"verify_signature": False})
    assert payload["sub"] == "master@nexora.ai"
    assert "Master" in payload["roles"]

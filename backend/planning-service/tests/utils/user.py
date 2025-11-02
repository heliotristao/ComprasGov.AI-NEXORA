from datetime import datetime, timedelta
from jose import jwt
from app.core import config
from sqlalchemy.orm import Session
from app import crud
from app.schemas.user import UserCreate
import random
import string


def random_lower_string() -> str:
    return "".join(random.choices(string.ascii_lowercase, k=32))


def random_email() -> str:
    return f"{random_lower_string()}@{random_lower_string()}.com"


def create_random_user(db: Session):
    email = random_email()
    password = random_lower_string()
    user_in = UserCreate(email=email, password=password)
    user = crud.user.create(db=db, obj_in=user_in)
    return user

def create_test_token(
    user_email: str = "test@example.com",
    scopes: list[str] = ["etp:read", "etp:write", "etp:delete"],
) -> str:
    """
    Generates a JWT token for testing purposes.
    """
    expires_delta = timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.utcnow() + expires_delta
    to_encode = {"sub": user_email, "exp": expire, "scopes": scopes}
    encoded_jwt = jwt.encode(to_encode, config.SECRET_KEY, algorithm=config.ALGORITHM)
    return encoded_jwt

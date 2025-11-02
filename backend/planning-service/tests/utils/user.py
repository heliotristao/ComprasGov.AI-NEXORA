from datetime import datetime, timedelta
from jose import jwt
from app.core import config


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

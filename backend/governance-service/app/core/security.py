from datetime import datetime, timedelta, timezone
from pathlib import Path
from jose import jwt
from passlib.context import CryptContext
from .config import ACCESS_TOKEN_EXPIRE_MINUTES
from typing import Set

# --- Key Loading ---
CERTS_DIR = Path(__file__).parent.parent / "certs"
PRIVATE_KEY_PATH = CERTS_DIR / "private_key.pem"
KEY_ID = "nexora-2025-10-30"

try:
    with open(PRIVATE_KEY_PATH, "r") as f:
        PRIVATE_KEY = f.read()
except FileNotFoundError:
    raise RuntimeError(
        "Private key not found. Please generate keys in the 'app/certs' directory."
    )

# --- Algorithm Configuration ---
ALGORITHM = "RS256"

# --- Password Hashing ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# --- Token Creation ---
def create_access_token(
    data: dict,
    roles: Set[str],
    scopes: Set[str],
    expires_delta: timedelta | None = None
):
    """
    Creates a new JWT access token using RS256.
    """
    to_encode = data.copy()

    # Set expiration time
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "roles": list(roles),
        "scope": " ".join(scopes)
    })

    # Define headers, including the key ID
    headers = {"kid": KEY_ID}

    encoded_jwt = jwt.encode(
        to_encode,
        PRIVATE_KEY,
        algorithm=ALGORITHM,
        headers=headers
    )
    return encoded_jwt

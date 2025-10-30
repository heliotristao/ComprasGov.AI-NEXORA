# backend/governance-service/app/api/v1/endpoints/jwks.py
import jwt
from fastapi import APIRouter
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend
from pathlib import Path

router = APIRouter()

# In a real app, this might be configured via environment variables
CERTS_DIR = Path(__file__).parent.parent.parent.parent / "certs"
PUBLIC_KEY_PATH = CERTS_DIR / "public_key.pem"
KEY_ID = "nexora-2025-10-30" # A unique ID for this key

@router.get("/.well-known/jwks.json", include_in_schema=False)
def get_jwks():
    """
    Exposes the public key in the JWKS format.
    """
    try:
        with open(PUBLIC_KEY_PATH, "rb") as f:
            public_key_pem = f.read()

        public_key = serialization.load_pem_public_key(
            public_key_pem,
            backend=default_backend()
        )

        jwk = jwt.algorithms.RSAAlgorithm.to_jwk(public_key, as_dict=True)
        # Add required JWK parameters
        jwk["kid"] = KEY_ID
        jwk["use"] = "sig" # For signature verification
        jwk["alg"] = "RS256"

        return {"keys": [jwk]}

    except FileNotFoundError:
        return {"keys": []} # Or raise an error
    except Exception as e:
        # Proper logging should be added here
        return {"error": str(e)}, 500

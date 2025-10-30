# nexora_auth/jwt.py

import jwt
import requests
import time
from functools import lru_cache
from typing import Dict, Any

class JWTValidator:
    def __init__(self, jwks_url: str, algorithm: str = "RS256", audience: str = None, issuer: str = None):
        self.jwks_url = jwks_url
        self.algorithm = algorithm
        self.audience = audience
        self.issuer = issuer
        self._jwks_cache = None
        self._cache_expiry = 0

    def _get_jwks(self):
        """
        Fetches the JWKS from the specified URL with caching.
        Cache expires after 10 minutes.
        """
        if not self._jwks_cache or time.time() > self._cache_expiry:
            try:
                response = requests.get(self.jwks_url)
                response.raise_for_status()
                self._jwks_cache = response.json()
                self._cache_expiry = time.time() + 600  # Cache for 10 minutes
            except requests.exceptions.RequestException as e:
                # In a real app, you'd have more robust logging and error handling
                raise RuntimeError(f"Could not fetch JWKS: {e}")
        return self._jwks_cache

    @lru_cache(maxsize=32)
    def _get_signing_key(self, token: str):
        """
        Finds the appropriate public key from the JWKS to validate the token.
        The result is cached.
        """
        try:
            unverified_header = jwt.get_unverified_header(token)
        except jwt.exceptions.DecodeError as e:
            raise ValueError(f"Invalid token header: {e}")

        kid = unverified_header.get("kid")
        if not kid:
            raise ValueError("Token is missing 'kid' in the header")

        jwks = self._get_jwks()
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                return jwt.algorithms.RSAAlgorithm.from_jwk(key)

        raise ValueError(f"Public key with kid '{kid}' not found in JWKS")

    def decode(self, token: str) -> Dict[str, Any]:
        """
        Decodes and validates a JWT.

        Args:
            token: The JWT string to decode.

        Returns:
            The decoded token payload as a dictionary.

        Raises:
            ValueError: If the token is invalid or the public key cannot be found.
            jwt.exceptions.PyJWTError: For any other JWT validation errors (e.g., expired signature).
        """
        signing_key = self._get_signing_key(token)

        return jwt.decode(
            token,
            key=signing_key,
            algorithms=[self.algorithm],
            audience=self.audience,
            issuer=self.issuer,
        )

# Example of how this might be used (will not be included in the final library)
if __name__ == '__main__':
    # This is a placeholder for testing.
    # In a real scenario, you would point to a running governance-service.
    mock_jwks_url = "http://localhost:8001/.well-known/jwks.json"

    # You would need a valid JWT issued by the governance-service
    # validator = JWTValidator(jwks_url=mock_jwks_url)
    # decoded_payload = validator.decode("your_jwt_here")
    # print(decoded_payload)
    pass

# In a real application, these values would be loaded from a secure source
SECRET_KEY = "a_very_secret_key"  # This should be securely managed
ALGORITHM = "RS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Settings for JWT validation
JWKS_URL = "http://localhost:8001/.well-known/jwks.json"
AUDIENCE = "nexora-platform"
ISSUER = "nexora-governance-service"

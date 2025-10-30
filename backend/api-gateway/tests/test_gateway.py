import pytest
from fastapi.testclient import TestClient
from jose import jwt
import time
from app.main import app, jwt_validator
import os
import base64
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

# --- Test Fixtures ---

@pytest.fixture(scope="module")
def client():
    return TestClient(app)

@pytest.fixture(scope="module")
def private_key():
    return """-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDOgxf7WSiFmrjM
NwqHv52hw4cLoiPEaRDv7dt3p5hPiez5EWNdx4pbs0LAASqgYHNbPuHY396lVJsj
GJtJcVLMdXeesPh9uYOCUrB1OSdXjWi20REQYplcZHiIvcIFixjxa6UmAdapVmEP
DljR/om5H2UmGoLkVUzatRW1BGbxKHbHTGIhh84levduozXfi3mU2olrTW7CENHD
JgqYArkGa9RXgO5j66rJiLolr4BgSU7nXpfe7ny5Jopu6vBaWeQ5tMeblzcJOPVu
VyF4U/Dw1qkngvgf555a3i7RTzVD+q57aDbLpToT4GlPftD28mwUA2J97vb/U1PJ
X8nD4kTXAgMBAAECggEAA01lXMeYNkq7GcjnijQuOR//UNhO6h0kADI1iDxN2zfB
alo01JMUS1Mahid+nwHr1lGzGty5mrs3n+AM26fMQyi9uPPrhVcqGzNnTviTAHtq
aUH+m9x3x1pz8vvV1nDa/UFTasAsxphzBOKd2P3RBfzSiUFzRmN2zyiGKFbhromH
vTh4TKz7ya8KOdLKga+emUGI9DnKspjxnXWWsA/f9GgR5iKWtAhkMeccE9ZplFho
sBXUsm0Jiev6MeOEE/C5FwbDtVsCosGMgjn3uRy/3GKh9pwWmxXP28eVzK8sk4J2
2MYUMYZQK6GrnK4rM61P4u4Ygn8spmLGLcqu9h+sQQKBgQD3PC/mdWAndmSr9Irx
9uUcP9mATDSilr0UUdXCxhkhad9o9Rzw9PIXy84FtvIfpkVHghnqLV0Z3zI1pAqS
/5jxBA1S56qs1FZAMauR5N8yS8B5Z75r4GiMScVJwku6CJrDBPm/KqyvyAg8ujhm
ZY5LT/DinZGhU1AH3BQvi6FVzQKBgQDV1VHaK9dqbehkq62uS8tswHPLIlWkA1qH
HXpCiAEJ3QfyqZmGkGrcsLVV6T78Y4uX4rLmTXrr5klPc38mxQ/X6XnXXExMN8WT
F+medQzvOP8juG1KAdZKWYnaPqdTfg1EkJZKx3FJVSpvbcGPPzByyHk7VbGS2Rmh
xgAuiqnhMwKBgDmqainAutq5fKW29imVwr6iDeMk4yoBKrzwkYFKn1Xx0dAzS7rQ
Bx+Rw84Fa9gB+irBp7W9Ovfr3VQxnN3IjC27Gjh6HI8PP8bdTv1KetzKWmx2zC1x
PDFsi322ud78XsyZ/n6eP4UIjRNNBBauHVBnpvHUesE8I3CR3otwcAMJAoGBANBu
8SxjE8WQgLiwh8mf5BiLt9NIEoafJj0SRLxZafm9VCP7ocUDPMcGEJw/kb/fIJDa
z1uiJrGPdeJWSJj3+auSz8tXEqAwtQvegUCOBB+jRUACY7WB+OncQX1VGTFPa4ts
DLOzmP/MXmLjb4s8IvOf6lwl+cOUj2GbaU30qAb1AoGBAPMz1MqFYu0FnYxQeqr1
2/u+EhSOucwjM2foOjwdC5T9meKoCZTFW98vDd6KTPLIUYxxUxnUDut/VIdk1yDC
cb8HClLZ5jHr/Ups0wv2v1dxaDGzsCeT1KZrQejAe6hZbP8sZPtl7fu28hgCIzLJ
KJwfHYuL+7igWnrc7P/xU7u4
-----END PRIVATE KEY-----"""

@pytest.fixture(scope="module")
def public_key():
    return """-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzoMX+1kohZq4zDcKh7+d
ocOHC6IjxGkQ7+3bd6eYT4ns+RFjXceKW7NCwAEqoGBzWz7h2N/epVSbIxibSXFS
zHV3nrD4fbmDglKwdTknV41ottEREGKZXGR4iL3CBYsY8WulJgHWqVZhDw5Y0f6J
uR9lJhqC5FVM2rUVtQRm8Sh2x0xiIYfOJXr3bqM134t5lNqJa01uwhDRwyYKmAK5
BmvUV4DuY+uqyYi6Ja+AYElO516X3u58uSaKburwWlnkObTHm5c3CTj1blcheFPw
8NapJ4L4H+eeWt4u0U81Q/que2g2y6U6E+BpT37Q9vJsFANife72/1NTyV/Jw+JE
1wIDAQAB
-----END PUBLIC KEY-----"""

@pytest.fixture(scope="module")
def generate_test_token(private_key):
    """Generates a valid JWT for testing purposes."""
    payload = {
        "sub": "testuser@nexora.ai",
        "org_id": "123",
        "roles": ["Admin", "Planejador"],
        "scope": "admin:read user:write",
        "exp": int(time.time()) + 3600,
        "iss": "nexora-governance-service",
        "aud": "nexora-platform",
    }
    headers = {"kid": "test-key"}
    token = jwt.encode(payload, private_key, algorithm="RS256", headers=headers)
    return token

def to_base64url_uint(val: int) -> str:
    return base64.urlsafe_b64encode(val.to_bytes((val.bit_length() + 7) // 8, 'big')).rstrip(b'=').decode('ascii')

# --- Test Cases ---

def test_forward_auth_with_valid_token(client, generate_test_token, mocker, public_key):
    # Load the public key and extract the numbers
    pub_key = serialization.load_pem_public_key(public_key.encode())
    public_numbers = pub_key.public_numbers()

    # Mock the JWKS fetch
    mock_jwks = {
        "keys": [
            {
                "kty": "RSA",
                "kid": "test-key",
                "use": "sig",
                "n": to_base64url_uint(public_numbers.n),
                "e": to_base64url_uint(public_numbers.e),
            }
        ]
    }
    mocker.patch.object(jwt_validator, "_get_jwks", return_value=mock_jwks)

    headers = {"Authorization": f"Bearer {generate_test_token}"}
    response = client.get("/auth", headers=headers)
    assert response.status_code == 200
    assert response.headers["X-User-Id"] == "testuser@nexora.ai"
    assert response.headers["X-Org-Id"] == "123"
    assert "Admin" in response.headers["X-User-Roles"]
    assert "Planejador" in response.headers["X-User-Roles"]
    assert response.headers["X-User-Scopes"] == "admin:read user:write"

def test_forward_auth_with_invalid_token(client):
    headers = {"Authorization": "Bearer invalidtoken"}
    response = client.get("/auth", headers=headers)
    assert response.status_code == 401

def test_forward_auth_with_no_token(client):
    response = client.get("/auth")
    assert response.status_code == 401

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

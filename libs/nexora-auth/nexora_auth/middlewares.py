# nexora_auth/middlewares.py

import time
import uuid
from fastapi import Request, status
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import JSONResponse, Response
from typing import Optional

from .jwt import JWTValidator, ValueError

class TraceMiddleware(BaseHTTPMiddleware):
    """
    Injects a `X-Request-ID` header into each request and response
    for end-to-end traceability.
    """
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request_id = str(uuid.uuid4())

        # Add request ID to request headers for downstream use
        request.state.request_id = request_id

        response = await call_next(request)

        # Add request ID to response headers
        response.headers["X-Request-ID"] = request_id
        return response


class AuthContextMiddleware(BaseHTTPMiddleware):
    """
    Validates the JWT from the Authorization header and attaches the
    decoded payload to `request.state.user`.

    This middleware should be placed AFTER TraceMiddleware.
    """
    def __init__(
        self,
        app,
        validator: JWTValidator,
        public_paths: Optional[set[str]] = None,
    ):
        super().__init__(app)
        self.validator = validator
        self.public_paths = public_paths or set()

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        if request.url.path in self.public_paths:
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Authorization header is missing"},
                headers={"WWW-Authenticate": "Bearer"},
            )

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid Authorization header format. Expected 'Bearer <token>'."},
                headers={"WWW-Authenticate": "Bearer"},
            )

        token = parts[1]
        try:
            payload = self.validator.decode(token)
            request.state.user = payload
        except (ValueError, jwt.exceptions.PyJWTError) as e:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": f"Invalid token: {e}"},
                headers={"WWW-Authenticate": "Bearer"},
            )

        return await call_next(request)


class TrustedHeaderMiddleware(BaseHTTPMiddleware):
    """
    Populates `request.state.user` from trusted headers injected by the API Gateway.
    This should ONLY be used on services that are not publicly exposed.
    """
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        user_id = request.headers.get("X-User-Id")
        org_id = request.headers.get("X-Org-Id")
        roles = request.headers.get("X-User-Roles", "").split(",")
        scopes = request.headers.get("X-User-Scopes", "").split(" ")

        user_payload = {
            "sub": user_id,
            "org_id": org_id,
            "roles": [role.strip() for role in roles if role.strip()],
            "scope": " ".join([scope.strip() for scope in scopes if scope.strip()]),
        }
        request.state.user = user_payload

        return await call_next(request)

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response, JSONResponse
from starlette.types import ASGIApp
import time
import uuid
import jwt

from .jwt import JWTValidator

class TraceMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

class AuthContextMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp, validator: JWTValidator, public_paths: set = None):
        super().__init__(app)
        self.validator = validator
        self.public_paths = public_paths or set()

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        if request.url.path in self.public_paths:
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(status_code=401, content={"detail": "Unauthorized"})

        token = auth_header.split(" ")[1]
        try:
            payload = self.validator.decode(token)
            request.state.user = payload
        except (ValueError, jwt.exceptions.PyJWTError) as e:
            return JSONResponse(status_code=401, content={"detail": f"Invalid token: {e}"})

        return await call_next(request)

class TrustedHeaderMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        user_id = request.headers.get("X-User-Id")
        org_id = request.headers.get("X-Org-Id")
        roles = request.headers.get("X-User-Roles", "").split(",")
        scopes = request.headers.get("X-User-Scopes", "").split(" ")

        user_payload = {
            "sub": user_id,
            "org_id": org_id,
            "roles": [role.strip() for role in roles if role.strip()],
            "scopes": [scope.strip() for scope in scopes if scope.strip()],
        }
        request.state.user = user_payload
        return await call_next(request)

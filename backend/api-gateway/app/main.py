from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from fastapi.openapi.utils import get_openapi
from starlette.middleware.base import BaseHTTPMiddleware
import os
import json

# Import the new, standardized components from our library
from nexora_auth.jwt import JWTValidator
from nexora_auth.middlewares import TraceMiddleware, AuthContextMiddleware

# --- OpenAPI Security Scheme Definition ---
security_schemes = {
    "components": {
        "securitySchemes": {
            "BearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
                "description": "Enter JWT Bearer token",
            }
        }
    },
    "security": [{"BearerAuth": []}],
}

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="NEXORA API Gateway",
        version="1.0.0",
        description="The central entry point for NEXORA microservices.",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = security_schemes["components"]["securitySchemes"]
    openapi_schema["security"] = security_schemes["security"]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app = FastAPI(title="NEXORA API Gateway")
app.openapi = custom_openapi

# --- Security Headers Middleware ---

SECURITY_HEADERS = {
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    "Content-Security-Policy": "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:8000 http://127.0.0.1:8000 https://*;",
}


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        for header, value in SECURITY_HEADERS.items():
            response.headers.setdefault(header, value)
        return response

# --- Configuration ---
GOVERNANCE_JWKS_URL = os.getenv("GOVERNANCE_JWKS_URL", "http://governance-service:8000/.well-known/jwks.json")
AUDIENCE = "nexora-platform"
ISSUER = "nexora-governance-service"

# --- Middleware Setup ---

# 1. JWT Validator
jwt_validator = JWTValidator(
    jwks_url=GOVERNANCE_JWKS_URL,
    audience=AUDIENCE,
    issuer=ISSUER,
)

# 2. Add Middlewares to the app
app.add_middleware(TraceMiddleware)
app.add_middleware(
    AuthContextMiddleware,
    validator=jwt_validator,
    public_paths={"/health", "/openapi.json"}
)
app.add_middleware(SecurityHeadersMiddleware)

# --- Endpoints ---

@app.get("/auth", include_in_schema=False)
async def forward_auth(request: Request):
    user_payload = getattr(request.state, "user", None)
    if not user_payload:
        return JSONResponse(status_code=401, content={"detail": "Authentication failed"})

    downstream_headers = {
        "X-Trace-ID": getattr(request.state, "trace_id", ""),
        "X-User-Id": user_payload.get("sub", ""),
        "X-Org-Id": user_payload.get("org_id", ""),
        "X-User-Roles": ",".join(user_payload.get("roles", [])),
        "X-User-Scopes": user_payload.get("scope", "")
    }

    return Response(status_code=200, headers=downstream_headers)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

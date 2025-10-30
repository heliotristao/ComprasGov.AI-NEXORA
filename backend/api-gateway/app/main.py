from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from fastapi.openapi.utils import get_openapi
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

# --- Endpoints ---

@app.get("/auth", include_in_schema=False)
async def forward_auth(request: Request):
    user_payload = getattr(request.state, "user", None)
    if not user_payload:
        return JSONResponse(status_code=401, content={"detail": "Authentication failed"})

    downstream_headers = {
        "X-Request-ID": getattr(request.state, "request_id", ""),
        "X-User-Id": user_payload.get("sub", ""),
        "X-Org-Id": user_payload.get("org_id", ""),
        "X-User-Roles": ",".join(user_payload.get("roles", [])),
        "X-User-Scopes": user_payload.get("scope", "")
    }

    return Response(status_code=200, headers=downstream_headers)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

"""Utility script to export the API Gateway OpenAPI schema without external dependencies."""
from __future__ import annotations

import json
import sys
import types
from pathlib import Path

from fastapi.openapi.utils import get_openapi

CURRENT_DIR = Path(__file__).resolve().parent
APP_ROOT = CURRENT_DIR.parent / "app"
if str(APP_ROOT.parent) not in sys.path:
    sys.path.insert(0, str(APP_ROOT.parent))

nexora_auth = types.ModuleType("nexora_auth")
nexora_auth_jwt = types.ModuleType("nexora_auth.jwt")


class JWTValidator:  # pragma: no cover - runtime helper
    def __init__(self, *args, **kwargs):
        self.args = args
        self.kwargs = kwargs


nexora_auth_jwt.JWTValidator = JWTValidator
nexora_auth_middlewares = types.ModuleType("nexora_auth.middlewares")


class TraceMiddleware:  # pragma: no cover - runtime helper
    def __init__(self, *args, **kwargs):
        self.args = args
        self.kwargs = kwargs


class AuthContextMiddleware:  # pragma: no cover - runtime helper
    def __init__(self, *args, **kwargs):
        self.args = args
        self.kwargs = kwargs


nexora_auth_middlewares.TraceMiddleware = TraceMiddleware
nexora_auth_middlewares.AuthContextMiddleware = AuthContextMiddleware

sys.modules.setdefault("nexora_auth", nexora_auth)
sys.modules.setdefault("nexora_auth.jwt", nexora_auth_jwt)
sys.modules.setdefault("nexora_auth.middlewares", nexora_auth_middlewares)

from app.main import app, security_schemes


schema = get_openapi(
    title="NEXORA API Gateway",
    version="1.0.0",
    description="The central entry point for NEXORA microservices.",
    routes=app.routes,
)

schema.setdefault("components", {})
schema["components"].setdefault("securitySchemes", {})
schema["components"]["securitySchemes"] = security_schemes["components"]["securitySchemes"]
schema["security"] = security_schemes["security"]

json.dump(schema, sys.stdout)

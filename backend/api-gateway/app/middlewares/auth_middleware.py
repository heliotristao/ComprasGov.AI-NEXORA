from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Allow health and metrics endpoints to bypass auth
        if request.url.path in ("/health", "/metrics"):
            return await call_next(request)

        if "Authorization" not in request.headers:
            return JSONResponse(
                status_code=401,
                content={"detail": "Authorization header missing"}
            )

        token = request.headers["Authorization"]
        if not token.startswith("Bearer ") or not token.split(" ")[1]:
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid or empty token"}
            )

        response = await call_next(request)
        return response

from fastapi import FastAPI, Request, Response
from .middlewares.auth_middleware import AuthMiddleware
from .middlewares.rate_limit_middleware import RateLimitMiddleware
from .middlewares.logging_middleware import LoggingMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI()

# Instrument the app with Prometheus metrics
Instrumentator().instrument(app).expose(app)

# Add middlewares. They will run for all incoming requests to the gateway.
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware, limit=100, window=60)
app.add_middleware(AuthMiddleware)

@app.get("/auth")
async def forward_auth(request: Request):
    """
    This endpoint is used by Traefik's forwardAuth middleware.
    If the request passes through the middlewares above, it means it's authenticated.
    We return a 200 OK response to let Traefik know it can proceed.
    The user's ID and roles can be injected into the request headers here
    for downstream services to use.
    """
    # In a real implementation, you would get user info from the token
    # and pass it in the response headers to the downstream service.
    # For example:
    # user_id = request.state.user_id
    # user_roles = request.state.user_roles
    # headers = {"X-User-Id": user_id, "X-User-Roles": user_roles}
    # return Response(status_code=200, headers=headers)

    return Response(status_code=200)

@app.get("/health")
async def health_check():
    """
    A simple health check for the gateway itself.
    Does not need to check downstream services as Traefik will handle that.
    """
    return {"status": "ok"}

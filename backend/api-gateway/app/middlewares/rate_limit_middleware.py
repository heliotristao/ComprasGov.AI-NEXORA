import redis.asyncio as redis
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
import os

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limit: int, window: int):
        super().__init__(app)
        self.limit = limit
        self.window = window
        self.redis = redis.from_url(f"redis://{os.environ.get('REDIS_HOST', 'localhost')}")

    async def dispatch(self, request: Request, call_next):
        ip = request.client.host
        key = f"rate_limit:{ip}"

        pipe = self.redis.pipeline()
        pipe.incr(key)
        pipe.ttl(key)

        try:
            count, ttl = await pipe.execute()
        except Exception:
            # If redis is down, we should not block requests.
            # Log the error and allow the request to pass.
            # In a real-world scenario, you'd have more robust logging here.
            return await call_next(request)

        if ttl == -1: # Key has no expiry
            await self.redis.expire(key, self.window)

        # Allow the request if the count is less than or equal to the limit
        if count > self.limit:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too Many Requests"}
            )

        response = await call_next(request)
        return response

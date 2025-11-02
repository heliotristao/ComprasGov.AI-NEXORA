import redis
import os
import json
from functools import wraps
from typing import Callable, Any

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
cache = redis.from_url(REDIS_URL, decode_responses=True)


def redis_cache(ttl: int = 300):
    """
    Decorator to cache the result of a function in Redis.
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            # Generate a unique key for the function call
            key = f"{func.__name__}"

            # Check if the result is in the cache
            cached_result = cache.get(key)
            if cached_result:
                return json.loads(cached_result)

            # If not, call the function and store the result
            result = func(*args, **kwargs)
            cache.setex(key, ttl, result.model_dump_json())
            return result
        return wrapper
    return decorator

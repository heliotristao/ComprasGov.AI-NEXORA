# nexora_auth/decorators.py

from functools import wraps
from fastapi import Request, HTTPException, status
from typing import Callable, Any, Set, Optional, Dict

def get_current_user() -> Any:
    """
    Placeholder used by application and intended to be monkeypatched in tests.
    Tests must replace this with a fixture that returns a user object.
    """
    raise RuntimeError("get_current_user must be configured in application or monkeypatched in tests")

def require_role(required_roles: Set[str]):
    """
    Decorator to enforce role-based access control on a FastAPI endpoint.
    Expects the JWT payload with a 'roles' claim to be in `request.state.user`.
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any):
            request = kwargs.get("request")
            if not isinstance(request, Request):
                raise TypeError("This decorator must be used on a FastAPI endpoint with a 'request: Request' argument.")

            user = getattr(request.state, "user", None)
            if not user or "roles" not in user:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="User roles not found in token.",
                )

            user_roles = set(user["roles"])
            if not required_roles.intersection(user_roles):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"User lacks required roles. Required: {', '.join(required_roles)}",
                )

            return await func(*args, **kwargs)
        return wrapper
    return decorator


def require_scope(required_scopes: Set[str]):
    """
    Decorator to enforce scope-based access control on a FastAPI endpoint.
    Expects the JWT payload with a 'scope' claim (space-separated) to be in `request.state.user`.
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any):
            request = kwargs.get("request")
            if not isinstance(request, Request):
                raise TypeError("This decorator must be used on a FastAPI endpoint with a 'request: Request' argument.")

            user = getattr(request.state, "user", None)
            if not user or "scope" not in user:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Scopes not found in token.",
                )

            user_scopes = set(user["scope"].split())
            if not required_scopes.issubset(user_scopes):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Token lacks required scopes. Required: {', '.join(required_scopes)}",
                )

            return await func(*args, **kwargs)
        return wrapper
    return decorator

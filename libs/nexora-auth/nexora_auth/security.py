from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from nexora_auth.jwt import JWTValidator

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/token")

def get_current_user_factory(jwt_validator: JWTValidator):
    async def get_current_user(token: str = Depends(oauth2_scheme)):
        try:
            payload = jwt_validator.decode(token)
            return payload
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(e),
                headers={"WWW-Authenticate": "Bearer"},
            )
    return get_current_user

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session, joinedload
from app.models.token import Token
from app.core.security import verify_password, create_access_token
from app.db.models.user import User
from app.api.deps import get_db, get_audit_logger
from nexora_auth.audit import AuditLogger

router = APIRouter()

@router.post("/token", response_model=Token)
async def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
    audit_logger: AuditLogger = Depends(get_audit_logger),
):
    # Eagerly load roles to avoid a separate query
    user = db.query(User).options(joinedload(User.roles)).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        # In a real app, you might want to log failed login attempts.
        # Be careful about logging too much information, like the username.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract role names from the user object
    user_roles = {role.name for role in user.roles}

    # Placeholder for scopes
    user_scopes = set()
    if "Admin" in user_roles:
        user_scopes.update(["admin:read", "admin:write", "user:read", "user:write"])
    if "Planejador" in user_roles:
        user_scopes.update(["user:read", "user:write"])


    # Create the token with the subject, roles, and scopes
    access_token = create_access_token(
        data={"sub": user.email, "org_id": "1"}, # Hardcoded org_id for now
        roles=user_roles,
        scopes=user_scopes,
    )

    # Log the successful login event
    # We populate request.state.user manually here just for the logger
    request.state.user = {"sub": user.email, "org_id": "1"}
    audit_logger.log(action="USER_LOGIN", request=request)

    return {"access_token": access_token, "token_type": "bearer"}

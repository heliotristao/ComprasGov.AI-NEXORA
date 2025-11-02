# nexora-auth Library

This library provides centralized authentication and authorization functionalities for the Nexora microservices ecosystem.

## Features

- **RBAC Decorator (`@require_role`):** Enforces role-based access control on FastAPI endpoints.
- **Audit Decorator (`@audited`):** Logs important actions for security and compliance.

## Usage

### `@require_role`

The `@require_role` decorator allows you to restrict access to an endpoint to users with specific roles.

**Example:**

```python
from nexora_auth.decorators import require_role

@router.post("/confidential")
@require_role(required_roles={"Admin", "Auditor"})
def access_confidential_data(request: Request):
    return {"message": "You have the required role to see this."}
```

### `@audited`

The `@audited` decorator logs an audit trail event every time an endpoint is successfully executed.

**Example:**

```python
from nexora_auth.audit import audited

@router.post("/items")
@audited(action="CREATE_ITEM")
def create_item(item: Item, request: Request, db: Session = Depends(get_db)):
    # Your logic to create an item
    return item
```

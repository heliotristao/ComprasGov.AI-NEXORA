from pydantic import BaseModel
from typing import Optional

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    pass

class RoleUpdate(RoleBase):
    name: Optional[str] = None
    description: Optional[str] = None

class RoleInDBBase(RoleBase):
    id: int

    class Config:
        orm_mode = True

class Role(RoleInDBBase):
    pass

class RoleInDB(RoleInDBBase):
    pass

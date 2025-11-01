from pydantic import BaseModel
from typing import Optional


class ETPComment(BaseModel):
    comments: Optional[str] = None

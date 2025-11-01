from pydantic import BaseModel

class ETPRejection(BaseModel):
    comments: str

class ETPStatusUpdate(BaseModel):
    status: str

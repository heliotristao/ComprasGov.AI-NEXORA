import uuid

from sqlalchemy import (
    Column,
    String,
)
from sqlalchemy.dialects.postgresql import UUID as pgUUID

from app.db.base import Base


class Template(Base):
    __tablename__ = "templates"

    id = Column(pgUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, unique=True)
    path = Column(String, nullable=False)

    def __repr__(self):
        return f"<Template(id={self.id}, name='{self.name}')>"

from sqlalchemy import Column, String, Text
from app.db.base_class import Base


class Plan(Base):
    __tablename__ = "plans"

    id = Column(String, primary_key=True, index=True)
    objective = Column(Text, nullable=False)
    justification = Column(Text, nullable=False)

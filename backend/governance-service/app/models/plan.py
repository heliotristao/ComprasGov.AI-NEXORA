from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.db.base import Base


class PlanStatus(str, enum.Enum):
    """Status possíveis para um plano de contratação"""
    DRAFT = "draft"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    ARCHIVED = "archived"


class Plan(Base):
    """Model para planos de contratação"""
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    identifier = Column(String(100), unique=True, index=True, nullable=False)
    object = Column(Text, nullable=False)
    justification = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="draft")  # draft, pending, approved, rejected, archived
    estimated_value = Column(Numeric(15, 2), nullable=True)
    responsible_department = Column(String(255), nullable=True)
    ai_generated = Column(Boolean, default=False, nullable=False)

    # Relacionamento com usuário
    created_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

import enum

from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class FileType(enum.Enum):
    docx = "docx"
    pdf = "pdf"


class TRVersion(Base):
    __tablename__ = "tr_versions"

    id = Column(Integer, primary_key=True, index=True)
    tr_id = Column(Integer, ForeignKey("termo_referencia.id"), nullable=False)
    version = Column(Integer, nullable=False)
    filename = Column(String, nullable=False)
    filetype = Column(Enum(FileType), nullable=False)
    sha256 = Column(String(64), nullable=False)
    path = Column(String, nullable=False)

    tr = relationship("TermoReferencia", back_populates="versions")

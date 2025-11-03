from uuid import UUID
from sqlalchemy.orm import Session
from app.db.models.user import User
from app.schemas.user import UserCreate

def get_user(db: Session, id: UUID) -> User | None:
    return db.query(User).filter(User.id == id).first()

def create_user(db: Session, *, obj_in: UserCreate) -> User:
    db_obj = User(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

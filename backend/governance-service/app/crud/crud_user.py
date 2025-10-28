from sqlalchemy.orm import Session
from app.db.models.user import User
from app.db.models.role import Role
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, db_user: User, user_in: UserUpdate):
    if user_in.is_active is not None:
        db_user.is_active = user_in.is_active
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

def add_role_to_user(db: Session, db_user: User, db_role: Role):
    db_user.roles.append(db_role)
    db.commit()
    db.refresh(db_user)
    return db_user

def remove_role_from_user(db: Session, db_user: User, db_role: Role):
    db_user.roles.remove(db_role)
    db.commit()
    db.refresh(db_user)
    return db_user

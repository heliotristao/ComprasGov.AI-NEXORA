from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.crud import crud_user
from app.schemas.user import UserCreate, UserUpdate, UserInDB

router = APIRouter()

@router.get("/", response_model=List[UserInDB])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    users = crud_user.get_users(db, skip=skip, limit=limit)
    return users

@router.post("/", response_model=UserInDB)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
):
    user = crud_user.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = crud_user.create_user(db=db, user=user_in)
    return user

@router.get("/{user_id}", response_model=UserInDB)
def read_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
):
    db_user = crud_user.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.patch("/{user_id}", response_model=UserInDB)
def update_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    user_in: UserUpdate,
):
    db_user = crud_user.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="The user with this username does not exist in the system",
        )
    user = crud_user.update_user(db=db, db_user=db_user, user_in=user_in)
    return user

@router.delete("/{user_id}", response_model=UserInDB)
def delete_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
):
    db_user = crud_user.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    user = crud_user.delete_user(db=db, user_id=user_id)
    return user

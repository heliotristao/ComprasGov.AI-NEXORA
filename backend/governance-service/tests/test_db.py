import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base_class import Base
from app.db.models.user import User
from app.db.models.role import Role
from app.core.security import get_password_hash

# Use a separate test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_create_database():
    if os.path.exists("./test.db"):
        os.remove("./test.db")
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        # Seed Roles
        master_role = Role(name="Master", description="Super user")
        db.add(master_role)
        db.commit()
        db.refresh(master_role)

        # Seed Master User
        master_user = User(
            email="master@nexora.ai",
            hashed_password=get_password_hash("string"),
        )
        master_user.roles.append(master_role)
        db.add(master_user)
        db.commit()
    finally:
        db.close()

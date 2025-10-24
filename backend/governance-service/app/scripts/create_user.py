import argparse
import os
import sys

# Add the project root to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from app.db.session import SessionLocal
from app.db.models.user import User
from app.core.security import get_password_hash

def create_user(db, email: str, password: str):
    """
    Creates a new user in the database.
    """
    # Check if user already exists
    db_user = db.query(User).filter(User.email == email).first()
    if db_user:
        print(f"Error: User with email '{email}' already exists.")
        return

    # Hash the password
    hashed_password = get_password_hash(password)

    # Create new user instance
    new_user = User(email=email, hashed_password=hashed_password)

    # Add to session and commit
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    print(f"User '{email}' created successfully!")

def main():
    """
    Main function to parse arguments and create user.
    """
    parser = argparse.ArgumentParser(description="Create a new user in the database.")
    parser.add_argument("--email", type=str, required=True, help="User's email address.")
    parser.add_argument("--password", type=str, required=True, help="User's password.")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        create_user(db, email=args.email, password=args.password)
    finally:
        db.close()

if __name__ == "__main__":
    main()

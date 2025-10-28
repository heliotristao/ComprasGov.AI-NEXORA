import os
import sys
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

# Add project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.core.security import get_password_hash
from app.db.models.user import User
from app.db.models.role import Role
from app.db.session import SessionLocal

# Master user credentials
MASTER_EMAIL = "master@comprasgov.ai"
MASTER_PASSWORD = "masterpassword"

def main():
    """
    Ensures the existence of a Master user with default credentials.
    This script implements an "upsert" logic:
    - If the Master user does not exist, it creates them.
    - If the Master user exists, it updates their password and ensures they have the Master role.
    """
    print("Starting master user seeding script...")

    if len(MASTER_PASSWORD) < 8:
        print("Error: Master password must be at least 8 characters long.")
        sys.exit(1)

    db = SessionLocal()
    try:
        # Step 1: Ensure roles exist, especially the "Master" role.
        roles_to_create = [
            {"name": "Master", "description": "Superusuário com controle total sobre o sistema."},
            {"name": "Admin", "description": "Administrador do sistema, pode gerenciar usuários e configurações."},
            {"name": "Planejador", "description": "Usuário padrão, pode criar e gerenciar planejamentos."}
        ]

        master_role = db.query(Role).filter(Role.name == "Master").first()
        if not master_role:
            print("Seeding roles...")
            for role_data in roles_to_create:
                # Check if role already exists before adding
                existing_role = db.query(Role).filter(Role.name == role_data["name"]).first()
                if not existing_role:
                    db.add(Role(**role_data))
            db.commit()
            print("Successfully seeded roles.")
            # Re-fetch the master role after seeding
            master_role = db.query(Role).filter(Role.name == "Master").first()
            if not master_role:
                print("Critical Error: Master role could not be created or found after seeding.")
                sys.exit(1)

        # Step 2: Check for the master user.
        user = db.query(User).filter(User.email == MASTER_EMAIL).first()
        hashed_password = get_password_hash(MASTER_PASSWORD)

        if user:
            # Step 3a: User exists, update them.
            print(f"User '{MASTER_EMAIL}' already exists. Updating password and ensuring Master role.")
            user.hashed_password = hashed_password

            # Check if user already has the Master role
            if master_role not in user.roles:
                user.roles.append(master_role)
                print("Assigned Master role to existing user.")

            db.commit()
            print("Successfully updated master user.")

        else:
            # Step 3b: User does not exist, create them.
            print(f"User '{MASTER_EMAIL}' not found. Creating new master user.")
            new_user = User(
                email=MASTER_EMAIL,
                hashed_password=hashed_password
            )
            new_user.roles.append(master_role)

            db.add(new_user)
            db.commit()
            print(f"Successfully created master user: {MASTER_EMAIL}")

    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()
        print("Script finished.")

if __name__ == "__main__":
    main()

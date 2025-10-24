import argparse
import os
import sys
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, Column, Integer, String
from passlib.context import CryptContext

# Add project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.core.security import get_password_hash
from app.db.models.user import User
from app.db.models.role import Role
from app.db.session import SessionLocal

def main():
    parser = argparse.ArgumentParser(description="Create a new user in the database.")
    parser.add_argument("--email", type=str, required=True, help="The email of the user to create.")
    parser.add_argument("--password", type=str, required=True, help="The password for the user.")
    args = parser.parse_args()

    if len(args.password) < 8:
        print("Erro: A senha deve ter no mínimo 8 caracteres.")
        exit(1)

    db = SessionLocal()
    try:
        # Seed roles if they don't exist
        roles_to_create = [
            {"name": "Master", "description": "Superusuário com controle total sobre o sistema."},
            {"name": "Admin", "description": "Administrador do sistema, pode gerenciar usuários e configurações."},
            {"name": "Planejador", "description": "Usuário padrão, pode criar e gerenciar planejamentos."}
        ]
        if db.query(Role).count() == 0:
            for role_data in roles_to_create:
                db.add(Role(**role_data))
            db.commit()
            print("Successfully seeded roles.")

        # Check if user already exists
        if db.query(User).filter(User.email == args.email).first():
            print(f"Error: User with email '{args.email}' already exists.")
            return

        hashed_password = get_password_hash(args.password)

        new_user = User(
            email=args.email,
            hashed_password=hashed_password
        )

        # Assign Master role to the first user
        if db.query(User).count() == 0:
            master_role = db.query(Role).filter(Role.name == "Master").first()
            if master_role:
                new_user.roles.append(master_role)
                print("Assigning Master role to the first user.")

        db.add(new_user)
        db.commit()

        print(f"Successfully created user: {args.email}")

    finally:
        db.close()

if __name__ == "__main__":
    main()

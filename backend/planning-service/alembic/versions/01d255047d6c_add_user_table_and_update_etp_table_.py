"""Add user table and update etp table with foreign key

Revision ID: 01d255047d6c
Revises: e83329e8903e
Create Date: 2025-10-29 15:42:50.551893

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
import uuid


# revision identifiers, used by Alembic.
revision: str = '01d255047d6c'
down_revision: Union[str, None] = 'e83329e8903e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('users',
    sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    sa.Column('email', sa.String(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.add_column('etps', sa.Column('updated_by', UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True))


def downgrade() -> None:
    op.drop_column('etps', 'updated_by')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')

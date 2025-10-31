"""Add version column to etp table

Revision ID: 15cd9405e901
Revises: 5fcc65fd1321
Create Date: 2025-10-30 19:32:12.121212

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '15cd9405e901'
down_revision: Union[str, None] = '5fcc65fd1321'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('etp', sa.Column('version', sa.Integer(), nullable=False, server_default='1'))


def downgrade() -> None:
    op.drop_column('etp', 'version')

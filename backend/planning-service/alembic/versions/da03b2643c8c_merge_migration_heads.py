"""Merge migration heads

Revision ID: da03b2643c8c
Revises: 15cd9405e901, 6e0ca7f4bcf7
Create Date: 2025-10-31 02:33:08.042135

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'da03b2643c8c'
down_revision: Union[str, None] = ('15cd9405e901', '6e0ca7f4bcf7')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

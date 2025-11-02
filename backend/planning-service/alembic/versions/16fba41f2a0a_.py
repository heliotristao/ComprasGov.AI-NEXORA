"""empty message

Revision ID: 16fba41f2a0a
Revises: 5fcc65fd1321, b2961d306fab
Create Date: 2025-10-30 00:18:47.717236

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '16fba41f2a0a'
down_revision: Union[str, None] = ('5fcc65fd1321', 'b2961d306fab')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

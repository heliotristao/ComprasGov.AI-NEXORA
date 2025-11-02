"""empty message

Revision ID: 3bbf6e3d9d1a
Revises: 2ff5506e16a1, 6bdf84fa93e4
Create Date: 2025-10-29 14:49:37.318615

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3bbf6e3d9d1a'
down_revision: Union[str, None] = ('2ff5506e16a1', '6bdf84fa93e4')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

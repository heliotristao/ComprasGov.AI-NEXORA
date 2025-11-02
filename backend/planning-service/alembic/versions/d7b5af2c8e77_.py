"""empty message

Revision ID: d7b5af2c8e77
Revises: 278dbe3a3b69, da03b2643c8c
Create Date: 2025-10-31 21:25:53.926470

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd7b5af2c8e77'
down_revision: Union[str, None] = ('278dbe3a3b69', 'da03b2643c8c')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

"""empty message

Revision ID: 8a865f8cc4c4
Revises: 0b7fc5581626, ec918fa3321a
Create Date: 2025-10-31 23:30:20.004876

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8a865f8cc4c4'
down_revision: Union[str, None] = ('0b7fc5581626', 'ec918fa3321a')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

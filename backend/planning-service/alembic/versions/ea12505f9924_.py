"""empty message

Revision ID: ea12505f9924
Revises: ee76c21eeefe, fed64938ac57
Create Date: 2025-11-01 09:01:28.826643

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ea12505f9924'
down_revision: Union[str, None] = ('ee76c21eeefe', 'fed64938ac57')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

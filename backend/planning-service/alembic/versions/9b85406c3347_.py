"""empty message

Revision ID: 9b85406c3347
Revises: 7816a3d39d60, c13b130deab3
Create Date: 2025-10-30 15:45:32.145386

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9b85406c3347'
down_revision: Union[str, None] = ('7816a3d39d60', 'c13b130deab3')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

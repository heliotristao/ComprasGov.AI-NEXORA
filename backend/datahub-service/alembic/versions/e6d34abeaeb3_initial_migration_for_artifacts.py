"""Initial migration for artifacts

Revision ID: e6d34abeaeb3
Revises:
Create Date: 2025-10-30 11:19:47.999653

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e6d34abeaeb3'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'artifacts',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('process_id', sa.String(), nullable=False),
        sa.Column('doc_type', sa.Enum('ETP', 'TR', 'LOG',
                  'DRAFT', name='doctype'), nullable=False),
        sa.Column('org_id', sa.String(), nullable=False),
        sa.Column('author_id', sa.String(), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('filename', sa.String(), nullable=False),
        sa.Column('s3_key', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True),
                  server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('s3_key')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('artifacts')
    sa.Enum(name='doctype').drop(op.get_bind(), checkfirst=False)

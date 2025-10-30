"""Add artifact_index table and pgvector extension

Revision ID: f6b37a7711c8
Revises: e6d34abeaeb3
Create Date: 2025-10-30 12:12:12.412280

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import VECTOR


# revision identifiers, used by Alembic.
revision: str = 'f6b37a7711c8'
down_revision: Union[str, Sequence[str], None] = 'e6d34abeaeb3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    op.create_table(
        'artifact_index',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('artifact_id', sa.UUID(), nullable=False),
        sa.Column('doc_type', sa.String(), nullable=False),
        sa.Column('org_id', sa.String(), nullable=False),
        sa.Column('embedding', VECTOR(1536), nullable=True),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['artifact_id'], ['artifacts.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_artifact_index_id'), 'artifact_index', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_artifact_index_id'), table_name='artifact_index')
    op.drop_table('artifact_index')

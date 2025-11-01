"""Add etp_workflow_history table

Revision ID: ed06352c1659
Revises: 319e88565073
Create Date: 2025-11-01 12:27:20.603357

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'ed06352c1659'
down_revision: Union[str, None] = '319e88565073'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('etp_workflow_history',
    sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('etp_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('status', sa.String(), nullable=False),
    sa.Column('comments', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['etp_id'], ['etps.id'], ),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('etp_workflow_history')

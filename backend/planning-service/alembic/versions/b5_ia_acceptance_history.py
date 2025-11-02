"""Add ia_acceptance_history table

Revision ID: b5_ia_acceptance_history
Revises: 7317529c0df8
Create Date: 2025-11-02 15:04:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b5_ia_acceptance_history'
down_revision: Union[str, None] = '7317529c0df8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('ia_acceptance_history',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('etp_id', sa.UUID(), nullable=False),
    sa.Column('section_name', sa.String(), nullable=False),
    sa.Column('execution_id', sa.UUID(), nullable=False),
    sa.Column('accepted_by_id', sa.UUID(), nullable=False),
    sa.Column('accepted_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('diff', sa.Text(), nullable=True),
    sa.ForeignKeyConstraint(['accepted_by_id'], ['users.id'], ),
    sa.ForeignKeyConstraint(['execution_id'], ['ai_executions.id'], ),
    sa.ForeignKeyConstraint(['etp_id'], ['etps.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ia_acceptance_history_etp_id'), 'ia_acceptance_history', ['etp_id'], unique=False)
    op.create_index(op.f('ix_ia_acceptance_history_execution_id'), 'ia_acceptance_history', ['execution_id'], unique=False)
    op.create_index(op.f('ix_ia_acceptance_history_accepted_by_id'), 'ia_acceptance_history', ['accepted_by_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_ia_acceptance_history_accepted_by_id'), table_name='ia_acceptance_history')
    op.drop_index(op.f('ix_ia_acceptance_history_execution_id'), table_name='ia_acceptance_history')
    op.drop_index(op.f('ix_ia_acceptance_history_etp_id'), table_name='ia_acceptance_history')
    op.drop_table('ia_acceptance_history')

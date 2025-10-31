"""create_etp_section_accepts_table

Revision ID: 0b7fc5581626
Revises: d7b5af2c8e77
Create Date: 2025-10-31 21:26:18.059484

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0b7fc5581626'
down_revision: Union[str, None] = 'd7b5af2c8e77'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'etp_section_accepts',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('etp_id', sa.UUID(), nullable=False),
        sa.Column('section', sa.String(), nullable=False),
        sa.Column('trace_id', sa.String(), nullable=False),
        sa.Column('diff_short', sa.Text(), nullable=False),
        sa.Column('created_by', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['etp_id'], ['etp.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_etp_section_accepts_etp_id'), 'etp_section_accepts', ['etp_id'], unique=False)
    op.create_index(op.f('ix_etp_section_accepts_trace_id'), 'etp_section_accepts', ['trace_id'], unique=False)
    op.create_index('ix_etp_section_accepts_etp_id_section', 'etp_section_accepts', ['etp_id', 'section'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_etp_section_accepts_etp_id_section', table_name='etp_section_accepts')
    op.drop_index(op.f('ix_etp_section_accepts_trace_id'), table_name='etp_section_accepts')
    op.drop_index(op.f('ix_etp_section_accepts_etp_id'), table_name='etp_section_accepts')
    op.drop_table('etp_section_accepts')

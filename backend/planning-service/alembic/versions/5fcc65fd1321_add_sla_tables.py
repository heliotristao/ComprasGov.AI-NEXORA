"""add sla tables"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5fcc65fd1321'
down_revision: Union[str, None] = '01d255047d6c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


sla_state_type = sa.Enum('ok', 'warn', 'breach', name='sla_state')
sla_notified_type = sa.Enum('ok', 'warn', 'breach', name='sla_notified_state')


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == 'postgresql':
        sla_state_type.create(bind, checkfirst=True)
        sla_notified_type.create(bind, checkfirst=True)

    op.create_table(
        'sla_settings',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('process_type', sa.String(length=100), nullable=False),
        sa.Column('stage', sa.String(length=100), nullable=False),
        sa.Column('target_hours', sa.Integer(), nullable=False),
        sa.Column('warn_threshold_hours', sa.Integer(), nullable=True),
        sa.Column('breach_threshold_hours', sa.Integer(), nullable=True),
        sa.Column('escalation_role', sa.String(length=100), nullable=True),
        sa.Column('notification_channel', sa.String(length=32), nullable=False, server_default='email'),
        sa.Column('webhook_url', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.UniqueConstraint('process_type', 'stage', name='uq_sla_settings_process_stage'),
    )

    op.create_table(
        'sla_status',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('process_id', sa.String(length=64), nullable=False),
        sa.Column('process_type', sa.String(length=100), nullable=False),
        sa.Column('stage', sa.String(length=100), nullable=False),
        sa.Column('state', sa.Enum('ok', 'warn', 'breach', name='sla_state', create_type=False), nullable=False, server_default='ok'),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('due_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_transition_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_notified_state', sa.Enum('ok', 'warn', 'breach', name='sla_notified_state', create_type=False), nullable=True),
        sa.Column('primary_contact', sa.String(length=255), nullable=True),
        sa.Column('escalation_contact', sa.String(length=255), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_sla_status_process', 'sla_status', ['process_type', 'process_id', 'stage'])
    op.create_index('ix_sla_status_state', 'sla_status', ['state'])


def downgrade() -> None:
    op.drop_index('ix_sla_status_state', table_name='sla_status')
    op.drop_index('ix_sla_status_process', table_name='sla_status')
    op.drop_table('sla_status')
    op.drop_table('sla_settings')

    bind = op.get_bind()
    if bind.dialect.name == 'postgresql':
        sla_notified_type.drop(bind, checkfirst=True)
        sla_state_type.drop(bind, checkfirst=True)

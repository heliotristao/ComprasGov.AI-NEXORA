"""add risco ai module"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'f4c72e5a4f8f'
down_revision: Union[str, None] = '7317529c0df8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _json_type():
    bind = op.get_bind()
    if bind and bind.dialect.name == "postgresql":
        return postgresql.JSONB(astext_type=sa.Text())
    return sa.JSON()


def upgrade() -> None:
    op.create_table(
        'contracts',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('numero', sa.String(length=50), nullable=True),
        sa.Column('etp_id', sa.UUID(), nullable=False),
        sa.Column('valor_inicial', sa.Float(), nullable=False, server_default="0"),
        sa.Column('valor_aditivos', sa.Float(), nullable=False, server_default="0"),
        sa.Column('data_inicio_prevista', sa.DateTime(timezone=True), nullable=True),
        sa.Column('data_fim_prevista', sa.DateTime(timezone=True), nullable=True),
        sa.Column('data_fim_real', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['etp_id'], ['etps.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('etp_id')
    )
    op.create_index('idx_contract_etp_id', 'contracts', ['etp_id'], unique=False)

    json_type = _json_type()
    op.create_table(
        'risk_analysis',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('etp_id', sa.UUID(), nullable=False),
        sa.Column('score_global', sa.Float(), nullable=False),
        sa.Column('categoria_risco', sa.String(length=20), nullable=False),
        sa.Column('probabilidade', sa.Integer(), nullable=False),
        sa.Column('impacto', sa.Integer(), nullable=False),
        sa.Column('fatores_principais', json_type, nullable=False),
        sa.Column('recomendacoes', json_type, nullable=False),
        sa.Column('model_version', sa.String(length=20), nullable=False),
        sa.Column('confidence_score', sa.Float(), nullable=False),
        sa.Column('data_analise', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['etp_id'], ['etps.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('etp_id')
    )
    op.create_index('idx_risk_etp_id', 'risk_analysis', ['etp_id'], unique=False)
    op.create_index('idx_risk_categoria', 'risk_analysis', ['categoria_risco'], unique=False)


def downgrade() -> None:
    op.drop_index('idx_risk_categoria', table_name='risk_analysis')
    op.drop_index('idx_risk_etp_id', table_name='risk_analysis')
    op.drop_table('risk_analysis')
    op.drop_index('idx_contract_etp_id', table_name='contracts')
    op.drop_table('contracts')

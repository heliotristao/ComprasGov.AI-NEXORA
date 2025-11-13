"""Add risk analysis table for Risco.AI"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "2c3d2e1f8a7b"
down_revision: Union[str, None] = "fed64938ac57"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "risk_analysis",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("etp_id", sa.UUID(), nullable=False),
        sa.Column("score_global", sa.Float(), nullable=False),
        sa.Column("categoria_risco", sa.String(length=20), nullable=False),
        sa.Column("probabilidade", sa.Integer(), nullable=False),
        sa.Column("impacto", sa.Integer(), nullable=False),
        sa.Column("fatores_principais", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("recomendacoes", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("model_version", sa.String(length=20), nullable=True),
        sa.Column("confidence_score", sa.Float(), nullable=True),
        sa.Column(
            "data_analise",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["etp_id"], ["etps.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_risk_etp_id", "risk_analysis", ["etp_id"], unique=False)
    op.create_index("idx_risk_categoria", "risk_analysis", ["categoria_risco"], unique=False)


def downgrade() -> None:
    op.drop_index("idx_risk_categoria", table_name="risk_analysis")
    op.drop_index("idx_risk_etp_id", table_name="risk_analysis")
    op.drop_table("risk_analysis")

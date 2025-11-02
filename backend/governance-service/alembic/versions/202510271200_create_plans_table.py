"""Create plans table"""
revision = '202510271200'
down_revision = 'c4d58f6bbe24'
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ENUM


def upgrade() -> None:
    op.create_table(
        "plans",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("identifier", sa.String(100), nullable=False),
        sa.Column("object", sa.Text(), nullable=False),
        sa.Column("justification", sa.Text(), nullable=True),
        sa.Column("status", sa.Enum('draft', 'pending', 'approved', 'rejected', 'archived', name='plan_status'), nullable=False, server_default='draft'),
        sa.Column("estimated_value", sa.Numeric(15, 2), nullable=True),
        sa.Column("responsible_department", sa.String(255), nullable=True),
        sa.Column("ai_generated", sa.Boolean(), nullable=False, server_default='false'),
        sa.Column("created_by", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index(op.f("ix_plans_id"), "plans", ["id"], unique=False)
    op.create_index(op.f("ix_plans_identifier"), "plans", ["identifier"], unique=True)
    op.create_index(op.f("ix_plans_status"), "plans", ["status"], unique=False)
    op.create_index(op.f("ix_plans_created_by"), "plans", ["created_by"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_plans_created_by"), table_name="plans")
    op.drop_index(op.f("ix_plans_status"), table_name="plans")
    op.drop_index(op.f("ix_plans_identifier"), table_name="plans")
    op.drop_index(op.f("ix_plans_id"), table_name="plans")
    op.drop_table("plans")

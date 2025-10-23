"""Expand plannings table with detailed ETP fields

Revision ID: 18da9927838e
Revises: 1b2d4f8e6c7a
Create Date: 2025-10-23 09:47:38.527772493

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '18da9927838e'
down_revision = '1b2d4f8e6c7a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('plannings', sa.Column('necessity', sa.Text(), nullable=True))
    op.add_column('plannings', sa.Column('solution_comparison', sa.Text(), nullable=True))
    op.add_column('plannings', sa.Column('contract_quantities', sa.Text(), nullable=True))
    op.add_column('plannings', sa.Column('technical_viability', sa.Text(), nullable=True))
    op.add_column('plannings', sa.Column('expected_results', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('plannings', 'expected_results')
    op.drop_column('plannings', 'technical_viability')
    op.drop_column('plannings', 'contract_quantities')
    op.drop_column('plannings', 'solution_comparison')
    op.drop_column('plannings', 'necessity')

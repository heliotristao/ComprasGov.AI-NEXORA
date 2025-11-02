"""Change status column from ENUM to VARCHAR"""
revision = '202510271300'
down_revision = '202510271200'
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa


def upgrade() -> None:
    # Alterar coluna status de ENUM para VARCHAR
    op.execute("ALTER TABLE plans ALTER COLUMN status TYPE VARCHAR(20) USING status::text")


def downgrade() -> None:
    # Reverter para ENUM
    op.execute("ALTER TABLE plans ALTER COLUMN status TYPE plan_status USING status::plan_status")

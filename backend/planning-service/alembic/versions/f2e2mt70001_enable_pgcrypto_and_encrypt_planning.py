"""Enable pgcrypto and encrypt planning.market_analysis column."""

from __future__ import annotations

import os
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f2e2mt70001"
down_revision: Union[str, None] = "7317529c0df8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _get_encryption_key() -> str:
    return os.environ.get("ENCRYPTION_KEY", "change-me-32-bytes-key")


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")

    encryption_key = _get_encryption_key()

    op.execute(
        sa.text(
            """
            ALTER TABLE plannings
            ALTER COLUMN market_analysis TYPE BYTEA
            USING CASE
                WHEN market_analysis IS NULL THEN NULL
                ELSE pgp_sym_encrypt(market_analysis::text, :key)
            END
            """
        ).bindparams(key=encryption_key)
    )


def downgrade() -> None:
    encryption_key = _get_encryption_key()

    op.execute(
        sa.text(
            """
            ALTER TABLE plannings
            ALTER COLUMN market_analysis TYPE TEXT
            USING CASE
                WHEN market_analysis IS NULL THEN NULL
                ELSE pgp_sym_decrypt(market_analysis, :key)::text
            END
            """
        ).bindparams(key=encryption_key)
    )

    op.execute("DROP EXTENSION IF EXISTS pgcrypto;")

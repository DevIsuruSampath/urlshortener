"""add updated_at to users

Revision ID: 0003_admin_user_updated_at
Revises: 0002_admin_bootstrap_flag
Create Date: 2026-02-14
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0003_admin_user_updated_at"
down_revision = "0002_admin_bootstrap_flag"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_column("users", "updated_at")

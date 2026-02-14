"""add admin recovery codes table

Revision ID: 0004_admin_recovery_codes
Revises: 0003_admin_user_updated_at
Create Date: 2026-02-14
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "0004_admin_recovery_codes"
down_revision = "0003_admin_user_updated_at"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "admin_recovery_codes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("code_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_admin_recovery_codes_user_id", "admin_recovery_codes", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_admin_recovery_codes_user_id", table_name="admin_recovery_codes")
    op.drop_table("admin_recovery_codes")

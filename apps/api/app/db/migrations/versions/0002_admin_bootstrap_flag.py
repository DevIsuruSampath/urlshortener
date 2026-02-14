"""add app_settings table for admin bootstrap flag

Revision ID: 0002_admin_bootstrap_flag
Revises: 0001_initial
Create Date: 2026-02-14
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0002_admin_bootstrap_flag"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "app_settings",
        sa.Column("key", sa.String(length=128), primary_key=True, nullable=False),
        sa.Column("value", sa.Text(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    conn = op.get_bind()
    existing_users = conn.execute(sa.text("SELECT COUNT(*) FROM users")).scalar() or 0
    if existing_users > 0:
        conn.execute(
            sa.text(
                """
                INSERT INTO app_settings (key, value)
                VALUES (:key, :value)
                ON CONFLICT (key)
                DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
                """
            ),
            {"key": "admin_initialized", "value": "true"},
        )


def downgrade() -> None:
    op.drop_table("app_settings")

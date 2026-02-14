"""add security events audit table

Revision ID: 0005_security_events
Revises: 0004_admin_recovery_codes
Create Date: 2026-02-14
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "0005_security_events"
down_revision = "0004_admin_recovery_codes"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "security_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("event_type", sa.String(length=64), nullable=False),
        sa.Column("actor_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("ip_address", sa.String(length=64), nullable=True),
        sa.Column("details", sa.JSON(), nullable=False, server_default=sa.text("'{}'::json")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_security_events_event_type", "security_events", ["event_type"], unique=False)
    op.create_index("ix_security_events_actor_user_id", "security_events", ["actor_user_id"], unique=False)
    op.create_index("ix_security_events_created_at", "security_events", ["created_at"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_security_events_created_at", table_name="security_events")
    op.drop_index("ix_security_events_actor_user_id", table_name="security_events")
    op.drop_index("ix_security_events_event_type", table_name="security_events")
    op.drop_table("security_events")

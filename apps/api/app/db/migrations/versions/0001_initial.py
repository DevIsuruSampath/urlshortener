"""initial schema

Revision ID: 0001_initial
Revises: 
Create Date: 2026-02-13
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "links",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("code", sa.String(length=32), nullable=False),
        sa.Column("destination_url", sa.Text(), nullable=False),
        sa.Column("tier", sa.String(length=64), nullable=False),
        sa.Column("web_steps", sa.Integer(), nullable=False),
        sa.Column("app_steps", sa.Integer(), nullable=False),
        sa.Column("game_enabled", sa.Boolean(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_links_code", "links", ["code"], unique=True)
    op.create_index("ix_links_user_id", "links", ["user_id"], unique=False)

    op.create_table(
        "click_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("link_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("links.id", ondelete="CASCADE"), nullable=False),
        sa.Column("code", sa.String(length=32), nullable=False),
        sa.Column("publisher_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("ip_hash", sa.String(length=64), nullable=False),
        sa.Column("ua_hash", sa.String(length=64), nullable=False),
        sa.Column("total_steps", sa.Integer(), nullable=False),
        sa.Column("current_step", sa.Integer(), nullable=False),
        sa.Column("suspicious", sa.Boolean(), nullable=False),
        sa.Column("status", sa.String(length=24), nullable=False),
        sa.Column("payable", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("step_started_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_click_sessions_code", "click_sessions", ["code"], unique=False)
    op.create_index("ix_click_sessions_link_id", "click_sessions", ["link_id"], unique=False)
    op.create_index("ix_click_sessions_publisher_id", "click_sessions", ["publisher_id"], unique=False)
    op.create_index("ix_click_sessions_ip_hash", "click_sessions", ["ip_hash"], unique=False)
    op.create_index("ix_click_sessions_ua_hash", "click_sessions", ["ua_hash"], unique=False)

    op.create_table(
        "completion_dedupes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("click_session_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("link_code", sa.String(length=32), nullable=False),
        sa.Column("ip_hash", sa.String(length=64), nullable=False),
        sa.Column("ua_hash", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_completion_dedupes_click_session_id", "completion_dedupes", ["click_session_id"], unique=True)
    op.create_index("ix_completion_dedupes_link_code", "completion_dedupes", ["link_code"], unique=False)
    op.create_index("ix_completion_dedupes_ip_hash", "completion_dedupes", ["ip_hash"], unique=False)
    op.create_index("ix_completion_dedupes_ua_hash", "completion_dedupes", ["ua_hash"], unique=False)
    op.create_index("ix_dedupe_lookup", "completion_dedupes", ["link_code", "ip_hash", "ua_hash"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_dedupe_lookup", table_name="completion_dedupes")
    op.drop_index("ix_completion_dedupes_ua_hash", table_name="completion_dedupes")
    op.drop_index("ix_completion_dedupes_ip_hash", table_name="completion_dedupes")
    op.drop_index("ix_completion_dedupes_link_code", table_name="completion_dedupes")
    op.drop_index("ix_completion_dedupes_click_session_id", table_name="completion_dedupes")
    op.drop_table("completion_dedupes")

    op.drop_index("ix_click_sessions_ua_hash", table_name="click_sessions")
    op.drop_index("ix_click_sessions_ip_hash", table_name="click_sessions")
    op.drop_index("ix_click_sessions_publisher_id", table_name="click_sessions")
    op.drop_index("ix_click_sessions_link_id", table_name="click_sessions")
    op.drop_index("ix_click_sessions_code", table_name="click_sessions")
    op.drop_table("click_sessions")

    op.drop_index("ix_links_user_id", table_name="links")
    op.drop_index("ix_links_code", table_name="links")
    op.drop_table("links")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")

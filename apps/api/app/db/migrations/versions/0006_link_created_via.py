"""add created_via column to links

Revision ID: 0006_link_created_via
Revises: 0005_security_events
Create Date: 2026-02-15

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0006_link_created_via"
down_revision = "0005_security_events"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "links",
        sa.Column("created_via", sa.String(length=32), server_default="dashboard", nullable=False),
    )


def downgrade() -> None:
    op.drop_column("links", "created_via")

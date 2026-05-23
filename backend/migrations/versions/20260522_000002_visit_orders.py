"""visit medications and procedures

Revision ID: 20260522_000002
Revises: 20260521_000001
Create Date: 2026-05-22 00:00:02
"""

from alembic import op
import sqlalchemy as sa


revision = "20260522_000002"
down_revision = "20260521_000001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "visit_medications",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("visit_id", sa.Integer(), nullable=False),
        sa.Column("medication_name", sa.String(length=255), nullable=False),
        sa.Column("dosage", sa.String(length=255), nullable=True),
        sa.Column("instructions", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["visit_id"], ["visits.id"]),
    )

    op.create_table(
        "visit_procedures",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("visit_id", sa.Integer(), nullable=False),
        sa.Column("procedure_name", sa.String(length=255), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("is_completed", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["visit_id"], ["visits.id"]),
    )


def downgrade() -> None:
    op.drop_table("visit_procedures")
    op.drop_table("visit_medications")

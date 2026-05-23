"""seed auth roles and users

Revision ID: 20260522_000003
Revises: 20260522_000002
Create Date: 2026-05-22 00:00:03
"""

from alembic import op
import sqlalchemy as sa


revision = "20260522_000003"
down_revision = "20260522_000002"
branch_labels = None
depends_on = None


roles_table = sa.table(
    "roles",
    sa.column("id", sa.Integer()),
    sa.column("name", sa.String()),
    sa.column("description", sa.String()),
)

positions_table = sa.table(
    "positions",
    sa.column("id", sa.Integer()),
    sa.column("name", sa.String()),
)

employees_table = sa.table(
    "employees",
    sa.column("id", sa.Integer()),
    sa.column("first_name", sa.String()),
    sa.column("last_name", sa.String()),
    sa.column("middle_name", sa.String()),
    sa.column("phone", sa.String()),
    sa.column("is_doctor", sa.Boolean()),
    sa.column("position_id", sa.Integer()),
)

users_table = sa.table(
    "users",
    sa.column("id", sa.Integer()),
    sa.column("username", sa.String()),
    sa.column("password_hash", sa.String()),
    sa.column("is_active", sa.Boolean()),
    sa.column("role_id", sa.Integer()),
    sa.column("employee_id", sa.Integer()),
)


def upgrade() -> None:
    bind = op.get_bind()

    def ensure_role(name: str, description: str) -> int:
        existing = bind.execute(
            sa.select(roles_table.c.id).where(roles_table.c.name == name)
        ).scalar_one_or_none()
        if existing is not None:
            bind.execute(
                sa.update(roles_table)
                .where(roles_table.c.id == existing)
                .values(description=description)
            )
            return existing

        result = bind.execute(
            sa.insert(roles_table).values(name=name, description=description)
        )
        return result.inserted_primary_key[0]

    def ensure_position(name: str) -> int:
        existing = bind.execute(
            sa.select(positions_table.c.id).where(
                sa.func.lower(positions_table.c.name) == name.lower()
            )
        ).scalar_one_or_none()
        if existing is not None:
            return existing

        result = bind.execute(sa.insert(positions_table).values(name=name))
        return result.inserted_primary_key[0]

    def ensure_doctor_employee() -> int:
        existing = bind.execute(
            sa.select(employees_table.c.id)
            .where(
                employees_table.c.is_doctor.is_(True),
                ~sa.exists(
                    sa.select(users_table.c.id).where(
                        users_table.c.employee_id == employees_table.c.id
                    )
                ),
            )
            .order_by(employees_table.c.id.asc())
        ).scalar_one_or_none()
        if existing is not None:
            return existing

        position_id = ensure_position("Терапевт")
        result = bind.execute(
            sa.insert(employees_table).values(
                first_name="Системный",
                last_name="Доктор",
                middle_name="Тестовый",
                phone="+7-900-000-00-03",
                is_doctor=True,
                position_id=position_id,
            )
        )
        return result.inserted_primary_key[0]

    def ensure_user(
        *,
        username: str,
        password_hash: str,
        role_id: int,
        employee_id: int | None,
    ) -> None:
        existing_id = bind.execute(
            sa.select(users_table.c.id).where(users_table.c.username == username)
        ).scalar_one_or_none()

        values = {
            "password_hash": password_hash,
            "role_id": role_id,
            "employee_id": employee_id,
            "is_active": True,
        }

        if existing_id is None:
            bind.execute(
                sa.insert(users_table).values(
                    username=username,
                    **values,
                )
            )
            return

        bind.execute(
            sa.update(users_table)
            .where(users_table.c.id == existing_id)
            .values(**values)
        )

    admin_role_id = ensure_role("admin", "Полный доступ к системе")
    registrar_role_id = ensure_role("registrar", "Работа с пациентами и записью на прием")
    doctor_role_id = ensure_role("doctor", "Проведение приемов и ведение протоколов")
    doctor_employee_id = ensure_doctor_employee()

    ensure_user(
        username="admin",
        password_hash="pbkdf2_sha256$120000$b5e3806a7711067dd6688e9b7debc390$543733776f2a2d9e66ada40efcdb648740deea7bdb4bcb5cd60eb6c102dd0ba7",
        role_id=admin_role_id,
        employee_id=None,
    )
    ensure_user(
        username="registrar",
        password_hash="pbkdf2_sha256$120000$31dd53720b1aabecf1bab19dcf34e178$d578e0fe46d9b39ea5a760a4ce2727523f5ed2d7cb0a2792f93abc869feb6322",
        role_id=registrar_role_id,
        employee_id=None,
    )
    ensure_user(
        username="doctor",
        password_hash="pbkdf2_sha256$120000$bc73c423e4456285b5efc746aaee1a7d$dd5580ce40502ec1a0208bd72f16d1b4c4e51f8d880717bc965748620959bb22",
        role_id=doctor_role_id,
        employee_id=doctor_employee_id,
    )


def downgrade() -> None:
    bind = op.get_bind()

    bind.execute(
        sa.delete(users_table).where(
            users_table.c.username.in_(["admin", "registrar", "doctor"])
        )
    )
    bind.execute(
        sa.delete(employees_table).where(
            employees_table.c.first_name == "Системный",
            employees_table.c.last_name == "Доктор",
            employees_table.c.middle_name == "Тестовый",
            employees_table.c.phone == "+7-900-000-00-03",
        )
    )
    bind.execute(
        sa.delete(roles_table).where(
            roles_table.c.name.in_(["admin", "registrar", "doctor"])
        )
    )

from sqlalchemy import create_engine, text

from app.core.config import settings


PASSWORD_HASHES = {
    "admin": "pbkdf2_sha256$120000$b5e3806a7711067dd6688e9b7debc390$543733776f2a2d9e66ada40efcdb648740deea7bdb4bcb5cd60eb6c102dd0ba7",
    "registrar": "pbkdf2_sha256$120000$31dd53720b1aabecf1bab19dcf34e178$d578e0fe46d9b39ea5a760a4ce2727523f5ed2d7cb0a2792f93abc869feb6322",
    "doctor": "pbkdf2_sha256$120000$bc73c423e4456285b5efc746aaee1a7d$dd5580ce40502ec1a0208bd72f16d1b4c4e51f8d880717bc965748620959bb22",
}


def main() -> None:
    engine = create_engine(settings.database_url)

    with engine.begin() as connection:
        role_ids: dict[str, int] = {}
        roles = [
            ("admin", "Полный доступ к системе"),
            ("registrar", "Работа с пациентами и записью на прием"),
            ("doctor", "Проведение приемов и ведение протоколов"),
        ]

        position_id = connection.execute(
            text("SELECT id FROM positions WHERE lower(name) = lower(:name)"),
            {"name": "Терапевт"},
        ).scalar_one_or_none()
        if position_id is None:
            position_id = connection.execute(
                text("INSERT INTO positions (name) VALUES (:name) RETURNING id"),
                {"name": "Терапевт"},
            ).scalar_one()

        for name, description in roles:
            role_id = connection.execute(
                text("SELECT id FROM roles WHERE name = :name"),
                {"name": name},
            ).scalar_one_or_none()
            if role_id is None:
                role_id = connection.execute(
                    text(
                        "INSERT INTO roles (name, description) "
                        "VALUES (:name, :description) RETURNING id"
                    ),
                    {"name": name, "description": description},
                ).scalar_one()
            else:
                connection.execute(
                    text("UPDATE roles SET description = :description WHERE id = :id"),
                    {"description": description, "id": role_id},
                )
            role_ids[name] = role_id

        doctor_employee_id = connection.execute(
            text(
                "SELECT e.id "
                "FROM employees e "
                "LEFT JOIN users u ON u.employee_id = e.id "
                "WHERE e.is_doctor = true AND u.id IS NULL "
                "ORDER BY e.id "
                "LIMIT 1"
            )
        ).scalar_one_or_none()

        if doctor_employee_id is None:
            doctor_employee_id = connection.execute(
                text(
                    "INSERT INTO employees "
                    "(first_name, last_name, middle_name, phone, is_doctor, position_id) "
                    "VALUES "
                    "(:first_name, :last_name, :middle_name, :phone, true, :position_id) "
                    "RETURNING id"
                ),
                {
                    "first_name": "Системный",
                    "last_name": "Доктор",
                    "middle_name": "Тестовый",
                    "phone": "+7-900-000-00-03",
                    "position_id": position_id,
                },
            ).scalar_one()

        users = [
            ("admin", PASSWORD_HASHES["admin"], "admin", None),
            ("registrar", PASSWORD_HASHES["registrar"], "registrar", None),
            ("doctor", PASSWORD_HASHES["doctor"], "doctor", doctor_employee_id),
        ]

        for username, password_hash, role_name, employee_id in users:
            user_id = connection.execute(
                text("SELECT id FROM users WHERE username = :username"),
                {"username": username},
            ).scalar_one_or_none()

            values = {
                "username": username,
                "password_hash": password_hash,
                "role_id": role_ids[role_name],
                "employee_id": employee_id,
            }

            if user_id is None:
                connection.execute(
                    text(
                        "INSERT INTO users "
                        "(username, password_hash, is_active, role_id, employee_id) "
                        "VALUES (:username, :password_hash, true, :role_id, :employee_id)"
                    ),
                    values,
                )
            else:
                connection.execute(
                    text(
                        "UPDATE users "
                        "SET password_hash = :password_hash, "
                        "is_active = true, "
                        "role_id = :role_id, "
                        "employee_id = :employee_id "
                        "WHERE id = :id"
                    ),
                    {
                        **values,
                        "id": user_id,
                    },
                )

    print("Seeded auth roles and users.")


if __name__ == "__main__":
    main()

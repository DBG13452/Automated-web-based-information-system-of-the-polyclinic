from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.core.security import hash_password
from app.models.employee import Employee
from app.models.position import Position
from app.models.role import Role
from app.models.user import User
from app.schemas.user_admin import UserCreate


class UserValidationError(Exception):
    def __init__(self, detail: str) -> None:
        super().__init__(detail)
        self.detail = detail


class UserService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_users(self) -> tuple[list[User], int]:
        query = (
            select(User)
            .options(
                selectinload(User.role),
                selectinload(User.employee),
            )
            .order_by(User.username.asc())
        )
        items = self.db.scalars(query).all()
        return items, len(items)

    def list_roles(self) -> list[Role]:
        query = select(Role).order_by(Role.name.asc())
        return self.db.scalars(query).all()

    def list_available_doctors(self) -> list[Employee]:
        query = (
            select(Employee)
            .where(
                Employee.is_doctor.is_(True),
                ~Employee.user.has(),
            )
            .options(selectinload(Employee.position))
            .order_by(Employee.last_name.asc(), Employee.first_name.asc())
        )
        return self.db.scalars(query).all()

    def create_user(self, payload: UserCreate) -> User:
        normalized_username = payload.username.strip().lower()
        existing_user = self.db.scalar(
            select(User).where(func.lower(User.username) == normalized_username)
        )
        if existing_user is not None:
            raise UserValidationError("Пользователь с таким логином уже существует.")

        role = self.db.scalar(
            select(Role).where(func.lower(Role.name) == payload.role_name.strip().lower())
        )
        if role is None:
            raise UserValidationError("Выбрана неизвестная роль.")

        employee: Employee | None = None
        if role.name == "doctor":
            if payload.employee_id is None:
                raise UserValidationError("Для учетной записи врача нужно выбрать сотрудника.")

            employee = self.db.scalar(
                select(Employee)
                .where(Employee.id == payload.employee_id, Employee.is_doctor.is_(True))
                .options(selectinload(Employee.user))
            )
            if employee is None:
                raise UserValidationError("Выбранный сотрудник-врач не найден.")
            if employee.user is not None:
                raise UserValidationError("У выбранного врача уже есть учетная запись.")
        elif payload.employee_id is not None:
            raise UserValidationError("Привязка сотрудника доступна только для роли врача.")

        user = User(
            username=normalized_username,
            password_hash=hash_password(payload.password),
            is_active=True,
            role_id=role.id,
            employee_id=employee.id if employee else None,
        )
        self.db.add(user)
        self.db.commit()

        return self.get_user(user.id)

    def get_user(self, user_id: int) -> User:
        query = (
            select(User)
            .where(User.id == user_id)
            .options(
                selectinload(User.role),
                selectinload(User.employee),
            )
        )
        user = self.db.scalar(query)
        if user is None:
            raise UserValidationError("Пользователь не найден.")
        return user

    @staticmethod
    def build_employee_name(employee: Employee | None) -> str | None:
        if employee is None:
            return None
        parts = [employee.last_name, employee.first_name, employee.middle_name]
        return " ".join(part for part in parts if part)

    @staticmethod
    def build_doctor_label(employee: Employee) -> str:
        full_name = UserService.build_employee_name(employee) or f"Врач #{employee.id}"
        position_name = employee.position.name if employee.position else None
        if position_name:
            return f"{full_name} ({position_name})"
        return full_name

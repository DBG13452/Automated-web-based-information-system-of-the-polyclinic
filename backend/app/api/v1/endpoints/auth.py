from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.api.deps.auth import get_current_user
from app.core.security import create_access_token, verify_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import CurrentUserRead, LoginRequest, TokenRead

router = APIRouter()


def build_employee_name(user: User) -> str | None:
    if user.employee is None:
        return None
    parts = [user.employee.last_name, user.employee.first_name, user.employee.middle_name]
    return " ".join(part for part in parts if part)


def serialize_user(user: User) -> CurrentUserRead:
    return CurrentUserRead(
        id=user.id,
        username=user.username,
        role_name=user.role.name,
        employee_id=user.employee_id,
        employee_name=build_employee_name(user),
        is_active=user.is_active,
    )


@router.post("/login", response_model=TokenRead)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
) -> TokenRead:
    normalized_username = payload.username.strip().lower()
    query = (
        select(User)
        .where(func.lower(User.username) == normalized_username)
        .options(
            selectinload(User.role),
            selectinload(User.employee),
        )
    )
    user = db.scalar(query)
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Учетная запись отключена.",
        )

    access_token, expires_in = create_access_token(
        user_id=user.id,
        username=user.username,
        role_name=user.role.name,
        employee_id=user.employee_id,
    )
    return TokenRead(
        access_token=access_token,
        expires_in=expires_in,
        user=serialize_user(user),
    )


@router.get("/me", response_model=CurrentUserRead)
def get_me(current_user: User = Depends(get_current_user)) -> CurrentUserRead:
    return serialize_user(current_user)

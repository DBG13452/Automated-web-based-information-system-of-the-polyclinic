from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps.auth import require_roles
from app.db.session import get_db
from app.schemas.user_admin import (
    DoctorOptionRead,
    RoleOptionRead,
    UserCreate,
    UserListResponse,
    UserMetaRead,
    UserRead,
)
from app.services.user_service import UserService, UserValidationError

router = APIRouter()


def serialize_user(user) -> UserRead:
    return UserRead(
        id=user.id,
        username=user.username,
        role_name=user.role.name,
        employee_id=user.employee_id,
        employee_name=UserService.build_employee_name(user.employee),
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.get("", response_model=UserListResponse)
def list_users(
    _current_user=Depends(require_roles("admin")),
    db: Session = Depends(get_db),
) -> UserListResponse:
    service = UserService(db)
    items, total = service.list_users()
    return UserListResponse(
        items=[serialize_user(item) for item in items],
        total=total,
    )


@router.get("/meta", response_model=UserMetaRead)
def get_user_meta(
    _current_user=Depends(require_roles("admin")),
    db: Session = Depends(get_db),
) -> UserMetaRead:
    service = UserService(db)
    roles = service.list_roles()
    doctors = service.list_available_doctors()

    return UserMetaRead(
        roles=[
            RoleOptionRead(name=role.name, description=role.description)
            for role in roles
        ],
        available_doctors=[
            DoctorOptionRead(
                id=doctor.id,
                full_name=UserService.build_employee_name(doctor) or f"Врач #{doctor.id}",
                position_name=doctor.position.name if doctor.position else None,
            )
            for doctor in doctors
        ],
    )


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    _current_user=Depends(require_roles("admin")),
    db: Session = Depends(get_db),
) -> UserRead:
    service = UserService(db)
    try:
        user = service.create_user(payload)
    except UserValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=exc.detail) from exc
    return serialize_user(user)

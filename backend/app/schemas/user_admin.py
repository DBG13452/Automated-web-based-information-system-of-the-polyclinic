from datetime import datetime

from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=6, max_length=255)
    role_name: str = Field(min_length=1, max_length=50)
    employee_id: int | None = None


class UserRead(BaseModel):
    id: int
    username: str
    role_name: str
    employee_id: int | None
    employee_name: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class UserListResponse(BaseModel):
    items: list[UserRead]
    total: int


class RoleOptionRead(BaseModel):
    name: str
    description: str | None


class DoctorOptionRead(BaseModel):
    id: int
    full_name: str
    position_name: str | None


class UserMetaRead(BaseModel):
    roles: list[RoleOptionRead]
    available_doctors: list[DoctorOptionRead]

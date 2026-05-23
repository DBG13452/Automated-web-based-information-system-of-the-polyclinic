from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=255)


class CurrentUserRead(BaseModel):
    id: int
    username: str
    role_name: str
    employee_id: int | None
    employee_name: str | None
    is_active: bool


class TokenRead(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: CurrentUserRead

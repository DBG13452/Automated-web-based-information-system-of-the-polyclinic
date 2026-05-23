from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict, Field, model_validator


class DoctorBase(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    middle_name: str | None = Field(default=None, max_length=100)
    phone: str | None = Field(default=None, max_length=20)
    position_name: str = Field(min_length=1, max_length=100)


class DoctorCreate(DoctorBase):
    pass


class DoctorUpdate(BaseModel):
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    middle_name: str | None = Field(default=None, max_length=100)
    phone: str | None = Field(default=None, max_length=20)
    position_name: str | None = Field(default=None, min_length=1, max_length=100)


class DoctorScheduleCreate(BaseModel):
    work_date: date
    start_time: time
    end_time: time
    slot_duration_minutes: int = Field(default=30, ge=5, le=240)

    @model_validator(mode="after")
    def validate_time_range(self) -> "DoctorScheduleCreate":
        if self.end_time <= self.start_time:
            raise ValueError("Время окончания должно быть позже времени начала.")
        return self


class DoctorScheduleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    work_date: date
    start_time: time
    end_time: time
    slot_duration_minutes: int
    created_at: datetime
    updated_at: datetime


class DoctorRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    middle_name: str | None
    phone: str | None
    position_name: str | None
    created_at: datetime
    updated_at: datetime


class DoctorDetailsRead(DoctorRead):
    schedules: list[DoctorScheduleRead]


class DoctorListResponse(BaseModel):
    items: list[DoctorRead]
    total: int

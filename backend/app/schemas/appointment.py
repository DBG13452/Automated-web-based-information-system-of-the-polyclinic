from datetime import date, datetime, time

from pydantic import BaseModel, Field


class AppointmentCreate(BaseModel):
    patient_id: int
    doctor_id: int
    appointment_date: date
    start_time: time
    reason: str | None = Field(default=None, max_length=255)


class AvailableSlotRead(BaseModel):
    start_time: time
    end_time: time
    duration_minutes: int


class AppointmentRead(BaseModel):
    id: int
    patient_id: int
    patient_name: str
    doctor_id: int
    doctor_name: str
    appointment_date: date
    start_time: time
    end_time: time
    status: str
    reason: str | None
    created_at: datetime


class AppointmentListResponse(BaseModel):
    items: list[AppointmentRead]
    total: int

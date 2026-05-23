from datetime import date, datetime, time

from pydantic import BaseModel, Field


class VisitMedicationInput(BaseModel):
    medication_name: str = Field(min_length=1, max_length=255)
    dosage: str | None = Field(default=None, max_length=255)
    instructions: str | None = Field(default=None, max_length=5000)


class VisitProcedureInput(BaseModel):
    procedure_name: str = Field(min_length=1, max_length=255)
    notes: str | None = Field(default=None, max_length=5000)
    is_completed: bool = False


class DoctorAppointmentRead(BaseModel):
    appointment_id: int
    patient_id: int
    patient_name: str
    appointment_date: date
    start_time: time
    end_time: time
    status: str
    reason: str | None
    has_visit: bool


class DoctorAppointmentListResponse(BaseModel):
    items: list[DoctorAppointmentRead]
    total: int


class VisitUpsert(BaseModel):
    complaints: str | None = Field(default=None, max_length=5000)
    examination_notes: str | None = Field(default=None, max_length=5000)
    diagnosis_summary: str | None = Field(default=None, max_length=5000)
    treatment_plan: str | None = Field(default=None, max_length=5000)
    sick_leave_opened: bool = False
    medications: list[VisitMedicationInput] = Field(default_factory=list)
    procedures: list[VisitProcedureInput] = Field(default_factory=list)


class VisitMedicationRead(BaseModel):
    id: int
    medication_name: str
    dosage: str | None
    instructions: str | None


class VisitProcedureRead(BaseModel):
    id: int
    procedure_name: str
    notes: str | None
    is_completed: bool


class VisitDetailsRead(BaseModel):
    appointment_id: int
    patient_id: int
    patient_name: str
    doctor_id: int
    doctor_name: str
    appointment_date: date
    start_time: time
    end_time: time
    status: str
    reason: str | None
    visit_id: int | None
    complaints: str | None
    examination_notes: str | None
    diagnosis_summary: str | None
    treatment_plan: str | None
    sick_leave_opened: bool
    medications: list[VisitMedicationRead]
    procedures: list[VisitProcedureRead]
    created_at: datetime | None
    updated_at: datetime | None

from pydantic import BaseModel


class ReportOverviewRead(BaseModel):
    total_patients: int
    total_doctors: int
    total_appointments: int
    scheduled_appointments: int
    completed_appointments: int
    total_visits: int
    total_medications: int
    total_procedures: int
    completed_procedures: int


class DoctorReportItemRead(BaseModel):
    doctor_id: int
    doctor_name: str
    position_name: str | None
    total_appointments: int
    scheduled_appointments: int
    completed_appointments: int


class PatientReportItemRead(BaseModel):
    patient_id: int
    patient_name: str
    total_appointments: int
    completed_appointments: int


class MedicationReportItemRead(BaseModel):
    medication_name: str
    total_prescriptions: int


class ProcedureReportItemRead(BaseModel):
    procedure_name: str
    total_assigned: int
    total_completed: int


class ReportsSummaryRead(BaseModel):
    overview: ReportOverviewRead
    doctor_stats: list[DoctorReportItemRead]
    patient_stats: list[PatientReportItemRead]
    medication_stats: list[MedicationReportItemRead]
    procedure_stats: list[ProcedureReportItemRead]

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.models.appointment import Appointment, AppointmentStatus
from app.models.employee import Employee
from app.models.patient import Patient
from app.models.position import Position
from app.models.visit import Visit
from app.models.visit_medication import VisitMedication
from app.models.visit_procedure import VisitProcedure


class ReportService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def build_summary(self) -> dict:
        overview = self._build_overview()
        doctor_stats = self._build_doctor_stats()
        patient_stats = self._build_patient_stats()
        medication_stats = self._build_medication_stats()
        procedure_stats = self._build_procedure_stats()

        return {
            "overview": overview,
            "doctor_stats": doctor_stats,
            "patient_stats": patient_stats,
            "medication_stats": medication_stats,
            "procedure_stats": procedure_stats,
        }

    def _build_overview(self) -> dict:
        total_patients = self.db.scalar(select(func.count()).select_from(Patient)) or 0
        total_doctors = self.db.scalar(
            select(func.count()).select_from(Employee).where(Employee.is_doctor.is_(True))
        ) or 0
        total_appointments = self.db.scalar(select(func.count()).select_from(Appointment)) or 0
        scheduled_appointments = self.db.scalar(
            select(func.count())
            .select_from(Appointment)
            .where(Appointment.status == AppointmentStatus.scheduled)
        ) or 0
        completed_appointments = self.db.scalar(
            select(func.count())
            .select_from(Appointment)
            .where(Appointment.status == AppointmentStatus.completed)
        ) or 0
        total_visits = self.db.scalar(select(func.count()).select_from(Visit)) or 0
        total_medications = self.db.scalar(select(func.count()).select_from(VisitMedication)) or 0
        total_procedures = self.db.scalar(select(func.count()).select_from(VisitProcedure)) or 0
        completed_procedures = self.db.scalar(
            select(func.count())
            .select_from(VisitProcedure)
            .where(VisitProcedure.is_completed.is_(True))
        ) or 0

        return {
            "total_patients": total_patients,
            "total_doctors": total_doctors,
            "total_appointments": total_appointments,
            "scheduled_appointments": scheduled_appointments,
            "completed_appointments": completed_appointments,
            "total_visits": total_visits,
            "total_medications": total_medications,
            "total_procedures": total_procedures,
            "completed_procedures": completed_procedures,
        }

    def _build_doctor_stats(self) -> list[dict]:
        query = (
            select(
                Employee.id.label("doctor_id"),
                Employee.first_name,
                Employee.last_name,
                Employee.middle_name,
                Position.name.label("position_name"),
                func.count(Appointment.id).label("total_appointments"),
                func.coalesce(
                    func.sum(
                        case((Appointment.status == AppointmentStatus.scheduled, 1), else_=0)
                    ),
                    0,
                ).label("scheduled_appointments"),
                func.coalesce(
                    func.sum(
                        case((Appointment.status == AppointmentStatus.completed, 1), else_=0)
                    ),
                    0,
                ).label("completed_appointments"),
            )
            .select_from(Employee)
            .join(Position, Position.id == Employee.position_id, isouter=True)
            .join(Appointment, Appointment.doctor_id == Employee.id, isouter=True)
            .where(Employee.is_doctor.is_(True))
            .group_by(Employee.id, Employee.first_name, Employee.last_name, Employee.middle_name, Position.name)
            .order_by(func.count(Appointment.id).desc(), Employee.last_name.asc(), Employee.first_name.asc())
        )
        rows = self.db.execute(query).all()

        return [
            {
                "doctor_id": row.doctor_id,
                "doctor_name": self._build_full_name(row.last_name, row.first_name, row.middle_name),
                "position_name": row.position_name,
                "total_appointments": int(row.total_appointments or 0),
                "scheduled_appointments": int(row.scheduled_appointments or 0),
                "completed_appointments": int(row.completed_appointments or 0),
            }
            for row in rows
        ]

    def _build_patient_stats(self) -> list[dict]:
        query = (
            select(
                Patient.id.label("patient_id"),
                Patient.first_name,
                Patient.last_name,
                Patient.middle_name,
                func.count(Appointment.id).label("total_appointments"),
                func.coalesce(
                    func.sum(
                        case((Appointment.status == AppointmentStatus.completed, 1), else_=0)
                    ),
                    0,
                ).label("completed_appointments"),
            )
            .select_from(Patient)
            .join(Appointment, Appointment.patient_id == Patient.id, isouter=True)
            .group_by(Patient.id, Patient.first_name, Patient.last_name, Patient.middle_name)
            .order_by(func.count(Appointment.id).desc(), Patient.last_name.asc(), Patient.first_name.asc())
            .limit(10)
        )
        rows = self.db.execute(query).all()

        return [
            {
                "patient_id": row.patient_id,
                "patient_name": self._build_full_name(row.last_name, row.first_name, row.middle_name),
                "total_appointments": int(row.total_appointments or 0),
                "completed_appointments": int(row.completed_appointments or 0),
            }
            for row in rows
        ]

    def _build_medication_stats(self) -> list[dict]:
        query = (
            select(
                VisitMedication.medication_name,
                func.count(VisitMedication.id).label("total_prescriptions"),
            )
            .group_by(VisitMedication.medication_name)
            .order_by(func.count(VisitMedication.id).desc(), VisitMedication.medication_name.asc())
            .limit(10)
        )
        rows = self.db.execute(query).all()

        return [
            {
                "medication_name": row.medication_name,
                "total_prescriptions": int(row.total_prescriptions or 0),
            }
            for row in rows
        ]

    def _build_procedure_stats(self) -> list[dict]:
        query = (
            select(
                VisitProcedure.procedure_name,
                func.count(VisitProcedure.id).label("total_assigned"),
                func.coalesce(
                    func.sum(case((VisitProcedure.is_completed.is_(True), 1), else_=0)),
                    0,
                ).label("total_completed"),
            )
            .group_by(VisitProcedure.procedure_name)
            .order_by(func.count(VisitProcedure.id).desc(), VisitProcedure.procedure_name.asc())
            .limit(10)
        )
        rows = self.db.execute(query).all()

        return [
            {
                "procedure_name": row.procedure_name,
                "total_assigned": int(row.total_assigned or 0),
                "total_completed": int(row.total_completed or 0),
            }
            for row in rows
        ]

    @staticmethod
    def _build_full_name(last_name: str | None, first_name: str | None, middle_name: str | None) -> str:
        return " ".join(part for part in [last_name, first_name, middle_name] if part)

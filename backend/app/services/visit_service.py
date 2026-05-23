from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.appointment import Appointment, AppointmentStatus
from app.models.employee import Employee
from app.models.visit import Visit
from app.models.visit_medication import VisitMedication
from app.models.visit_procedure import VisitProcedure
from app.schemas.visit import VisitUpsert


class VisitValidationError(Exception):
    def __init__(self, detail: str) -> None:
        super().__init__(detail)
        self.detail = detail


class VisitService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_doctor_appointments(self, doctor_id: int) -> list[Appointment]:
        doctor = self.db.scalar(
            select(Employee).where(Employee.id == doctor_id, Employee.is_doctor.is_(True))
        )
        if doctor is None:
            raise VisitValidationError("Врач не найден.")

        query = (
            select(Appointment)
            .where(
                Appointment.doctor_id == doctor_id,
                Appointment.status != AppointmentStatus.cancelled,
            )
            .options(
                selectinload(Appointment.patient),
                selectinload(Appointment.visit),
            )
            .order_by(Appointment.appointment_date.desc(), Appointment.start_time.desc())
        )
        return self.db.scalars(query).all()

    def get_appointment_with_visit(self, appointment_id: int) -> Appointment | None:
        query = (
            select(Appointment)
            .where(Appointment.id == appointment_id)
            .options(
                selectinload(Appointment.patient),
                selectinload(Appointment.doctor),
                selectinload(Appointment.visit),
                selectinload(Appointment.visit).selectinload(Visit.medications),
                selectinload(Appointment.visit).selectinload(Visit.procedures),
            )
        )
        return self.db.scalar(query)

    def complete_visit(self, appointment_id: int, payload: VisitUpsert) -> Appointment:
        appointment = self.get_appointment_with_visit(appointment_id)
        if appointment is None:
            raise VisitValidationError("Запись на прием не найдена.")
        if appointment.status == AppointmentStatus.cancelled:
            raise VisitValidationError("Нельзя проводить отмененный прием.")

        visit = appointment.visit
        if visit is None:
            visit = Visit(appointment_id=appointment.id)
            self.db.add(visit)

        visit.complaints = payload.complaints
        visit.examination_notes = payload.examination_notes
        visit.diagnosis_summary = payload.diagnosis_summary
        visit.treatment_plan = payload.treatment_plan
        visit.sick_leave_opened = payload.sick_leave_opened
        visit.medications.clear()
        visit.procedures.clear()

        for medication in payload.medications:
            visit.medications.append(
                VisitMedication(
                    medication_name=medication.medication_name,
                    dosage=medication.dosage,
                    instructions=medication.instructions,
                )
            )

        for procedure in payload.procedures:
            visit.procedures.append(
                VisitProcedure(
                    procedure_name=procedure.procedure_name,
                    notes=procedure.notes,
                    is_completed=procedure.is_completed,
                )
            )

        appointment.status = AppointmentStatus.completed

        self.db.add(appointment)
        self.db.add(visit)
        self.db.commit()

        refreshed = self.get_appointment_with_visit(appointment_id)
        if refreshed is None:
            raise VisitValidationError("Не удалось загрузить завершенный прием.")
        return refreshed

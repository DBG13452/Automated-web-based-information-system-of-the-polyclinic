from datetime import datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.appointment import Appointment, AppointmentStatus
from app.models.doctor_schedule import DoctorSchedule
from app.models.employee import Employee
from app.models.patient import Patient
from app.schemas.appointment import AppointmentCreate


class AppointmentValidationError(Exception):
    def __init__(self, detail: str) -> None:
        super().__init__(detail)
        self.detail = detail


class AppointmentService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_appointments(self) -> tuple[list[Appointment], int]:
        query = (
            select(Appointment)
            .options(
                selectinload(Appointment.patient),
                selectinload(Appointment.doctor),
            )
            .order_by(Appointment.appointment_date.desc(), Appointment.start_time.desc())
        )
        items = self.db.scalars(query).all()
        total = self.db.scalar(select(func.count()).select_from(Appointment)) or 0
        return items, total

    def get_available_slots(self, doctor_id: int, work_date) -> list[dict]:
        doctor = self.db.scalar(
            select(Employee).where(Employee.id == doctor_id, Employee.is_doctor.is_(True))
        )
        if doctor is None:
            raise AppointmentValidationError("Врач не найден.")

        schedules = self.db.scalars(
            select(DoctorSchedule)
            .where(
                DoctorSchedule.doctor_id == doctor_id,
                DoctorSchedule.work_date == work_date,
            )
            .order_by(DoctorSchedule.start_time.asc())
        ).all()
        if not schedules:
            return []

        occupied = {
            appointment.start_time
            for appointment in self.db.scalars(
                select(Appointment).where(
                    Appointment.doctor_id == doctor_id,
                    Appointment.appointment_date == work_date,
                    Appointment.status != AppointmentStatus.cancelled,
                )
            ).all()
        }

        slots: list[dict] = []
        for schedule in schedules:
            cursor = datetime.combine(schedule.work_date, schedule.start_time)
            finish = datetime.combine(schedule.work_date, schedule.end_time)
            duration = timedelta(minutes=schedule.slot_duration_minutes)

            while cursor + duration <= finish:
                slot_start = cursor.time()
                slot_end = (cursor + duration).time()
                if slot_start not in occupied:
                    slots.append(
                        {
                            "start_time": slot_start,
                            "end_time": slot_end,
                            "duration_minutes": schedule.slot_duration_minutes,
                        }
                    )
                cursor += duration

        return slots

    def create_appointment(self, payload: AppointmentCreate) -> Appointment:
        patient = self.db.get(Patient, payload.patient_id)
        if patient is None:
            raise AppointmentValidationError("Пациент не найден.")

        doctor = self.db.scalar(
            select(Employee).where(
                Employee.id == payload.doctor_id,
                Employee.is_doctor.is_(True),
            )
        )
        if doctor is None:
            raise AppointmentValidationError("Врач не найден.")

        slots = self.get_available_slots(payload.doctor_id, payload.appointment_date)
        matching_slot = next(
            (slot for slot in slots if slot["start_time"] == payload.start_time),
            None,
        )
        if matching_slot is None:
            raise AppointmentValidationError("Выбранное время уже занято или отсутствует в расписании.")

        appointment = Appointment(
            patient_id=payload.patient_id,
            doctor_id=payload.doctor_id,
            appointment_date=payload.appointment_date,
            start_time=payload.start_time,
            end_time=matching_slot["end_time"],
            status=AppointmentStatus.scheduled,
            reason=payload.reason,
        )
        self.db.add(appointment)
        self.db.commit()
        self.db.refresh(appointment)
        return appointment

from datetime import date, time
from enum import Enum

from sqlalchemy import Enum as SqlEnum
from sqlalchemy import ForeignKey, String, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin


class AppointmentStatus(str, Enum):
    scheduled = "scheduled"
    completed = "completed"
    cancelled = "cancelled"


class Appointment(TimestampMixin, Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), nullable=False)
    doctor_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), nullable=False)
    appointment_date: Mapped[date]
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    status: Mapped[AppointmentStatus] = mapped_column(
        SqlEnum(AppointmentStatus),
        default=AppointmentStatus.scheduled,
        nullable=False,
    )
    reason: Mapped[str | None] = mapped_column(String(255))

    patient: Mapped["Patient"] = relationship(back_populates="appointments")
    doctor: Mapped["Employee"] = relationship(back_populates="appointments")
    visit: Mapped["Visit | None"] = relationship(back_populates="appointment", uselist=False)


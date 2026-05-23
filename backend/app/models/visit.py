from sqlalchemy import Boolean, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin


class Visit(TimestampMixin, Base):
    __tablename__ = "visits"

    id: Mapped[int] = mapped_column(primary_key=True)
    appointment_id: Mapped[int] = mapped_column(
        ForeignKey("appointments.id"),
        unique=True,
        nullable=False,
    )
    complaints: Mapped[str | None] = mapped_column(Text)
    examination_notes: Mapped[str | None] = mapped_column(Text)
    diagnosis_summary: Mapped[str | None] = mapped_column(Text)
    treatment_plan: Mapped[str | None] = mapped_column(Text)
    sick_leave_opened: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    appointment: Mapped["Appointment"] = relationship(back_populates="visit")
    medications: Mapped[list["VisitMedication"]] = relationship(
        back_populates="visit",
        cascade="all, delete-orphan",
    )
    procedures: Mapped[list["VisitProcedure"]] = relationship(
        back_populates="visit",
        cascade="all, delete-orphan",
    )

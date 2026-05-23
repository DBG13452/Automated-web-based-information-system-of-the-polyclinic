from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin


class Employee(TimestampMixin, Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    middle_name: Mapped[str | None] = mapped_column(String(100))
    phone: Mapped[str | None] = mapped_column(String(20))
    is_doctor: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    position_id: Mapped[int | None] = mapped_column(ForeignKey("positions.id"))

    position: Mapped["Position | None"] = relationship(back_populates="employees")
    user: Mapped["User | None"] = relationship(back_populates="employee", uselist=False)
    schedules: Mapped[list["DoctorSchedule"]] = relationship(back_populates="doctor")
    appointments: Mapped[list["Appointment"]] = relationship(back_populates="doctor")


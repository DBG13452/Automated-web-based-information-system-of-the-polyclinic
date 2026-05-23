from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin


class VisitMedication(TimestampMixin, Base):
    __tablename__ = "visit_medications"

    id: Mapped[int] = mapped_column(primary_key=True)
    visit_id: Mapped[int] = mapped_column(ForeignKey("visits.id"), nullable=False)
    medication_name: Mapped[str] = mapped_column(String(255), nullable=False)
    dosage: Mapped[str | None] = mapped_column(String(255))
    instructions: Mapped[str | None] = mapped_column(Text)

    visit: Mapped["Visit"] = relationship(back_populates="medications")

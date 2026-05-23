from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.models.doctor_schedule import DoctorSchedule
from app.models.employee import Employee
from app.models.position import Position
from app.schemas.doctor import DoctorCreate, DoctorScheduleCreate, DoctorUpdate


class DoctorService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_doctors(self, search: str | None = None) -> tuple[list[Employee], int]:
        query = (
            select(Employee)
            .where(Employee.is_doctor.is_(True))
            .options(selectinload(Employee.position))
            .order_by(Employee.last_name.asc(), Employee.first_name.asc())
        )
        count_query = select(func.count()).select_from(Employee).where(Employee.is_doctor.is_(True))

        if search:
            term = f"%{search.strip()}%"
            criteria = or_(
                Employee.first_name.ilike(term),
                Employee.last_name.ilike(term),
                Employee.middle_name.ilike(term),
                Employee.phone.ilike(term),
                Position.name.ilike(term),
            )
            query = query.join(Position, isouter=True).where(criteria)
            count_query = count_query.join(Position, isouter=True).where(criteria)

        items = self.db.scalars(query).all()
        total = self.db.scalar(count_query) or 0
        return items, total

    def get_doctor(self, doctor_id: int) -> Employee | None:
        query = (
            select(Employee)
            .where(Employee.id == doctor_id, Employee.is_doctor.is_(True))
            .options(
                selectinload(Employee.position),
                selectinload(Employee.schedules),
            )
        )
        return self.db.scalar(query)

    def create_doctor(self, payload: DoctorCreate) -> Employee:
        position = self._get_or_create_position(payload.position_name)
        doctor = Employee(
            first_name=payload.first_name,
            last_name=payload.last_name,
            middle_name=payload.middle_name,
            phone=payload.phone,
            is_doctor=True,
            position=position,
        )
        self.db.add(doctor)
        self.db.commit()
        self.db.refresh(doctor)
        return doctor

    def update_doctor(self, doctor: Employee, payload: DoctorUpdate) -> Employee:
        data = payload.model_dump(exclude_unset=True)
        position_name = data.pop("position_name", None)
        if position_name:
            doctor.position = self._get_or_create_position(position_name)

        for field, value in data.items():
            setattr(doctor, field, value)

        self.db.add(doctor)
        self.db.commit()
        self.db.refresh(doctor)
        return doctor

    def add_schedule(self, doctor: Employee, payload: DoctorScheduleCreate) -> DoctorSchedule:
        schedule = DoctorSchedule(
            doctor_id=doctor.id,
            work_date=payload.work_date,
            start_time=payload.start_time,
            end_time=payload.end_time,
            slot_duration_minutes=payload.slot_duration_minutes,
        )
        self.db.add(schedule)
        self.db.commit()
        self.db.refresh(schedule)
        return schedule

    def _get_or_create_position(self, position_name: str) -> Position:
        normalized = position_name.strip()
        existing = self.db.scalar(
            select(Position).where(func.lower(Position.name) == normalized.lower())
        )
        if existing:
            return existing

        position = Position(name=normalized)
        self.db.add(position)
        self.db.flush()
        return position

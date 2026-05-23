from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps.auth import require_roles
from app.db.session import get_db
from app.schemas.appointment import AvailableSlotRead
from app.schemas.doctor import (
    DoctorCreate,
    DoctorDetailsRead,
    DoctorListResponse,
    DoctorRead,
    DoctorScheduleCreate,
    DoctorScheduleRead,
    DoctorUpdate,
)
from app.services.appointment_service import (
    AppointmentService,
    AppointmentValidationError,
)
from app.services.doctor_service import DoctorService

router = APIRouter()


def serialize_doctor(doctor) -> DoctorRead:
    return DoctorRead(
        id=doctor.id,
        first_name=doctor.first_name,
        last_name=doctor.last_name,
        middle_name=doctor.middle_name,
        phone=doctor.phone,
        position_name=doctor.position.name if doctor.position else None,
        created_at=doctor.created_at,
        updated_at=doctor.updated_at,
    )


def serialize_doctor_details(doctor) -> DoctorDetailsRead:
    return DoctorDetailsRead(
        **serialize_doctor(doctor).model_dump(),
        schedules=[
            DoctorScheduleRead.model_validate(schedule)
            for schedule in sorted(
                doctor.schedules,
                key=lambda item: (item.work_date, item.start_time),
            )
        ],
    )


@router.get("", response_model=DoctorListResponse)
def list_doctors(
    search: str | None = Query(default=None, min_length=1, max_length=100),
    _current_user=Depends(require_roles("admin", "registrar", "doctor")),
    db: Session = Depends(get_db),
) -> DoctorListResponse:
    service = DoctorService(db)
    items, total = service.list_doctors(search=search)
    return DoctorListResponse(items=[serialize_doctor(item) for item in items], total=total)


@router.get("/{doctor_id}/available-slots", response_model=list[AvailableSlotRead])
def get_available_slots(
    doctor_id: int,
    work_date: date = Query(...),
    _current_user=Depends(require_roles("admin", "registrar", "doctor")),
    db: Session = Depends(get_db),
) -> list[AvailableSlotRead]:
    service = AppointmentService(db)
    try:
        slots = service.get_available_slots(doctor_id, work_date)
    except AppointmentValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=exc.detail) from exc
    return [AvailableSlotRead(**slot) for slot in slots]


@router.post("", response_model=DoctorRead, status_code=status.HTTP_201_CREATED)
def create_doctor(
    payload: DoctorCreate,
    _current_user=Depends(require_roles("admin")),
    db: Session = Depends(get_db),
) -> DoctorRead:
    service = DoctorService(db)
    doctor = service.create_doctor(payload)
    return serialize_doctor(doctor)


@router.get("/{doctor_id}", response_model=DoctorDetailsRead)
def get_doctor(
    doctor_id: int,
    _current_user=Depends(require_roles("admin", "registrar", "doctor")),
    db: Session = Depends(get_db),
) -> DoctorDetailsRead:
    service = DoctorService(db)
    doctor = service.get_doctor(doctor_id)
    if doctor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    return serialize_doctor_details(doctor)


@router.patch("/{doctor_id}", response_model=DoctorRead)
def update_doctor(
    doctor_id: int,
    payload: DoctorUpdate,
    _current_user=Depends(require_roles("admin")),
    db: Session = Depends(get_db),
) -> DoctorRead:
    service = DoctorService(db)
    doctor = service.get_doctor(doctor_id)
    if doctor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    updated = service.update_doctor(doctor, payload)
    return serialize_doctor(updated)


@router.post(
    "/{doctor_id}/schedules",
    response_model=DoctorScheduleRead,
    status_code=status.HTTP_201_CREATED,
)
def create_schedule(
    doctor_id: int,
    payload: DoctorScheduleCreate,
    _current_user=Depends(require_roles("admin")),
    db: Session = Depends(get_db),
) -> DoctorScheduleRead:
    service = DoctorService(db)
    doctor = service.get_doctor(doctor_id)
    if doctor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    schedule = service.add_schedule(doctor, payload)
    return DoctorScheduleRead.model_validate(schedule)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps.auth import require_roles
from app.db.session import get_db
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentListResponse,
    AppointmentRead,
)
from app.services.appointment_service import (
    AppointmentService,
    AppointmentValidationError,
)

router = APIRouter()


def build_person_name(entity) -> str:
    parts = [entity.last_name, entity.first_name, entity.middle_name]
    return " ".join(part for part in parts if part)


def serialize_appointment(appointment) -> AppointmentRead:
    return AppointmentRead(
        id=appointment.id,
        patient_id=appointment.patient_id,
        patient_name=build_person_name(appointment.patient),
        doctor_id=appointment.doctor_id,
        doctor_name=build_person_name(appointment.doctor),
        appointment_date=appointment.appointment_date,
        start_time=appointment.start_time,
        end_time=appointment.end_time,
        status=appointment.status.value,
        reason=appointment.reason,
        created_at=appointment.created_at,
    )


@router.get("", response_model=AppointmentListResponse)
def list_appointments(
    _current_user=Depends(require_roles("admin", "registrar")),
    db: Session = Depends(get_db),
) -> AppointmentListResponse:
    service = AppointmentService(db)
    items, total = service.list_appointments()
    return AppointmentListResponse(
        items=[serialize_appointment(item) for item in items],
        total=total,
    )


@router.post("", response_model=AppointmentRead, status_code=status.HTTP_201_CREATED)
def create_appointment(
    payload: AppointmentCreate,
    _current_user=Depends(require_roles("admin", "registrar")),
    db: Session = Depends(get_db),
) -> AppointmentRead:
    service = AppointmentService(db)
    try:
        appointment = service.create_appointment(payload)
    except AppointmentValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=exc.detail) from exc

    appointment = service.db.scalar(select_appointment_with_relations(appointment.id))
    return serialize_appointment(appointment)


def select_appointment_with_relations(appointment_id: int):
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload

    from app.models.appointment import Appointment

    return (
        select(Appointment)
        .where(Appointment.id == appointment_id)
        .options(
            selectinload(Appointment.patient),
            selectinload(Appointment.doctor),
        )
    )

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps.auth import require_roles
from app.db.session import get_db
from app.models.user import User
from app.schemas.visit import (
    DoctorAppointmentListResponse,
    DoctorAppointmentRead,
    VisitDetailsRead,
    VisitMedicationRead,
    VisitProcedureRead,
    VisitUpsert,
)
from app.services.visit_service import VisitService, VisitValidationError

router = APIRouter()


def build_person_name(entity) -> str:
    parts = [entity.last_name, entity.first_name, entity.middle_name]
    return " ".join(part for part in parts if part)


def serialize_doctor_appointment(appointment) -> DoctorAppointmentRead:
    return DoctorAppointmentRead(
        appointment_id=appointment.id,
        patient_id=appointment.patient_id,
        patient_name=build_person_name(appointment.patient),
        appointment_date=appointment.appointment_date,
        start_time=appointment.start_time,
        end_time=appointment.end_time,
        status=appointment.status.value,
        reason=appointment.reason,
        has_visit=appointment.visit is not None,
    )


def serialize_visit_details(appointment) -> VisitDetailsRead:
    visit = appointment.visit
    return VisitDetailsRead(
        appointment_id=appointment.id,
        patient_id=appointment.patient_id,
        patient_name=build_person_name(appointment.patient),
        doctor_id=appointment.doctor_id,
        doctor_name=build_person_name(appointment.doctor),
        appointment_date=appointment.appointment_date,
        start_time=appointment.start_time,
        end_time=appointment.end_time,
        status=appointment.status.value,
        reason=appointment.reason,
        visit_id=visit.id if visit else None,
        complaints=visit.complaints if visit else None,
        examination_notes=visit.examination_notes if visit else None,
        diagnosis_summary=visit.diagnosis_summary if visit else None,
        treatment_plan=visit.treatment_plan if visit else None,
        sick_leave_opened=visit.sick_leave_opened if visit else False,
        medications=[
            VisitMedicationRead(
                id=item.id,
                medication_name=item.medication_name,
                dosage=item.dosage,
                instructions=item.instructions,
            )
            for item in (visit.medications if visit else [])
        ],
        procedures=[
            VisitProcedureRead(
                id=item.id,
                procedure_name=item.procedure_name,
                notes=item.notes,
                is_completed=item.is_completed,
            )
            for item in (visit.procedures if visit else [])
        ],
        created_at=visit.created_at if visit else None,
        updated_at=visit.updated_at if visit else None,
    )


@router.get("/appointments", response_model=DoctorAppointmentListResponse)
def list_doctor_appointments(
    doctor_id: int | None = Query(default=None),
    current_user: User = Depends(require_roles("admin", "doctor")),
    db: Session = Depends(get_db),
) -> DoctorAppointmentListResponse:
    service = VisitService(db)
    effective_doctor_id = doctor_id

    if current_user.role.name == "doctor":
        if current_user.employee_id is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="У врача нет привязанной карточки сотрудника.",
            )
        if doctor_id is not None and doctor_id != current_user.employee_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Можно просматривать только свои приемы.",
            )
        effective_doctor_id = current_user.employee_id

    if effective_doctor_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Не указан врач для загрузки приемов.",
        )

    try:
        items = service.list_doctor_appointments(effective_doctor_id)
    except VisitValidationError as exc:
        raise HTTPException(status_code=400, detail=exc.detail) from exc

    return DoctorAppointmentListResponse(
        items=[serialize_doctor_appointment(item) for item in items],
        total=len(items),
    )


@router.get("/appointment/{appointment_id}", response_model=VisitDetailsRead)
def get_visit_details(
    appointment_id: int,
    current_user: User = Depends(require_roles("admin", "doctor")),
    db: Session = Depends(get_db),
) -> VisitDetailsRead:
    service = VisitService(db)
    appointment = service.get_appointment_with_visit(appointment_id)
    if appointment is None:
        raise HTTPException(status_code=404, detail="Запись на прием не найдена.")
    if current_user.role.name == "doctor" and appointment.doctor_id != current_user.employee_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Можно просматривать только свои приемы.",
        )
    return serialize_visit_details(appointment)


@router.put("/appointment/{appointment_id}", response_model=VisitDetailsRead)
def complete_visit(
    appointment_id: int,
    payload: VisitUpsert,
    current_user: User = Depends(require_roles("admin", "doctor")),
    db: Session = Depends(get_db),
) -> VisitDetailsRead:
    service = VisitService(db)
    appointment = service.get_appointment_with_visit(appointment_id)
    if appointment is None:
        raise HTTPException(status_code=404, detail="Запись на прием не найдена.")
    if current_user.role.name == "doctor" and appointment.doctor_id != current_user.employee_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Можно завершать только свои приемы.",
        )

    try:
        appointment = service.complete_visit(appointment_id, payload)
    except VisitValidationError as exc:
        raise HTTPException(status_code=400, detail=exc.detail) from exc
    return serialize_visit_details(appointment)

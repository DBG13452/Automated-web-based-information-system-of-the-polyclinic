from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps.auth import require_roles
from app.db.session import get_db
from app.schemas.patient import (
    PatientCreate,
    PatientListResponse,
    PatientRead,
    PatientUpdate,
)
from app.services.patient_service import PatientConflictError, PatientService

router = APIRouter()


@router.get("", response_model=PatientListResponse)
def list_patients(
    search: str | None = Query(default=None, min_length=1, max_length=100),
    _current_user=Depends(require_roles("admin", "registrar")),
    db: Session = Depends(get_db),
) -> PatientListResponse:
    service = PatientService(db)
    items, total = service.list_patients(search=search)
    return PatientListResponse(items=items, total=total)


@router.post("", response_model=PatientRead, status_code=status.HTTP_201_CREATED)
def create_patient(
    payload: PatientCreate,
    _current_user=Depends(require_roles("admin", "registrar")),
    db: Session = Depends(get_db),
) -> PatientRead:
    service = PatientService(db)
    try:
        patient = service.create_patient(payload)
    except PatientConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=exc.detail) from exc
    return PatientRead.model_validate(patient)


@router.get("/{patient_id}", response_model=PatientRead)
def get_patient(
    patient_id: int,
    _current_user=Depends(require_roles("admin", "registrar")),
    db: Session = Depends(get_db),
) -> PatientRead:
    service = PatientService(db)
    patient = service.get_patient(patient_id)
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return PatientRead.model_validate(patient)


@router.patch("/{patient_id}", response_model=PatientRead)
def update_patient(
    patient_id: int,
    payload: PatientUpdate,
    _current_user=Depends(require_roles("admin", "registrar")),
    db: Session = Depends(get_db),
) -> PatientRead:
    service = PatientService(db)
    patient = service.get_patient(patient_id)
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    try:
        updated = service.update_patient(patient, payload)
    except PatientConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=exc.detail) from exc
    return PatientRead.model_validate(updated)

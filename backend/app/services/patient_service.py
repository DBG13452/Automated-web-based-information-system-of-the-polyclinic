from sqlalchemy.exc import IntegrityError
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientUpdate


class PatientConflictError(Exception):
    def __init__(self, detail: str) -> None:
        super().__init__(detail)
        self.detail = detail


class PatientService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_patients(self, search: str | None = None) -> tuple[list[Patient], int]:
        query = select(Patient).order_by(Patient.created_at.desc())
        count_query = select(func.count()).select_from(Patient)

        if search:
            term = f"%{search.strip()}%"
            criteria = or_(
                Patient.first_name.ilike(term),
                Patient.last_name.ilike(term),
                Patient.middle_name.ilike(term),
                Patient.phone.ilike(term),
                Patient.policy_number.ilike(term),
                Patient.snils.ilike(term),
            )
            query = query.where(criteria)
            count_query = count_query.where(criteria)

        items = self.db.scalars(query).all()
        total = self.db.scalar(count_query) or 0
        return items, total

    def get_patient(self, patient_id: int) -> Patient | None:
        return self.db.get(Patient, patient_id)

    def create_patient(self, payload: PatientCreate) -> Patient:
        patient = Patient(**payload.model_dump())
        self.db.add(patient)
        self._commit_or_raise()
        self.db.refresh(patient)
        return patient

    def update_patient(self, patient: Patient, payload: PatientUpdate) -> Patient:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(patient, field, value)

        self.db.add(patient)
        self._commit_or_raise()
        self.db.refresh(patient)
        return patient

    def _commit_or_raise(self) -> None:
        try:
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            message = str(exc.orig)
            if "policy_number" in message:
                raise PatientConflictError("Пациент с таким номером полиса уже существует.") from exc
            if "snils" in message:
                raise PatientConflictError("Пациент с таким СНИЛС уже существует.") from exc
            raise PatientConflictError("Не удалось сохранить пациента из-за конфликта данных.") from exc

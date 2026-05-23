from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps.auth import require_roles
from app.db.session import get_db
from app.schemas.report import ReportsSummaryRead
from app.services.report_service import ReportService

router = APIRouter()


@router.get("/summary", response_model=ReportsSummaryRead)
def get_reports_summary(
    _current_user=Depends(require_roles("admin")),
    db: Session = Depends(get_db),
) -> ReportsSummaryRead:
    service = ReportService(db)
    summary = service.build_summary()
    return ReportsSummaryRead(**summary)

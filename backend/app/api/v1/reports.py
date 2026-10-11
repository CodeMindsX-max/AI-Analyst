from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.bi import Report
from app.schemas.bi import ReportCreate, ReportUpdate, ReportResponse
from app.services.report_service import report_service
from app.services.export_service import export_service
from app.services.audit_service import audit_service

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("", response_model=List[ReportResponse])
def list_reports(db: Session = Depends(get_db)):
    """List all executive reports."""
    reports = db.query(Report).order_by(Report.updated_at.desc()).all()
    return [report_service._to_response(r) for r in reports]


@router.post("", response_model=ReportResponse)
def create_report(data: ReportCreate, db: Session = Depends(get_db)):
    """Create a new business report with structured sections."""
    rep = report_service.create_report(db, data, owner="demo@analystai.local")
    audit_service.log_event(
        db,
        action="report.create",
        resource_type="report",
        resource_id=rep.id,
        detail={"title": rep.title},
    )
    return rep


@router.get("/{report_id}", response_model=ReportResponse)
def get_report(report_id: str, db: Session = Depends(get_db)):
    """Retrieve full report content and sections."""
    return report_service.get_report(db, report_id)


@router.patch("/{report_id}", response_model=ReportResponse)
def update_report(report_id: str, data: ReportUpdate, db: Session = Depends(get_db)):
    """Update executive report details or section copy."""
    return report_service.update_report(db, report_id, data)


@router.delete("/{report_id}")
def delete_report(report_id: str, db: Session = Depends(get_db)):
    """Delete an executive report."""
    report_service.delete_report(db, report_id)
    return {"message": "Report deleted successfully."}


@router.post("/{report_id}/generate", response_model=ReportResponse)
def refresh_report_sections(report_id: str, db: Session = Depends(get_db)):
    """Re-run simulated AI report generation on current business data."""
    rep = report_service.get_report(db, report_id)
    new_sections = report_service.generate_ai_report_content(rep.title, rep.period)
    update_data = ReportUpdate(sections=new_sections)
    return report_service.update_report(db, report_id, update_data)


@router.get("/{report_id}/export")
def export_report(
    report_id: str,
    format: str = Query("json", description="Export format: json or csv"),
    db: Session = Depends(get_db),
):
    """Export report content to JSON or CSV."""
    rep = report_service.get_report(db, report_id)
    if format == "csv":
        rows = [
            {"section_order": s.order, "title": s.title, "type": s.section_type, "content": s.content}
            for s in rep.sections
        ]
        csv_str = export_service.to_csv(["section_order", "title", "type", "content"], rows)
        return Response(
            content=csv_str,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={rep.title.replace(' ', '_')}.csv"},
        )
    return rep.model_dump()

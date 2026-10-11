import json
import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.bi import Report
from app.schemas.bi import ReportCreate, ReportUpdate, ReportResponse, ReportSection
from app.core.exceptions import ResourceNotFoundException


class ReportService:
    """Service for creating, updating, and generating multi-section executive reports."""

    def generate_ai_report_content(self, title: str, period: str = "Q3 2026") -> List[ReportSection]:
        """Generate structured business report sections with simulated AI drafting."""
        return [
            ReportSection(
                id="sec-1",
                title="Executive Summary",
                section_type="executive_summary",
                content=(
                    f"Overall Q3 2026 performance demonstrated resilient top-line growth of +8.4% YoY ($2,485,600), "
                    "driven by North American Enterprise SaaS expansion. However, September encountered a -14.2% MoM contraction "
                    "primarily due to European procurement delays. Operating margins remain strong at 76.8%."
                ),
                order=1,
            ),
            ReportSection(
                id="sec-2",
                title="Key Findings & Variances",
                section_type="findings",
                content=(
                    "1. EMEA SaaS Bookings: Experienced a $36,400 contraction (-26.8%) in September.\n"
                    "2. Product Adoption: Analytics Add-on demonstrated +22.1% YoY volume expansion.\n"
                    "3. Customer Retention: High churn-risk enterprise accounts account for 14.2% of pipeline volume."
                ),
                order=2,
            ),
            ReportSection(
                id="sec-3",
                title="Strategic Recommendations",
                section_type="recommendations",
                content=(
                    "1. Implement mid-market contract discounting incentives for deferred EMEA pipeline.\n"
                    "2. Bundle Analytics Add-ons into upcoming Q4 renewal proposals.\n"
                    "3. Establish customer success check-ins for the 18 enterprise accounts flagged with elevated churn risk."
                ),
                order=3,
            ),
            ReportSection(
                id="sec-4",
                title="Data Lineage & Methodology",
                section_type="data_table",
                content=(
                    "Data sourced from demo sales_orders (1,420 records) and customer master tables. "
                    "Financial metrics validated against standard Business Glossary formulas. Analysis mode: Deterministic Demo."
                ),
                order=4,
            ),
        ]

    def create_report(self, db: Session, data: ReportCreate, owner: str = "Demo Admin") -> ReportResponse:
        sections = data.sections or self.generate_ai_report_content(data.title, data.period or "Q3 2026")
        sections_dict = [s.model_dump() for s in sections]

        report = Report(
            id=f"rep-{uuid.uuid4().hex[:10]}",
            workspace_id="default-ws",
            title=data.title,
            subtitle=data.subtitle or "AI-Generated Business Intelligence Briefing",
            report_type=data.report_type or "Executive Summary",
            audience=data.audience or "Leadership",
            period=data.period or "Q3 2026",
            status="published",
            owner=owner,
            sections_json=json.dumps(sections_dict),
        )
        db.add(report)
        db.commit()
        db.refresh(report)

        return self._to_response(report)

    def get_report(self, db: Session, report_id: str) -> ReportResponse:
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            raise ResourceNotFoundException("Report", report_id)
        return self._to_response(report)

    def update_report(self, db: Session, report_id: str, data: ReportUpdate) -> ReportResponse:
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            raise ResourceNotFoundException("Report", report_id)

        if data.title is not None:
            report.title = data.title
        if data.subtitle is not None:
            report.subtitle = data.subtitle
        if data.report_type is not None:
            report.report_type = data.report_type
        if data.audience is not None:
            report.audience = data.audience
        if data.period is not None:
            report.period = data.period
        if data.status is not None:
            report.status = data.status
        if data.sections is not None:
            report.sections_json = json.dumps([s.model_dump() for s in data.sections])

        db.commit()
        db.refresh(report)
        return self._to_response(report)

    def delete_report(self, db: Session, report_id: str) -> bool:
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            raise ResourceNotFoundException("Report", report_id)
        db.delete(report)
        db.commit()
        return True

    def _to_response(self, r: Report) -> ReportResponse:
        raw_sections = json.loads(r.sections_json) if r.sections_json else []
        sections = [ReportSection(**s) for s in raw_sections]
        return ReportResponse(
            id=r.id,
            title=r.title,
            subtitle=r.subtitle,
            report_type=r.report_type,
            audience=r.audience,
            period=r.period,
            status=r.status,
            owner=r.owner,
            sections=sections,
            created_at=r.created_at.isoformat(),
            updated_at=r.updated_at.isoformat(),
        )


report_service = ReportService()

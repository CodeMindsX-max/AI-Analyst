import json
import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.analyst import AgentRun, AgentRunEvent, SavedAnalysis
from app.schemas.analyst import (
    AnalystRunRequest,
    AgentRunResponse,
    AgentRunEventResponse,
    AnalystResult,
    PromptSuggestion,
    SaveAnalysisRequest,
    SavedAnalysisResponse,
)
from app.services.agent_orchestrator import agent_orchestrator
from app.core.exceptions import ResourceNotFoundException


class AnalystService:
    """High-level service coordinating analyst runs, history, and saved outputs."""

    def get_suggestions(self) -> List[PromptSuggestion]:
        return [
            PromptSuggestion(
                id="sug-1",
                category="Revenue Variance",
                question="Why did revenue decrease in September compared with August?",
                description="Root-cause breakdown of MoM revenue decline by region and category.",
                suggested_date_range="Aug 1, 2026 - Sep 30, 2026",
            ),
            PromptSuggestion(
                id="sug-2",
                category="Regional Performance",
                question="Compare regional sales performance and quota attainment across Q3.",
                description="Regional revenue benchmarking, quota gap analysis, and discount metrics.",
                suggested_date_range="Jul 1, 2026 - Sep 30, 2026",
            ),
            PromptSuggestion(
                id="sug-3",
                category="Product Growth",
                question="Which product categories are growing fastest in 2026?",
                description="Growth rate comparison, unit volumes, and profit margin analysis.",
                suggested_date_range="Jan 1, 2026 - Oct 11, 2026",
            ),
            PromptSuggestion(
                id="sug-4",
                category="Customer Segments",
                question="Which customer segments have the highest churn risk and declining spend?",
                description="Cross-tabulation of customer risk categories and sales trends.",
                suggested_date_range="Year-to-Date",
            ),
            PromptSuggestion(
                id="sug-5",
                category="Order Trends",
                question="Show monthly revenue and order trends with average order value.",
                description="Consolidated 2026 monthly run rates and order size distribution.",
                suggested_date_range="Year 2026",
            ),
        ]

    def create_run(self, db: Session, request: AnalystRunRequest, user_email: str = "demo@analystai.local") -> AgentRunResponse:
        run_record = agent_orchestrator.run_pipeline(db, request, user_email=user_email)
        return self.get_run_response(db, run_record.id)

    def get_run_response(self, db: Session, run_id: str) -> AgentRunResponse:
        run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
        if not run:
            raise ResourceNotFoundException("AgentRun", run_id)

        events_db = db.query(AgentRunEvent).filter(AgentRunEvent.run_id == run_id).order_by(AgentRunEvent.step_index.asc()).all()
        events_resp = [
            AgentRunEventResponse(
                id=e.id,
                run_id=e.run_id,
                step_index=e.step_index,
                step_name=e.step_name,
                status=e.status,
                description=e.description,
                tool_name=e.tool_name,
                details=json.loads(e.details_json) if e.details_json else {},
                duration_ms=e.duration_ms,
                created_at=e.created_at.isoformat(),
            )
            for e in events_db
        ]

        result_obj = None
        if run.result_json:
            result_obj = AnalystResult.model_validate_json(run.result_json)

        return AgentRunResponse(
            id=run.id,
            question=run.question,
            task_summary=run.task_summary,
            status=run.status,
            duration_ms=run.duration_ms,
            source_id=run.source_id,
            query_sql=run.query_sql,
            result=result_obj,
            events=events_resp,
            created_at=run.created_at.isoformat(),
        )

    def save_analysis(self, db: Session, data: SaveAnalysisRequest, user_email: str = "demo@analystai.local") -> SavedAnalysisResponse:
        run = db.query(AgentRun).filter(AgentRun.id == data.run_id).first()
        if not run:
            raise ResourceNotFoundException("AgentRun", data.run_id)

        saved = SavedAnalysis(
            id=f"sa-{uuid.uuid4().hex[:10]}",
            workspace_id=run.workspace_id,
            title=data.title,
            question=run.question,
            summary=run.task_summary or run.question,
            run_id=run.id,
            chart_config_json="{}",
            query_sql=run.query_sql,
            tags_json=json.dumps(data.tags),
            owner=user_email,
            is_pinned=data.is_pinned,
        )
        db.add(saved)
        db.commit()
        db.refresh(saved)

        return SavedAnalysisResponse(
            id=saved.id,
            title=saved.title,
            question=saved.question,
            summary=saved.summary,
            run_id=saved.run_id,
            query_sql=saved.query_sql,
            chart_config={},
            tags=json.loads(saved.tags_json),
            owner=saved.owner,
            is_pinned=saved.is_pinned,
            created_at=saved.created_at.isoformat(),
            updated_at=saved.updated_at.isoformat(),
        )

    def list_saved_analyses(self, db: Session) -> List[SavedAnalysisResponse]:
        items = db.query(SavedAnalysis).order_by(SavedAnalysis.created_at.desc()).all()
        return [
            SavedAnalysisResponse(
                id=s.id,
                title=s.title,
                question=s.question,
                summary=s.summary,
                run_id=s.run_id,
                query_sql=s.query_sql,
                chart_config=json.loads(s.chart_config_json) if s.chart_config_json else {},
                tags=json.loads(s.tags_json) if s.tags_json else [],
                owner=s.owner,
                is_pinned=s.is_pinned,
                created_at=s.created_at.isoformat(),
                updated_at=s.updated_at.isoformat(),
            )
            for s in items
        ]


analyst_service = AnalystService()

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.workspace import WorkspaceSetting
from app.schemas.operations import WorkspaceSettingResponse, WorkspaceSettingUpdate
from app.core.exceptions import ResourceNotFoundException
from app.services.audit_service import audit_service

router = APIRouter(prefix="/settings", tags=["Workspace Settings"])


@router.get("", response_model=WorkspaceSettingResponse)
def get_settings(db: Session = Depends(get_db)):
    """Retrieve workspace configuration, AI parameters, and execution limits."""
    ws_settings = db.query(WorkspaceSetting).filter(WorkspaceSetting.workspace_id == "default-ws").first()
    if not ws_settings:
        ws_settings = WorkspaceSetting(
            id="ws-set-default",
            workspace_id="default-ws",
            llm_provider="mock",
            embedding_provider="mock",
            response_style="analytical",
            max_output_tokens=2048,
            default_chart_type="bar",
            citation_preference="detailed",
            top_k=5,
            allowed_tools="schema,glossary,sql,analysis,chart,report",
            max_sql_rows=500,
        )
        db.add(ws_settings)
        db.commit()
        db.refresh(ws_settings)

    return WorkspaceSettingResponse(
        llm_provider=ws_settings.llm_provider,
        embedding_provider=ws_settings.embedding_provider,
        response_style=ws_settings.response_style,
        max_output_tokens=ws_settings.max_output_tokens,
        default_chart_type=ws_settings.default_chart_type,
        citation_preference=ws_settings.citation_preference,
        top_k=ws_settings.top_k,
        allowed_tools=ws_settings.allowed_tools,
        max_sql_rows=ws_settings.max_sql_rows,
    )


@router.patch("", response_model=WorkspaceSettingResponse)
def update_settings(data: WorkspaceSettingUpdate, db: Session = Depends(get_db)):
    """Update workspace parameters and AI settings."""
    ws_settings = db.query(WorkspaceSetting).filter(WorkspaceSetting.workspace_id == "default-ws").first()
    if not ws_settings:
        raise ResourceNotFoundException("WorkspaceSetting", "default-ws")

    if data.llm_provider is not None:
        ws_settings.llm_provider = data.llm_provider
    if data.embedding_provider is not None:
        ws_settings.embedding_provider = data.embedding_provider
    if data.response_style is not None:
        ws_settings.response_style = data.response_style
    if data.max_output_tokens is not None:
        ws_settings.max_output_tokens = data.max_output_tokens
    if data.default_chart_type is not None:
        ws_settings.default_chart_type = data.default_chart_type
    if data.citation_preference is not None:
        ws_settings.citation_preference = data.citation_preference
    if data.top_k is not None:
        ws_settings.top_k = data.top_k
    if data.allowed_tools is not None:
        ws_settings.allowed_tools = data.allowed_tools
    if data.max_sql_rows is not None:
        ws_settings.max_sql_rows = data.max_sql_rows

    db.commit()
    db.refresh(ws_settings)

    audit_service.log_event(
        db,
        action="settings.update",
        resource_type="workspace_setting",
        resource_id=ws_settings.id,
        detail={"llm_provider": ws_settings.llm_provider},
    )

    return WorkspaceSettingResponse(
        llm_provider=ws_settings.llm_provider,
        embedding_provider=ws_settings.embedding_provider,
        response_style=ws_settings.response_style,
        max_output_tokens=ws_settings.max_output_tokens,
        default_chart_type=ws_settings.default_chart_type,
        citation_preference=ws_settings.citation_preference,
        top_k=ws_settings.top_k,
        allowed_tools=ws_settings.allowed_tools,
        max_sql_rows=ws_settings.max_sql_rows,
    )

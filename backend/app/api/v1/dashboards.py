import json
import uuid
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.bi import Dashboard, DashboardWidget
from app.schemas.bi import DashboardCreate, DashboardUpdate, DashboardResponse, WidgetConfig
from app.core.exceptions import ResourceNotFoundException
from app.services.audit_service import audit_service

router = APIRouter(prefix="/dashboards", tags=["Dashboards"])


def _to_dashboard_response(db: Session, d: Dashboard) -> DashboardResponse:
    widgets_db = db.query(DashboardWidget).filter(DashboardWidget.dashboard_id == d.id).order_by(DashboardWidget.position_order.asc()).all()
    widget_configs = [
        WidgetConfig(
            id=w.id,
            title=w.title,
            widget_type=w.widget_type,
            chart_type=w.chart_type,
            metric=w.metric,
            dimension=w.dimension,
            config=json.loads(w.config_json) if w.config_json else {},
            position_order=w.position_order,
        )
        for w in widgets_db
    ]
    return DashboardResponse(
        id=d.id,
        title=d.title,
        description=d.description,
        visibility=d.visibility,
        owner=d.owner,
        widget_count=len(widget_configs),
        widgets=widget_configs,
        created_at=d.created_at.isoformat(),
        updated_at=d.updated_at.isoformat(),
    )


@router.get("", response_model=List[DashboardResponse])
def list_dashboards(db: Session = Depends(get_db)):
    """List all dashboards in the workspace."""
    dashboards = db.query(Dashboard).order_by(Dashboard.updated_at.desc()).all()
    return [_to_dashboard_response(db, d) for d in dashboards]


@router.post("", response_model=DashboardResponse)
def create_dashboard(data: DashboardCreate, db: Session = Depends(get_db)):
    """Create a new dashboard with customizable widgets."""
    dash_id = f"dash-{uuid.uuid4().hex[:8]}"
    dash = Dashboard(
        id=dash_id,
        workspace_id="default-ws",
        title=data.title,
        description=data.description or "",
        visibility=data.visibility or "team",
        owner="demo@analystai.local",
    )
    db.add(dash)
    db.commit()

    order = 0
    for w in data.widgets:
        order += 1
        widget = DashboardWidget(
            id=f"dw-{uuid.uuid4().hex[:8]}",
            dashboard_id=dash_id,
            title=w.title,
            widget_type=w.widget_type,
            chart_type=w.chart_type or "line",
            metric=w.metric or "revenue",
            dimension=w.dimension or "month",
            config_json=json.dumps(w.config),
            position_order=order,
        )
        db.add(widget)
    db.commit()
    db.refresh(dash)

    audit_service.log_event(
        db,
        action="dashboard.create",
        resource_type="dashboard",
        resource_id=dash.id,
        detail={"title": dash.title},
    )

    return _to_dashboard_response(db, dash)


@router.get("/{dashboard_id}", response_model=DashboardResponse)
def get_dashboard(dashboard_id: str, db: Session = Depends(get_db)):
    """Retrieve full dashboard details and interactive widgets."""
    dash = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()
    if not dash:
        raise ResourceNotFoundException("Dashboard", dashboard_id)
    return _to_dashboard_response(db, dash)


@router.patch("/{dashboard_id}", response_model=DashboardResponse)
def update_dashboard(dashboard_id: str, data: DashboardUpdate, db: Session = Depends(get_db)):
    """Update dashboard configuration or widget composition."""
    dash = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()
    if not dash:
        raise ResourceNotFoundException("Dashboard", dashboard_id)

    if data.title is not None:
        dash.title = data.title
    if data.description is not None:
        dash.description = data.description
    if data.visibility is not None:
        dash.visibility = data.visibility

    if data.widgets is not None:
        # Replace widgets
        db.query(DashboardWidget).filter(DashboardWidget.dashboard_id == dashboard_id).delete()
        order = 0
        for w in data.widgets:
            order += 1
            widget = DashboardWidget(
                id=f"dw-{uuid.uuid4().hex[:8]}",
                dashboard_id=dashboard_id,
                title=w.title,
                widget_type=w.widget_type,
                chart_type=w.chart_type or "line",
                metric=w.metric or "revenue",
                dimension=w.dimension or "month",
                config_json=json.dumps(w.config),
                position_order=order,
            )
            db.add(widget)

    db.commit()
    db.refresh(dash)
    return _to_dashboard_response(db, dash)


@router.delete("/{dashboard_id}")
def delete_dashboard(dashboard_id: str, db: Session = Depends(get_db)):
    """Delete a dashboard and its widgets."""
    dash = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()
    if not dash:
        raise ResourceNotFoundException("Dashboard", dashboard_id)
    db.query(DashboardWidget).filter(DashboardWidget.dashboard_id == dashboard_id).delete()
    db.delete(dash)
    db.commit()
    return {"message": "Dashboard deleted successfully."}


@router.post("/{dashboard_id}/duplicate", response_model=DashboardResponse)
def duplicate_dashboard(dashboard_id: str, db: Session = Depends(get_db)):
    """Duplicate an existing dashboard."""
    dash = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()
    if not dash:
        raise ResourceNotFoundException("Dashboard", dashboard_id)

    new_id = f"dash-{uuid.uuid4().hex[:8]}"
    new_dash = Dashboard(
        id=new_id,
        workspace_id=dash.workspace_id,
        title=f"Copy of {dash.title}",
        description=dash.description,
        visibility=dash.visibility,
        owner="demo@analystai.local",
    )
    db.add(new_dash)
    db.commit()

    existing_widgets = db.query(DashboardWidget).filter(DashboardWidget.dashboard_id == dashboard_id).all()
    for w in existing_widgets:
        new_w = DashboardWidget(
            id=f"dw-{uuid.uuid4().hex[:8]}",
            dashboard_id=new_id,
            title=w.title,
            widget_type=w.widget_type,
            chart_type=w.chart_type,
            metric=w.metric,
            dimension=w.dimension,
            config_json=w.config_json,
            position_order=w.position_order,
        )
        db.add(new_w)
    db.commit()
    db.refresh(new_dash)
    return _to_dashboard_response(db, new_dash)

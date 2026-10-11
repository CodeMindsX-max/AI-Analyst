import json
import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.data_source import DataSource, UploadedDataset
from app.schemas.data_sources import (
    DataSourceCreate,
    DataSourceResponse,
    TestConnectionResponse,
)
from app.providers.sqlite_demo_connector import SqliteDemoConnector
from app.core.exceptions import ResourceNotFoundException, ValidationError
from app.services.audit_service import audit_service
from app.core.config import settings

router = APIRouter(prefix="/data-sources", tags=["Data Sources"])


@router.get("", response_model=List[DataSourceResponse])
def list_data_sources(db: Session = Depends(get_db)):
    """List all registered and seeded data sources in the workspace."""
    sources = db.query(DataSource).all()
    return [
        DataSourceResponse(
            id=s.id,
            name=s.name,
            kind=s.kind,
            status=s.status,
            table_count=s.table_count,
            row_count=s.row_count,
            last_synced_at=s.last_synced_at.isoformat() if s.last_synced_at else None,
            owner=s.owner,
            created_at=s.created_at.isoformat(),
        )
        for s in sources
    ]


@router.post("", response_model=DataSourceResponse)
def create_data_source(data: DataSourceCreate, db: Session = Depends(get_db)):
    """Create a new data source connector entry."""
    is_live = data.kind == "demo_dataset"
    status_val = "active" if is_live else "scaffold"

    ds = DataSource(
        id=f"src-{uuid.uuid4().hex[:8]}",
        workspace_id="default-ws",
        name=data.name,
        kind=data.kind,
        status=status_val,
        config_json=json.dumps(data.config),
        table_count=4 if is_live else 0,
        row_count=1420 if is_live else 0,
        owner="Demo Admin",
    )
    db.add(ds)
    db.commit()
    db.refresh(ds)

    audit_service.log_event(
        db,
        action="datasource.create",
        resource_type="data_source",
        resource_id=ds.id,
        detail={"name": ds.name, "kind": ds.kind},
    )

    return DataSourceResponse(
        id=ds.id,
        name=ds.name,
        kind=ds.kind,
        status=ds.status,
        table_count=ds.table_count,
        row_count=ds.row_count,
        last_synced_at=None,
        owner=ds.owner,
        created_at=ds.created_at.isoformat(),
    )


@router.get("/{source_id}", response_model=DataSourceResponse)
def get_data_source(source_id: str, db: Session = Depends(get_db)):
    """Get metadata for a specific data source."""
    ds = db.query(DataSource).filter(DataSource.id == source_id).first()
    if not ds:
        raise ResourceNotFoundException("DataSource", source_id)
    return DataSourceResponse(
        id=ds.id,
        name=ds.name,
        kind=ds.kind,
        status=ds.status,
        table_count=ds.table_count,
        row_count=ds.row_count,
        last_synced_at=ds.last_synced_at.isoformat() if ds.last_synced_at else None,
        owner=ds.owner,
        created_at=ds.created_at.isoformat(),
    )


@router.post("/{source_id}/test-connection", response_model=TestConnectionResponse)
def test_data_source_connection(source_id: str, db: Session = Depends(get_db)):
    """Test connection to a data source (checks SQLite if demo, honest scaffold note if remote)."""
    ds = db.query(DataSource).filter(DataSource.id == source_id).first()
    if not ds:
        raise ResourceNotFoundException("DataSource", source_id)

    if ds.kind == "demo_dataset" or "sqlite" in ds.kind.lower():
        connector = SqliteDemoConnector()
        res = connector.test_connection()
        return TestConnectionResponse(**res)
    else:
        # Honest mock/scaffold response as required by non-negotiable rule 6
        return TestConnectionResponse(
            success=False,
            message=f"Connector '{ds.kind}' is currently in scaffold status. No remote credentials configured.",
            latency_ms=12,
            tables_found=0,
            is_simulated=True,
        )


@router.post("/{source_id}/sync")
def sync_data_source(source_id: str, db: Session = Depends(get_db)):
    """Refresh or sync data source metadata."""
    ds = db.query(DataSource).filter(DataSource.id == source_id).first()
    if not ds:
        raise ResourceNotFoundException("DataSource", source_id)

    ds.last_synced_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": f"Source '{ds.name}' metadata refreshed successfully.", "status": "active"}


@router.delete("/{source_id}")
def delete_data_source(source_id: str, db: Session = Depends(get_db)):
    """Delete a data source connector."""
    ds = db.query(DataSource).filter(DataSource.id == source_id).first()
    if not ds:
        raise ResourceNotFoundException("DataSource", source_id)
    db.delete(ds)
    db.commit()
    return {"message": "Data source removed successfully."}

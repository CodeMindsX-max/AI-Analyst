import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.knowledge import GlossaryTerm
from app.schemas.knowledge import GlossaryTermCreate, GlossaryTermUpdate, GlossaryTermResponse
from app.core.exceptions import ResourceNotFoundException
from app.services.audit_service import audit_service

router = APIRouter(prefix="/glossary", tags=["Business Glossary"])


@router.get("", response_model=List[GlossaryTermResponse])
def list_glossary_terms(
    search: Optional[str] = Query(None, description="Search term or synonym"),
    domain: Optional[str] = Query(None, description="Filter by business domain"),
    db: Session = Depends(get_db),
):
    """List business glossary terms with definitions, formulas, and schema mappings."""
    query = db.query(GlossaryTerm)
    if domain:
        query = query.filter(GlossaryTerm.domain == domain)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (GlossaryTerm.term.ilike(search_pattern)) | (GlossaryTerm.synonyms.ilike(search_pattern))
        )
    terms = query.order_by(GlossaryTerm.term.asc()).all()
    return [
        GlossaryTermResponse(
            id=t.id,
            term=t.term,
            definition=t.definition,
            synonyms=t.synonyms,
            formula=t.formula,
            domain=t.domain,
            source_tables=t.source_tables,
            source_columns=t.source_columns,
            steward=t.steward,
            notes=t.notes,
            updated_at=t.updated_at.isoformat(),
        )
        for t in terms
    ]


@router.post("", response_model=GlossaryTermResponse)
def create_glossary_term(data: GlossaryTermCreate, db: Session = Depends(get_db)):
    """Create a new business term definition in the glossary."""
    term = GlossaryTerm(
        id=f"gloss-{uuid.uuid4().hex[:8]}",
        workspace_id="default-ws",
        term=data.term,
        definition=data.definition,
        synonyms=data.synonyms or "",
        formula=data.formula or "",
        domain=data.domain or "Sales",
        source_tables=data.source_tables or "sales_orders",
        source_columns=data.source_columns or "net_amount",
        steward=data.steward or "Lead Data Analyst",
        notes=data.notes or "",
    )
    db.add(term)
    db.commit()
    db.refresh(term)

    audit_service.log_event(
        db,
        action="glossary.create",
        resource_type="glossary_term",
        resource_id=term.id,
        detail={"term": term.term, "domain": term.domain},
    )

    return GlossaryTermResponse(
        id=term.id,
        term=term.term,
        definition=term.definition,
        synonyms=term.synonyms,
        formula=term.formula,
        domain=term.domain,
        source_tables=term.source_tables,
        source_columns=term.source_columns,
        steward=term.steward,
        notes=term.notes,
        updated_at=term.updated_at.isoformat(),
    )


@router.get("/{term_id}", response_model=GlossaryTermResponse)
def get_glossary_term(term_id: str, db: Session = Depends(get_db)):
    """Get single glossary term detail."""
    term = db.query(GlossaryTerm).filter(GlossaryTerm.id == term_id).first()
    if not term:
        raise ResourceNotFoundException("GlossaryTerm", term_id)
    return GlossaryTermResponse(
        id=term.id,
        term=term.term,
        definition=term.definition,
        synonyms=term.synonyms,
        formula=term.formula,
        domain=term.domain,
        source_tables=term.source_tables,
        source_columns=term.source_columns,
        steward=term.steward,
        notes=term.notes,
        updated_at=term.updated_at.isoformat(),
    )


@router.patch("/{term_id}", response_model=GlossaryTermResponse)
def update_glossary_term(term_id: str, data: GlossaryTermUpdate, db: Session = Depends(get_db)):
    """Update business definition or formula for a glossary term."""
    term = db.query(GlossaryTerm).filter(GlossaryTerm.id == term_id).first()
    if not term:
        raise ResourceNotFoundException("GlossaryTerm", term_id)

    if data.term is not None:
        term.term = data.term
    if data.definition is not None:
        term.definition = data.definition
    if data.synonyms is not None:
        term.synonyms = data.synonyms
    if data.formula is not None:
        term.formula = data.formula
    if data.domain is not None:
        term.domain = data.domain
    if data.source_tables is not None:
        term.source_tables = data.source_tables
    if data.source_columns is not None:
        term.source_columns = data.source_columns
    if data.steward is not None:
        term.steward = data.steward
    if data.notes is not None:
        term.notes = data.notes

    db.commit()
    db.refresh(term)
    return GlossaryTermResponse(
        id=term.id,
        term=term.term,
        definition=term.definition,
        synonyms=term.synonyms,
        formula=term.formula,
        domain=term.domain,
        source_tables=term.source_tables,
        source_columns=term.source_columns,
        steward=term.steward,
        notes=term.notes,
        updated_at=term.updated_at.isoformat(),
    )


@router.delete("/{term_id}")
def delete_glossary_term(term_id: str, db: Session = Depends(get_db)):
    """Delete a term from the business glossary."""
    term = db.query(GlossaryTerm).filter(GlossaryTerm.id == term_id).first()
    if not term:
        raise ResourceNotFoundException("GlossaryTerm", term_id)
    db.delete(term)
    db.commit()
    return {"message": "Glossary term deleted successfully."}

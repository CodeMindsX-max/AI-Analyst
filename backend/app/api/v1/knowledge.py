import json
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.knowledge import KnowledgeDocument, DocumentChunk
from app.schemas.knowledge import (
    DocumentResponse,
    DocumentDetailResponse,
    ChunkResponse,
    RetrievalPreviewRequest,
    RetrievalPreviewResponse,
    RetrievalPreviewItem,
)
from app.services.document_service import document_service
from app.services.business_knowledge_service import business_knowledge_service
from app.core.exceptions import ResourceNotFoundException
from app.services.audit_service import audit_service

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base & RAG"])


@router.get("/documents", response_model=List[DocumentResponse])
def list_documents(db: Session = Depends(get_db)):
    """List uploaded knowledge base documents and their indexing status."""
    docs = db.query(KnowledgeDocument).order_by(KnowledgeDocument.created_at.desc()).all()
    return [
        DocumentResponse(
            id=d.id,
            name=d.name,
            file_type=d.file_type,
            file_size_bytes=d.file_size_bytes,
            status=d.status,
            char_count=d.char_count,
            chunk_count=d.chunk_count,
            indexing_mode=d.indexing_mode,
            owner=d.owner,
            created_at=d.created_at.isoformat(),
        )
        for d in docs
    ]


@router.post("/documents/upload", response_model=DocumentResponse)
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload a knowledge document (PDF, DOCX, TXT, CSV, XLSX) and process chunks."""
    doc = await document_service.save_and_index_document(db, file, owner="Demo Admin")
    audit_service.log_event(
        db,
        action="knowledge.upload",
        resource_type="document",
        resource_id=doc.id,
        detail={"name": doc.name, "type": doc.file_type, "chunks": doc.chunk_count},
    )
    return DocumentResponse(
        id=doc.id,
        name=doc.name,
        file_type=doc.file_type,
        file_size_bytes=doc.file_size_bytes,
        status=doc.status,
        char_count=doc.char_count,
        chunk_count=doc.chunk_count,
        indexing_mode=doc.indexing_mode,
        owner=doc.owner,
        created_at=doc.created_at.isoformat(),
    )


@router.get("/documents/{document_id}", response_model=DocumentDetailResponse)
def get_document_details(document_id: str, db: Session = Depends(get_db)):
    """Retrieve document metadata, extracted text preview, and chunk breakdown."""
    doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == document_id).first()
    if not doc:
        raise ResourceNotFoundException("KnowledgeDocument", document_id)

    chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).order_by(DocumentChunk.chunk_index.asc()).all()

    chunk_responses = [
        ChunkResponse(
            id=c.id,
            chunk_index=c.chunk_index,
            content=c.content,
            metadata=eval(c.metadata_json) if c.metadata_json.startswith("{") else {},
        )
        for c in chunks
    ]

    extracted_preview = "\n\n".join([c.content for c in chunks[:3]])

    return DocumentDetailResponse(
        document=DocumentResponse(
            id=doc.id,
            name=doc.name,
            file_type=doc.file_type,
            file_size_bytes=doc.file_size_bytes,
            status=doc.status,
            char_count=doc.char_count,
            chunk_count=doc.chunk_count,
            indexing_mode=doc.indexing_mode,
            owner=doc.owner,
            created_at=doc.created_at.isoformat(),
        ),
        extracted_text_preview=extracted_preview,
        chunks=chunk_responses,
    )


@router.delete("/documents/{document_id}")
def delete_document(document_id: str, db: Session = Depends(get_db)):
    """Delete a document and its indexed chunks."""
    doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == document_id).first()
    if not doc:
        raise ResourceNotFoundException("KnowledgeDocument", document_id)

    db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).delete()
    db.delete(doc)
    db.commit()
    return {"message": "Document and chunks removed successfully."}


@router.post("/retrieval-preview", response_model=RetrievalPreviewResponse)
def retrieval_preview(data: RetrievalPreviewRequest, db: Session = Depends(get_db)):
    """Test retrieval against knowledge chunks using lexical/keyword matching (Demo retrieval)."""
    matches = business_knowledge_service.lexical_document_search(db, data.query, top_k=data.top_k or 3)
    items = [
        RetrievalPreviewItem(
            chunk_id=m["chunk_id"],
            document_name=m["document_name"],
            content=m["content"],
            score=m["score"],
            match_method=m["match_method"],
            is_demo=True,
        )
        for m in matches
    ]
    return RetrievalPreviewResponse(
        query=data.query,
        results=items,
        retrieval_mode="Demo Lexical Retrieval (Mock Embeddings)",
    )

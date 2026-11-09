import os
import uuid
from pathlib import Path
from typing import Tuple, List, Dict, Any
from fastapi import UploadFile
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.exceptions import ValidationError
from app.models.knowledge import KnowledgeDocument, DocumentChunk
from app.services.chunking_service import chunking_service


class DocumentService:
    """Service managing document uploads, text extraction, chunking, and demo indexing."""

    ALLOWED_EXTENSIONS = {".txt", ".csv", ".xlsx", ".pdf", ".docx"}

    def _extract_text(self, file_path: Path, ext: str) -> str:
        """Extract plain text based on file format."""
        if ext == ".docx":
            # Per FYP architecture specification: DOCX requires python-docx or pandoc converter.
            raise ValidationError("DOCX extraction is currently unsupported in this environment. Please convert to PDF, TXT, or CSV.")

        try:
            if ext == ".txt":
                return file_path.read_text(encoding="utf-8", errors="replace")
            elif ext == ".csv":
                try:
                    import pandas as pd
                    df = pd.read_csv(file_path, nrows=50)
                    return f"CSV Data Preview ({df.shape[0]} rows x {df.shape[1]} cols):\n" + df.to_string()
                except Exception:
                    return file_path.read_text(encoding="utf-8", errors="replace")[:4000]
            elif ext == ".xlsx":
                try:
                    import pandas as pd
                    df = pd.read_excel(file_path, nrows=50)
                    return f"Excel Data Preview ({df.shape[0]} rows x {df.shape[1]} cols):\n" + df.to_string()
                except Exception as ex:
                    return f"[Excel extraction error: {str(ex)}]"
            elif ext == ".pdf":
                try:
                    import pypdf
                    reader = pypdf.PdfReader(str(file_path))
                    pages_text = [page.extract_text() or "" for page in reader.pages]
                    full_text = "\n\n".join(pages_text).strip()
                    return full_text if full_text else "[PDF contains no extractable text. Scanned images or forms require an external OCR model.]"
                except ImportError:
                    return f"[Uploaded PDF document: {file_path.name}. Note: pypdf not installed in environment; extraction skipped.]"
            return ""
        except ValidationError:
            raise
        except Exception as e:
            return f"[Extraction error: {str(e)}]"

    async def save_and_index_document(self, db: Session, upload_file: UploadFile, owner: str = "Demo Admin") -> KnowledgeDocument:
        raw_filename = upload_file.filename or "untitled.txt"
        clean_filename = os.path.basename(raw_filename).strip() or "untitled.txt"
        ext = os.path.splitext(clean_filename)[1].lower()

        if ext not in self.ALLOWED_EXTENSIONS:
            raise ValidationError(f"File extension '{ext}' is not supported. Allowed formats: {sorted(list(self.ALLOWED_EXTENSIONS))}")

        if ext == ".docx":
            raise ValidationError("DOCX extraction is currently unsupported in this environment. Please convert to PDF, TXT, or CSV.")

        upload_dir = settings.get_upload_path()
        doc_id = f"doc-{uuid.uuid4().hex[:10]}"
        safe_filename = f"{doc_id}_{Path(clean_filename).name}"
        destination = (upload_dir / safe_filename).resolve()

        # Enforce boundary check against path traversal
        if not destination.is_relative_to(upload_dir.resolve()):
            raise ValidationError("Invalid filename: directory traversal detected.")

        # Stream save and enforce size limit
        size_bytes = 0
        max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
        with open(destination, "wb") as f:
            while chunk := await upload_file.read(1024 * 64):
                size_bytes += len(chunk)
                if size_bytes > max_bytes:
                    f.close()
                    destination.unlink(missing_ok=True)
                    raise ValidationError(f"File size exceeds maximum permitted limit of {settings.MAX_UPLOAD_MB}MB.")
                f.write(chunk)

        # Extract text
        extracted_text = self._extract_text(destination, ext)
        char_count = len(extracted_text)

        # Chunk text
        chunks = chunking_service.chunk_text(extracted_text, doc_id, clean_filename)

        # Create KnowledgeDocument record
        doc = KnowledgeDocument(
            id=doc_id,
            workspace_id="default-ws",
            name=filename,
            file_path=str(destination),
            file_type=ext.replace(".", ""),
            file_size_bytes=size_bytes,
            status="indexed",
            char_count=char_count,
            chunk_count=len(chunks),
            indexing_mode="mock",
            owner=owner,
        )
        db.add(doc)
        db.commit()

        # Save DocumentChunks
        for c in chunks:
            chunk_record = DocumentChunk(
                id=f"chk-{uuid.uuid4().hex[:10]}",
                document_id=doc_id,
                chunk_index=c["chunk_index"],
                content=c["content"],
                metadata_json=str(c["metadata"]),
            )
            db.add(chunk_record)
        db.commit()
        db.refresh(doc)

        return doc


document_service = DocumentService()

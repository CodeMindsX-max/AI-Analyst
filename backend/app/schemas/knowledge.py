from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: str
    name: str
    file_type: str
    file_size_bytes: int
    status: str
    char_count: int
    chunk_count: int
    indexing_mode: str
    owner: str
    created_at: str


class ChunkResponse(BaseModel):
    id: str
    chunk_index: int
    content: str
    metadata: Dict[str, Any]


class DocumentDetailResponse(BaseModel):
    document: DocumentResponse
    extracted_text_preview: str
    chunks: List[ChunkResponse]


class RetrievalPreviewRequest(BaseModel):
    query: str
    top_k: Optional[int] = 3


class RetrievalPreviewItem(BaseModel):
    chunk_id: str
    document_name: str
    content: str
    score: float
    match_method: str  # demo_lexical_bm25, mock_vector, dense_embedding
    is_demo: bool = True


class RetrievalPreviewResponse(BaseModel):
    query: str
    results: List[RetrievalPreviewItem]
    retrieval_mode: str = "Demo Lexical Retrieval"


class GlossaryTermCreate(BaseModel):
    term: str
    definition: str
    synonyms: Optional[str] = ""
    formula: Optional[str] = ""
    domain: Optional[str] = "Sales"
    source_tables: Optional[str] = "sales_orders"
    source_columns: Optional[str] = "net_amount"
    steward: Optional[str] = "Lead Data Analyst"
    notes: Optional[str] = ""


class GlossaryTermUpdate(BaseModel):
    term: Optional[str] = None
    definition: Optional[str] = None
    synonyms: Optional[str] = None
    formula: Optional[str] = None
    domain: Optional[str] = None
    source_tables: Optional[str] = None
    source_columns: Optional[str] = None
    steward: Optional[str] = None
    notes: Optional[str] = None


class GlossaryTermResponse(BaseModel):
    id: str
    term: str
    definition: str
    synonyms: str
    formula: str
    domain: str
    source_tables: str
    source_columns: str
    steward: str
    notes: str
    updated_at: str

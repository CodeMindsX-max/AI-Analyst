from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.knowledge import GlossaryTerm, KnowledgeDocument, DocumentChunk

# TODO(STUDENT): Implement genuine RAG retrieval and neural reranking.
# Recommended steps:
# 1. Hybrid retrieval: Dense vector search (Chroma/FAISS) + BM25 keyword search.
# 2. Reciprocal Rank Fusion (RRF) or Cross-Encoder reranker (e.g. cross-encoder/ms-marco-MiniLM-L-6-v2).
# 3. Contextual compression: extract only the most relevant sentences for the prompt.


class BusinessKnowledgeService:
    """Service providing business definition retrieval and document chunk search."""

    def retrieve_glossary_definitions(self, db: Session, question: str) -> List[Dict[str, Any]]:
        """Retrieve glossary definitions relevant to question terms."""
        terms = db.query(GlossaryTerm).all()
        lower_q = question.lower()
        matched = []

        for t in terms:
            term_lower = t.term.lower()
            synonyms_lower = [s.strip().lower() for s in t.synonyms.split(",") if s.strip()]
            if term_lower in lower_q or any(s in lower_q for s in synonyms_lower):
                matched.append(
                    {
                        "term": t.term,
                        "definition": t.definition,
                        "formula": t.formula,
                        "domain": t.domain,
                        "tables": t.source_tables,
                        "columns": t.source_columns,
                    }
                )

        # Fallback default if no explicit term matched
        if not matched and terms:
            default_t = next((t for t in terms if t.term == "Revenue"), terms[0])
            matched.append(
                {
                    "term": default_t.term,
                    "definition": default_t.definition,
                    "formula": default_t.formula,
                    "domain": default_t.domain,
                    "tables": default_t.source_tables,
                    "columns": default_t.source_columns,
                }
            )

        return matched

    def lexical_document_search(self, db: Session, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Perform lexical keyword search over document chunks (Demo Lexical Retrieval)."""
        words = [w.lower() for w in query.split() if len(w) > 3]
        chunks = db.query(DocumentChunk).limit(100).all()
        scored_chunks = []

        for c in chunks:
            c_lower = c.content.lower()
            score = sum(1.0 for w in words if w in c_lower)
            if score > 0:
                doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == c.document_id).first()
                scored_chunks.append(
                    {
                        "chunk_id": c.id,
                        "document_name": doc.name if doc else "Document",
                        "content": c.content,
                        "score": round(score / (len(words) or 1), 2),
                        "match_method": "demo_lexical_bm25",
                        "is_demo": True,
                    }
                )

        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        return scored_chunks[:top_k]


business_knowledge_service = BusinessKnowledgeService()

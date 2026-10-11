from typing import List, Dict, Any, Optional
from app.providers.vector_store_base import VectorStore, VectorSearchResult

# TODO(STUDENT): Replace this MockVectorStore with an actual vector store.
# Recommended student choices:
# 1. ChromaDB (in-process or client/server)
# 2. FAISS (Facebook AI Similarity Search - fast local L2 / cosine index)
# 3. Qdrant / pgvector (PostgreSQL vector extension)


class MockVectorStore(VectorStore):
    """In-memory Mock Vector Store with lexical + vector simulation."""

    def __init__(self):
        self._storage: Dict[str, Dict[str, Any]] = {}

    def upsert(
        self,
        chunk_ids: List[str],
        vectors: List[List[float]],
        documents: List[str],
        metadatas: List[Dict[str, Any]],
    ) -> bool:
        for cid, vec, doc, meta in zip(chunk_ids, vectors, documents, metadatas):
            self._storage[cid] = {
                "vector": vec,
                "content": doc,
                "metadata": meta,
            }
        return True

    def search(
        self,
        query_vector: List[float],
        top_k: int = 5,
        filter_metadata: Optional[Dict[str, Any]] = None,
    ) -> List[VectorSearchResult]:
        results = []
        for cid, item in list(self._storage.items())[:top_k]:
            results.append(
                VectorSearchResult(
                    chunk_id=cid,
                    document_id=item["metadata"].get("document_id", "unknown"),
                    content=item["content"],
                    score=0.88,
                    metadata=item["metadata"],
                    is_demo=True,
                )
            )
        return results

    def delete(self, chunk_ids: List[str]) -> bool:
        for cid in chunk_ids:
            self._storage.pop(cid, None)
        return True

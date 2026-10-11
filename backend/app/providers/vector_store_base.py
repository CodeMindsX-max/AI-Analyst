from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class VectorSearchResult(BaseModel):
    chunk_id: str
    document_id: str
    content: str
    score: float
    metadata: Dict[str, Any] = {}
    is_demo: bool = True


class VectorStore(ABC):
    """Abstract Base Class for Vector Database Storage."""

    @abstractmethod
    def upsert(
        self,
        chunk_ids: List[str],
        vectors: List[List[float]],
        documents: List[str],
        metadatas: List[Dict[str, Any]],
    ) -> bool:
        """Upsert vectors with associated metadata into the vector index."""
        pass

    @abstractmethod
    def search(
        self,
        query_vector: List[float],
        top_k: int = 5,
        filter_metadata: Optional[Dict[str, Any]] = None,
    ) -> List[VectorSearchResult]:
        """Perform nearest neighbor search for a given vector."""
        pass

    @abstractmethod
    def delete(self, chunk_ids: List[str]) -> bool:
        """Delete vectors by chunk IDs."""
        pass

from abc import ABC, abstractmethod
from typing import List


class EmbeddingProvider(ABC):
    """Abstract Base Class for text embeddings."""

    @abstractmethod
    def embed_query(self, text: str) -> List[float]:
        """Embed a single query string into a vector."""
        pass

    @abstractmethod
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of document chunk texts into vectors."""
        pass

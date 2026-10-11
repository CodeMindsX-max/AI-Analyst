import hashlib
from typing import List
from app.providers.embeddings_base import EmbeddingProvider

# TODO(STUDENT): Replace this MockEmbeddingProvider with an actual embedding model.
# Options:
# 1. Local HuggingFace sentence-transformers (e.g. all-MiniLM-L6-v2, BAAI/bge-small-en-v1.5)
# 2. Cloud API (e.g. OpenAI text-embedding-3-small, Google text-embedding-004)
# Maintain vector dimension consistency (e.g. 384 or 1536).


class MockEmbeddingProvider(EmbeddingProvider):
    """Deterministic Mock Embedding Provider for demo RAG pipelines."""

    def __init__(self, dimension: int = 16):
        self.dimension = dimension

    def _hash_vector(self, text: str) -> List[float]:
        # Generate pseudo-vector from text hash
        raw_hash = hashlib.sha256(text.encode("utf-8")).digest()
        vec = []
        for i in range(self.dimension):
            byte_val = raw_hash[i % len(raw_hash)]
            normalized = (byte_val - 128.0) / 128.0
            vec.append(round(normalized, 4))
        return vec

    def embed_query(self, text: str) -> List[float]:
        return self._hash_vector(text)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._hash_vector(t) for t in texts]

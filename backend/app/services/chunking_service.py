from typing import List, Dict, Any

# TODO(STUDENT): Experiment with chunking strategies:
# 1. Fixed-size chunking with sliding token overlap (e.g., 512 tokens with 64 overlap).
# 2. Semantic chunking: splitting by Markdown headers, paragraph breaks, or sentence embeddings similarity.
# 3. Document-specific extractors for tabular data (e.g. keeping row headers with each chunk).


class ChunkingService:
    """Service splitting raw text into chunks for indexing and retrieval."""

    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_text(self, text: str, document_id: str, file_name: str) -> List[Dict[str, Any]]:
        """Split text into manageable chunks with index metadata."""
        if not text:
            return []

        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        chunks = []
        current_chunk = ""
        chunk_idx = 0

        for p in paragraphs:
            if len(current_chunk) + len(p) <= self.chunk_size:
                current_chunk += ("\n\n" + p if current_chunk else p)
            else:
                if current_chunk:
                    chunks.append(
                        {
                            "chunk_index": chunk_idx,
                            "content": current_chunk,
                            "metadata": {
                                "document_id": document_id,
                                "file_name": file_name,
                                "char_length": len(current_chunk),
                                "is_demo": True,
                            },
                        }
                    )
                    chunk_idx += 1
                current_chunk = p

        if current_chunk:
            chunks.append(
                {
                    "chunk_index": chunk_idx,
                    "content": current_chunk,
                    "metadata": {
                        "document_id": document_id,
                        "file_name": file_name,
                        "char_length": len(current_chunk),
                        "is_demo": True,
                    },
                }
            )

        return chunks


chunking_service = ChunkingService()

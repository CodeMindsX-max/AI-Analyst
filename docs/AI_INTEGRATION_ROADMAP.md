# AnalystAI — FYP AI & NLP Integration Roadmap

This document serves as the implementation blueprint for the student to transition **AnalystAI** from its deterministic demo mode into a live, state-of-the-art NLP Agentic Data Analyst.

---

## 1. Overview of Extension Points

All student extension interfaces are encapsulated within `backend/app/providers/` and marked with `# TODO(STUDENT)` comments:

| Provider File | Interface | Description | Recommended Implementation |
|---|---|---|---|
| `app/providers/llm_provider.py` | `LLMProvider` | Core reasoning, question parsing, Text-to-SQL generation, and executive answer synthesis. | OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, or Ollama Llama-3. |
| `app/providers/embedding_provider.py` | `EmbeddingProvider` | Vector embedding generation for document chunks, glossary terms, and user questions. | OpenAI `text-embedding-3-small` or HuggingFace `all-MiniLM-L6-v2`. |
| `app/providers/vector_store.py` | `VectorStore` | Dense similarity indexing and nearest neighbor search. | ChromaDB, FAISS, or Qdrant. |
| `app/providers/database_connector.py` | `DatabaseConnector` | Live analytical database drivers with read-only connection limits. | PostgreSQL via `psycopg2`, Snowflake via `snowflake-connector-python`. |

---

## 2. Implementing a Real LLM (`LLMProvider`)

Open `backend/app/providers/llm_provider.py`. Currently, `MockLLMProvider` uses deterministic template matching to guarantee a functional offline demo.

### Recommended Implementation (OpenAI / LangChain / Ollama):
```python
import openai
from app.providers.llm_provider import LLMProvider

class OpenAILLMProvider(LLMProvider):
    def __init__(self, api_key: str, model_name: str = "gpt-4o"):
        self.client = openai.OpenAI(api_key=api_key)
        self.model_name = model_name

    def generate_completion(self, system_prompt: str, user_prompt: str, temperature: float = 0.0) -> str:
        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=temperature
        )
        return response.choices[0].message.content
```

---

## 3. Implementing Dense Semantic Embeddings (`EmbeddingProvider`)

Open `backend/app/providers/embedding_provider.py`. Currently, `MockEmbeddingProvider` generates deterministic hash vectors.

### Recommended Implementation (Hugging Face Local Embeddings):
```python
from sentence_transformers import SentenceTransformer
from app.providers.embedding_provider import EmbeddingProvider

class SentenceTransformerEmbeddingProvider(EmbeddingProvider):
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)

    def embed_text(self, text: str) -> list[float]:
        vector = self.model.encode(text)
        return vector.tolist()

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        vectors = self.model.encode(texts)
        return vectors.tolist()
```

---

## 4. Implementing ChromaDB Vector Store (`VectorStore`)

Open `backend/app/providers/vector_store.py`. Currently, `MockVectorStore` calculates cosine similarity over in-memory dictionaries.

### Recommended Implementation (ChromaDB):
```python
import chromadb
from app.providers.vector_store import VectorStore

class ChromaVectorStore(VectorStore):
    def __init__(self, collection_name: str = "analystai_knowledge"):
        self.client = chromadb.PersistentClient(path="./chroma_db")
        self.collection = self.client.get_or_create_collection(collection_name)

    def add_vectors(self, ids: list[str], embeddings: list[list[float]], documents: list[str], metadatas: list[dict]):
        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas
        )

    def search(self, query_embedding: list[float], top_k: int = 4) -> list[dict]:
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )
        # Transform results into standard dictionary structure
        return [
            {
                "id": results["ids"][0][i],
                "content": results["documents"][0][i],
                "score": results["distances"][0][i],
                "metadata": results["metadatas"][0][i]
            }
            for i in range(len(results["ids"][0]))
        ]
```

---

## 5. NLP Evaluation Metrics for Final Year Project Thesis

When writing your FYP dissertation, evaluate your AI Analyst using standard academic benchmarks:

1. **Spider Benchmark (Text-to-SQL):** Measure Exact Match (EM) accuracy and Execution Accuracy (EX) of synthesized SQL queries against database ground truths.
2. **RAG Context Relevance:** Measure Hit Rate @ K and Mean Reciprocal Rank (MRR) of retrieved glossary terms and business documentation chunks.
3. **Safety & Robustness Rate:** Percentage of malicious, mutating, or prompt-injected queries intercepted and safely neutralized before database execution.

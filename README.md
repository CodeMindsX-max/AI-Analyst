# AnalystAI — Enterprise Agentic Business Data Analyst (FYP)

> **AnalystAI** is a full-stack, enterprise-grade AI Business Intelligence and Autonomous Data Analyst application designed as a Final Year Project (FYP) with a specialization in Natural Language Processing (NLP) and Agentic Workflow Orchestration.

---

## 🌟 Key Highlights

- **Zero-Cost, Zero-API-Key Default Runtime:** Runs 100% locally out-of-the-box using deterministic local mock AI providers and a pre-seeded SQLite analytical data warehouse (`analystai_analytics.db`).
- **9-Step Bounded Agent Workflow:** Executes a structured analysis pipeline:
  1. Question Understanding & Parsing
  2. Schema Retrieval & Entity Extraction
  3. Business Knowledge & Glossary Retrieval (RAG)
  4. Analytical Planning
  5. Text-to-SQL Generation
  6. Read-Only SQL Safety & AST Validation
  7. Sandboxed SQL Execution (SQLite authorizer enforced)
  8. Metric Variance & Anomaly Detection
  9. Executive & Visual Answer Synthesis
- **Strict Read-Only SQL Safety:** Dual-layer defense mechanism combining SQL AST parsing and SQLite C-level authorizer hooks to permanently block mutation queries (`DROP`, `INSERT`, `UPDATE`, `ALTER`, `ATTACH`).
- **Complete Enterprise UI:** Built with React 18, TypeScript, Tailwind CSS, and Recharts—featuring Executive Overview, AI Analyst with interactive timeline, SQL Workspace, Data Explorer, Knowledge Base (RAG), Business Glossary, Custom Dashboards, Executive Reports, Schedules, Audit Trail, and Command Palette (`Ctrl+K`).
- **Explicit Extension Points (`# TODO(STUDENT)`):** Clean architectural interfaces in `backend/app/providers/` for easy integration of live LLMs (OpenAI, Claude, Ollama), vector databases (Chroma, FAISS), and external data warehouses (PostgreSQL, Snowflake).

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+** (Python 3.11 recommended)
- **Node.js 18+** (Node.js 20 or 24 LTS)
- **PowerShell** (Windows) or Bash (macOS / Linux)

---

### 1. Backend Setup & Launch

```powershell
# Navigate to the backend directory
cd backend

# Create and activate Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r requirements.txt

# Seed metadata & analytical databases (Done automatically on start, or manually:)
python -m app.db.seed

# Launch the FastAPI backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend server is accessible at:
- **API Root:** `http://127.0.0.1:8000/api/v1`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`
- **ReDoc:** `http://127.0.0.1:8000/redoc`

---

### 2. Frontend Setup & Launch

Open a separate terminal window:

```powershell
# Navigate to frontend directory
cd frontend

# Install npm dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```

The frontend will start at:
- **Web App:** `http://localhost:5173`

---

## 🔑 Default Credentials (Demo Mode)

The system automatically initializes a pre-configured administrator account:

| Role | Email | Password |
|---|---|---|
| **Workspace Admin** | `demo@analystai.local` | `admin123456` |

*Note: In demo mode, the application pre-authenticates into the demo workspace if credentials are not explicitly supplied.*

---

## 🧪 Running Automated Verification Tests

### Backend Unit & Integration Tests (13/13 passing)
```powershell
cd backend
.\venv\Scripts\python.exe -m pytest app/tests -v
```

### Frontend TypeScript Check & Production Build
```powershell
cd frontend
npm run build
```

---

## 📁 Repository Directory Structure

```text
AI Analyst/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # 19 modular FastAPI route endpoints
│   │   ├── core/            # Config, security, logging, exceptions
│   │   ├── db/              # SQLAlchemy sessions, metadata, seed scripts
│   │   ├── models/          # 18 relational models (metadata & demo analytics)
│   │   ├── providers/       # LLM, Embedding, VectorStore & DB Connector interfaces
│   │   ├── schemas/         # Pydantic v2 schemas for all payloads
│   │   ├── services/        # 16 domain services (agent orchestration, SQL safety, etc.)
│   │   └── tests/           # 13 comprehensive pytest test suites
│   ├── analystai.db         # SQLite metadata database
│   ├── analystai_analytics.db # SQLite seeded sales warehouse
│   └── requirements.txt     # Python requirements
├── frontend/
│   ├── src/
│   │   ├── api/             # HTTP client and TypeScript interfaces
│   │   ├── app/             # Router and React Context providers (Auth, Workspace, Toast)
│   │   ├── components/      # UI primitives (Cards, Buttons, Dialogs, Charts) & Layout
│   │   ├── features/        # 16 complete feature screens (Analyst, SQL, Explorer, etc.)
│   │   ├── lib/             # Formatters, color utilities, Tailwind helpers
│   │   └── styles/          # Design tokens and Tailwind CSS
│   ├── package.json
│   └── vite.config.ts
└── docs/                    # Complete architectural and FYP documentation suite
    ├── PRODUCT_OVERVIEW.md
    ├── ARCHITECTURE.md
    ├── API_REFERENCE.md
    ├── DATA_MODEL.md
    ├── DEVELOPMENT_GUIDE.md
    ├── AI_INTEGRATION_ROADMAP.md
    ├── TEST_PLAN.md
    ├── SECURITY_NOTES.md
    ├── DECISIONS.md
    └── IMPLEMENTATION_STATUS.md
```

---

## 🎓 Final Year Project (FYP) Student Extensions

All integration boundaries for live AI / NLP models and external databases are clearly marked with `# TODO(STUDENT)` comments:

1. **Live LLM Integration:** `backend/app/providers/llm_provider.py`
   - Implement `OpenAILLMProvider`, `AnthropicLLMProvider`, or `OllamaLLMProvider`.
2. **Dense Semantic Embeddings:** `backend/app/providers/embedding_provider.py`
   - Implement `OpenAIEmbeddingProvider` or `HuggingFaceEmbeddingProvider` (`all-MiniLM-L6-v2`, `bge-small-en`).
3. **Vector Store / Vector Database:** `backend/app/providers/vector_store.py`
   - Replace in-memory cosine store with `ChromaDBVectorStore` or `FAISSVectorStore`.
4. **External Warehouse Drivers:** `backend/app/providers/database_connector.py`
   - Implement `PostgresConnector` with psycopg2/SQLAlchemy, or `SnowflakeConnector`.

---

## 🛡️ License
Educational & Final Year Project (FYP) demonstration codebase.

# AnalystAI — Enterprise Agentic Business Data Analyst (FYP)

> **AnalystAI** is a full-stack, enterprise-grade AI Business Intelligence and Autonomous Data Analyst application designed as a Final Year Project (FYP) with a specialization in Natural Language Processing (NLP) and Agentic Workflow Orchestration.

---

## 🌟 Key Highlights

- **Zero-Cost, Zero-API-Key Default Runtime:** Runs 100% locally out-of-the-box using deterministic local mock AI providers and a pre-seeded SQLite analytical data warehouse (`analystai_analytics.db`).
- **Two-Engine Database Architecture:**
  - **Application Database (`ApplicationBase`):** Stores users, workspaces, query history, audit events, saved analyses, and knowledge metadata (PostgreSQL/Supabase in production, SQLite in local development). Managed via **Alembic** migrations.
  - **Analytical Warehouse (`AnalyticsBase`):** Holds customer/analytical fact and dimension tables (`sales_orders`, `customers`, `products`, `regions`). Independent read-only SQLite connector with C-level security authorizers.
- **Hardened Authentication:** Adaptive **bcrypt** password hashing with automatic backward-compatibility and on-the-fly upgrade for legacy SHA-256 hashes. Full JWT token validation. Real React route guards redirect unauthenticated sessions to `/login`.
- **9-Step Bounded Agent Workflow:** Executes a structured, transparent analysis pipeline:
  1. Question Understanding & Intent Decomposition
  2. Schema Retrieval & Join Detection
  3. Business Knowledge & Glossary Retrieval (RAG)
  4. Analytical Planning
  5. Text-to-SQL Generation (grounded candidate SQL)
  6. Read-Only SQL Safety & AST Validation
  7. Sandboxed SQL Execution (read-only authorizer enforced)
  8. Metric Aggregation & Variance Detection
  9. Executive & Visual Answer Synthesis
- **Truthful Analytical Reporting:** Zero fabricated fallback rows. If an external source is unconnected or a query returns zero records, the UI reports an honest empty state or explicit error rather than synthetic numbers.
- **Complete Enterprise UI:** Built with React 18, TypeScript, Tailwind CSS, and Recharts—featuring Executive Overview, AI Analyst with interactive timeline, SQL Workspace, Data Explorer, Knowledge Base (RAG), Business Glossary, Custom Dashboards, Executive Reports, Schedules, Audit Trail, and Command Palette (`Ctrl+K`).
- **Explicit Extension Points (`# TODO(STUDENT)`):** Clean architectural interfaces in `backend/app/providers/` for easy integration of live LLMs (OpenAI, Claude, Ollama), vector databases (Chroma, FAISS), and external data warehouses (PostgreSQL, Snowflake).

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.11** (Root `.venv` environment)
- **Node.js 18+** (Node.js 20 or 24 LTS recommended)
- **PowerShell** (Windows) or **Bash** (macOS / Linux)

---

### 1. Backend Setup & Launch

```powershell
# From repository root, activate the canonical virtual environment
.\.venv\Scripts\Activate.ps1

# Verify Python version (Python 3.11)
python --version

# Copy the environment template (if not already created)
Copy-Item backend\.env.example backend\.env

# Navigate to the backend directory before running backend modules
cd backend

# Seed development metadata & analytical databases
python -m app.db.seed

# Launch the FastAPI backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend server is accessible at:
- **API Root:** `http://127.0.0.1:8000/api/v1`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`
- **ReDoc:** `http://127.0.0.1:8000/redoc`
- **Health Probes:**
  - `/api/v1/health` (Liveness)
  - `/api/v1/health/ready` (Readiness)
  - `/api/v1/health/database` (Database connectivity)

---

### 2. Frontend Setup & Launch

Open a separate terminal window:

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Build check (validates TypeScript types & bundle)
npm run build

# Start Vite development server
npm run dev
```

The frontend will start at:
- **Web App:** `http://localhost:5173`

---

## 🔑 Default Credentials (Development / Demo Mode)

The system automatically initializes a pre-configured administrator account during development seeding:

| Role | Email | Password |
|---|---|---|
| **Workspace Admin** | `demo@analystai.local` | `AnalystAI123!` |

> 🔒 **Security Notice:** The hardcoded administrator fallback has been removed. All protected frontend routes strictly require authentication. Never use demo credentials or hardcoded keys in production.

---

## 🧪 Running Automated Verification Tests

### Backend Test Suite (22/22 Passing)
```powershell
# From repository root
.\.venv\Scripts\python.exe -m pytest backend/app/tests -v
```

Tests cover:
- **Settings & Security:** Validation of production secrets, SQLite rejection in production, repr redaction.
- **Authentication:** Bcrypt hashing, verification, legacy SHA-256 upgrade, JWT issuance and expiration.
- **Database Architecture:** Application engine vs analytics warehouse separation, session cleanup.
- **Health Probes:** `/health`, `/health/ready`, `/health/database`.
- **SQL Safety & Execution:** Read-only enforcement, DDL rejection, multi-statement blocking, zero-row honest reporting, unsupported data source error handling.
- **Knowledge & Glossary:** Full CRUD lifecycle, keyword retrieval preview.
- **Agent Orchestrator:** End-to-end 9-step analysis pipeline, grounded evidence items.

### Frontend Typecheck & Build
```powershell
# TypeScript compilation check
& "C:\Program Files\nodejs\node.exe" "frontend/node_modules/typescript/bin/tsc" -b "frontend"

# Production Vite build
& "C:\Program Files\nodejs\node.exe" "frontend/node_modules/vite/bin/vite.js" build "frontend"
```

---

## 🗄️ Database Architecture & Migrations

### Dual-Database Separation
1. **Application Metadata DB:** Owned and migrated exclusively by **Alembic**. Models inherit from `ApplicationBase`.
2. **Analytics Warehouse:** Pre-seeded business fact and dimension tables. Models inherit from `AnalyticsBase`.

### Managing Alembic Migrations
```powershell
cd backend

# View current migration state
python -m alembic current

# Inspect migration history
python -m alembic history

# Generate a new migration for schema changes
python -m alembic revision --autogenerate -m "describe_changes"

# Apply pending migrations
python -m alembic upgrade head
```

---

## 📁 Repository Structure

```
AI Analyst/
├── backend/
│   ├── app/
│   │   ├── api/v1/         # Modular FastAPI API routers
│   │   ├── core/           # Config, security (bcrypt/JWT), logging, exceptions
│   │   ├── db/             # Base, engines, session factories, seed script
│   │   ├── models/         # SQLAlchemy ORM models (ApplicationBase vs AnalyticsBase)
│   │   ├── providers/      # Database connectors, mock LLM/embedding providers
│   │   ├── schemas/        # Pydantic v2 validation models
│   │   ├── services/       # Business logic, orchestration, validation, analysis
│   │   └── tests/          # Pytest test suite (22 tests)
│   ├── data/               # SQLite database files and uploads
│   ├── migrations/         # Alembic migration environment and versions
│   ├── alembic.ini         # Alembic configuration
│   ├── requirements.txt    # Canonical backend dependencies
│   └── pyproject.toml      # Backend package & pytest configuration
├── frontend/
│   ├── src/
│   │   ├── api/            # HTTP client, TypeScript interfaces
│   │   ├── app/            # Router, AuthProvider, ToastProvider
│   │   ├── components/     # UI design system, AppShell, ChartCard
│   │   └── features/       # Feature pages (Analyst, SQL, Explorer, Dashboards)
│   ├── package.json        # Frontend scripts and dependencies
│   └── vite.config.ts      # Vite configuration
├── docs/                   # Architectural and developer documentation
└── README.md               # Project guide and overview
```

---

## 🛡️ License & Academic Context
Developed as an academic Final Year Project (FYP) focused on Natural Language Processing and Agentic Business Intelligence. All simulated interfaces are clearly documented with `# TODO(STUDENT)` for research extensions.

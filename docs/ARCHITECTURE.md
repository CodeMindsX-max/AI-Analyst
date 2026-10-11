# AnalystAI — Technical Architecture & System Design

## 1. High-Level System Architecture

AnalystAI adopts a clean, decoupled three-tier architecture:

```mermaid
flowchart TD
    subgraph Frontend["Frontend Tier (React + Vite + TypeScript)"]
        UI["Application Shell & Pages"]
        API_Client["API Client (src/api/http.ts)"]
        State["Auth, Workspace & Toast Providers"]
    end

    subgraph Backend["Backend Tier (FastAPI + Python 3.11)"]
        Routers["API Routers (app/api/v1/)"]
        Orchestrator["Agent Orchestrator Service"]
        Safety["SQL Safety & AST Validator"]
        Services["Domain Services (SQL, RAG, Reports)"]
        Providers["Provider Interfaces (# TODO STUDENT)"]
    end

    subgraph Persistence["Persistence & Data Tier"]
        MetaDB[("Metadata DB: analystai.db (SQLite)")]
        AnalyticsDB[("Seeded DW: analystai_analytics.db (SQLite)")]
        VectorIdx[("Vector Store / Semantic Chunks")]
    end

    UI --> API_Client
    API_Client -->|REST JSON / Bearer JWT| Routers
    Routers --> Services
    Routers --> Orchestrator
    Orchestrator --> Safety
    Orchestrator --> Providers
    Services --> MetaDB
    Safety -->|Strict Read-Only Authorizer| AnalyticsDB
    Providers --> VectorIdx
```

---

## 2. 9-Step Bounded Agent Orchestration Pipeline

Rather than relying on unconstrained, looping autonomous agents that risk hallucination and infinite token loops, AnalystAI uses a deterministic **9-step bounded sequential agent architecture**:

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Orch as Agent Orchestrator
    participant Schema as Schema Retriever
    participant RAG as Glossary & RAG Service
    participant Text2SQL as Text-to-SQL Service
    participant Validator as SQL Safety Validator
    participant DB as SQLite Analytical DW
    participant Synth as Answer Synthesizer

    User->>Orch: Submit natural language question
    Orch->>Orch: Step 1: Question Understanding & Intent Extraction
    Orch->>Schema: Step 2: Schema Retrieval & Entity Extraction
    Schema-->>Orch: Tables, Columns, Foreign Keys
    Orch->>RAG: Step 3: Business Knowledge & Glossary Retrieval
    RAG-->>Orch: Canonical metric formulas & document chunks
    Orch->>Orch: Step 4: Analytical Planning & Aggregation Strategy
    Orch->>Text2SQL: Step 5: Text-to-SQL Synthesis
    Text2SQL-->>Orch: Candidate SQL Query
    Orch->>Validator: Step 6: AST & Read-Only Safety Validation
    Validator-->>Orch: Validation Passed (Strict Read-Only)
    Orch->>DB: Step 7: Sandboxed SQL Execution (Authorizer Hook)
    DB-->>Orch: Tabular Result Dataset & Timing
    Orch->>Orch: Step 8: Metric Variance & Outlier Detection
    Orch->>Synth: Step 9: Visual & Executive Answer Synthesis
    Synth-->>User: Executive Answer + Finding Cards + Recharts Data + Evidence
```

---

## 3. Dual-Layer SQL Safety Architecture

Database mutations and prompt-injection-driven data destruction are mitigated by two independent validation barriers:

1. **Layer 1: AST Parsing & Keyword Inspection (`sql_validation_service.py`)**
   - Strips SQL comments and checks syntax against a strict whitelist of SELECT statements.
   - Forbids multi-statement execution (semicolons separating multiple commands).
   - Rejects statements containing `DROP`, `INSERT`, `UPDATE`, `DELETE`, `ALTER`, `TRUNCATE`, `REPLACE`, `EXEC`, `CREATE`, `ATTACH`, `DETACH`.
2. **Layer 2: C-Level SQLite Authorizer Callback (`database_connector.py`)**
   - Configures `sqlite3.set_authorizer(sqlite_read_only_authorizer)` directly on the database connection.
   - Intercepts all SQLite engine opcodes before query execution:
     - Allows: `SQLITE_SELECT`, `SQLITE_READ`, `SQLITE_FUNCTION`.
     - Denies: `SQLITE_INSERT`, `SQLITE_UPDATE`, `SQLITE_DELETE`, `SQLITE_DROP_TABLE`, `SQLITE_ALTER_TABLE`, `SQLITE_ATTACH`, `SQLITE_PRAGMA`.

---

## 4. Frontend Component Hierarchy

The frontend follows modular feature-driven architecture:

- `src/components/layout/`:
  - `AppShell`: Responsive navigation container with collapsible sidebar.
  - `Sidebar`: 5-section navigation hierarchy (Workspace, Data, BI, Operations, Admin).
  - `Topbar`: Global search trigger, period selector, user avatar, and notification shortcut.
  - `CommandPalette`: `Ctrl+K` searchable modal.
- `src/components/ui/`: Standard design tokens including `Button`, `Card`, `StatCard`, `ChartCard`, `Dialog`, `Tabs`, `Badge`, `Skeleton`, `EmptyState`.
- `src/features/`: Dedicated screen implementations for Auth, Onboarding, Overview, AI Analyst, Data Sources, Data Explorer, SQL Workspace, Knowledge Base, Glossary, Dashboards, Reports, Schedules, Agent Runs, Team, Settings, and Audit Logs.

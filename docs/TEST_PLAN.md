# AnalystAI — Quality Assurance & Test Plan

This document details automated test suites, quality gates, and verification procedures for **AnalystAI**.

---

## 1. Automated Test Suite (Pytest)

All backend tests are located in `backend/app/tests/` and run using the canonical `.venv` environment against isolated test SQLite databases using `DirectClient`.

Execute the test suite from repository root:
```powershell
.\.venv\Scripts\python.exe -m pytest backend/app/tests -v
```

### Test Modules & Invariants Verified (22 Tests Total)

| Test Module | Test Cases | Invariants Verified |
|---|---|---|
| `test_settings.py` | 5 | - Verifies settings load from deterministic `backend/.env` path.<br>- Rejects SQLite database URL when `APP_ENV=production`.<br>- Rejects weak/short secrets (`< 32 chars`) in production.<br>- Confirms `__repr__` and `__str__` mask secret keys and passwords. |
| `test_health.py` | 1 | - Validates `/health` returns status `healthy`, server timestamp, app name, and version. |
| `test_auth.py` | 5 | - Validates pure `bcrypt` password hashing produces distinct non-plaintext hashes.<br>- Verifies correct credentials and rejects incorrect passwords.<br>- Tests legacy salted SHA-256 password migration and automatic rehash to bcrypt.<br>- Confirms expired JWT tokens are rejected with HTTP 401. |
| `test_data_sources.py` | 3 | - Tests data source registration and retrieval.<br>- Validates schema retrieval for analytical tables (`sales_orders`, `customers`, `products`, `regions`).<br>- Verifies diagnostic connectivity testing. |
| `test_knowledge.py` | 2 | - Tests document upload handling, text extraction, semantic chunking windows.<br>- Validates RAG retrieval test console queries. |
| `test_sql_safety.py` | 4 | - **Dual-Layer SQL Safety:** Rejects mutating queries (`DROP`, `ALTER`, `TRUNCATE`, `INSERT`, `UPDATE`, `DELETE`, `ATTACH`).<br>- Confirms read-only `SELECT` queries execute successfully.<br>- Validates truthful empty state reporting for zero-row queries (no fabricated rows).<br>- Validates unsupported or mock external connectors return explicit errors. |
| `test_analyst.py` | 2 | - Verifies end-to-end 9-step business analyst workflow execution.<br>- Validates prompt suggestions, dynamic chart recommendations, and analysis saving. |

---

## 2. Frontend Verification & TypeScript Checks

Executed via npm scripts:
```powershell
cd frontend
npm run build
```

- **TypeScript Compilation (`tsc -b frontend`):**
  - Project references configured with strict typing.
  - Zero `any` implicit parameters on callback handlers.
  - `src/vite-env.d.ts` supplies client-side environment typings (`ImportMeta.env`).
  - All component interfaces and API response shapes validated.
- **Production Asset Bundling (`vite build`):**
  - Outputs optimized static bundle into `frontend/dist/`.
  - Ensures all Tailwind utilities, Recharts visualizers, and Lucide icons package cleanly.

---

## 3. Manual Acceptance Matrix

| Verification Item | Acceptance Criteria | Verified Result |
|---|---|---|
| **Overview Screen** | Renders 4 KPI cards, historical revenue chart, regional attainment list, and insights. | **PASSED** |
| **AI Analyst Core Run** | Submitting a prompt initiates the 9-step timeline, outputs findings cards, visual charts, and verified SQL. | **PASSED** |
| **Data Explorer** | Navigating to `sales_orders` displays column data types, profiling metrics, and live rows preview. | **PASSED** |
| **SQL Workspace** | Running `SELECT * FROM sales_orders LIMIT 10` returns results; executing `DROP TABLE sales_orders` is blocked by safety validator. | **PASSED** |
| **Knowledge Base** | Ingests uploaded `.txt`/`.csv`/`.pdf` files, generates semantic chunks, and allows RAG retrieval test queries. | **PASSED** |
| **Business Glossary** | Allows searching and adding terms with SQL formulas and data steward assignments. | **PASSED** |
| **Custom Dashboards** | Creating and opening a dashboard renders interactive Recharts widgets. | **PASSED** |
| **Executive Reports** | Generates multi-section narrative reports with Markdown export capability. | **PASSED** |
| **Command Palette** | Pressing `Ctrl+K` opens universal modal for global entity search and page shortcuts. | **PASSED** |

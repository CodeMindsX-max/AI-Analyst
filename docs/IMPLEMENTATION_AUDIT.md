# AnalystAI — Implementation & Repository Stabilization Audit

**Audit Date:** 2026-11-09  
**Auditor / Role:** Senior Software Architect & Lead Full-Stack / Security Reviewer  
**Repository:** `AI Analyst`  
**Target Goal:** Stabilization, separation of concerns, security hardening, and testable foundation without destroying working functionality or fabricating unfinished capabilities.

---

## 1. Existing Architecture Summary

The repository contains a full-stack enterprise data analyst application:
- **Frontend:** React 18, TypeScript, Tailwind CSS, Recharts, Vite (`frontend/`). Includes a multi-feature application shell (`AppShell`, `Sidebar`, `Topbar`, `CommandPalette`) and 19 feature routes (Overview, AI Analyst, Data Sources, Data Explorer, SQL Workspace, Knowledge Base, Glossary, Dashboards, Reports, Saved Analyses, Schedules, Agent Runs, Notifications, Team, Settings, Audit Logs, Auth, Onboarding).
- **Backend:** FastAPI (Python 3.11) with modular routing (`app/api/v1/`), domain services (`app/services/`), Pydantic v2 schemas (`app/schemas/`), and SQLAlchemy 2.x ORM models (`app/models/`).
- **Database Responsibilities:**
  1. *Application Database:* Intended for PostgreSQL (e.g. Supabase) storing users, workspaces, agent run events, dashboards, reports, and audit logs.
  2. *Analytical / Customer Data Sources:* External business databases (PostgreSQL, Oracle, SQL Server, MySQL, and a seeded SQLite demo warehouse `analystai_analytics.db`).
- **Tooling:** Root Python virtual environment (`.venv`), Alembic migrations configured under `backend/migrations/`, frontend package management in `frontend/package.json`.

---

## 2. Baseline Commands & Outcomes

| Command | Working Directory | Outcome | Root Cause / Notes |
|---|---|---|---|
| `git status --short` | Repo Root | Clean baseline with pending changes to config, session, health, main, requirements | Untracked prompt & docs files |
| `.\.venv\Scripts\python.exe --version` | Repo Root | `Python 3.11.0` | Root `.venv` exists and is functional |
| `.\.venv\Scripts\python.exe -m pytest app/tests` | `backend` | **FAILED (AttributeError)** | `AttributeError: 'Settings' object has no attribute 'BASE_DIR'` in `sqlite_demo_connector.py:36` |
| `tsc -b frontend` | Repo Root | **FAILED (7 errors)** | Missing `ImportMeta.env` typing in `http.ts`, missing `ChartCard` import in `AnalystPage.tsx`, implicit-any in `DashboardViewerPage.tsx` |
| `git check-ignore -v backend/.env` | Repo Root | Ignored (`.gitignore:57`) | `backend/.env` is not tracked in Git |

---

## 3. Confirmed Issues & Findings

1. **`Settings` missing `BASE_DIR`:** `backend/app/core/config.py` had commented-out code and omitted `BASE_DIR`, which caused `sqlite_demo_connector.py` and other services to crash immediately with an `AttributeError`.
2. **Ambiguous `DATABASE_URL` Validation:** `DATABASE_URL: str` in `config.py` lacked a default value and failed if no environment variable was loaded, preventing clean development and test runs.
3. **Application & Analytical Metadata Entanglement:** Both application tables (`users`, `workspaces`, etc.) and analytical demo tables (`sales_orders`, `customers`, etc.) inherited from the same `Base` in `app/db/base.py`, causing `init_db.py` to create both sets of tables on both databases.
4. **Startup Auto-Seeding & Swallowed Errors:** `main.py` ran `seed_all()` automatically in its `lifespan` handler and caught all exceptions with a generic log message, masking database connectivity failures.
5. **Incomplete Alembic Configuration:** `backend/migrations/env.py` imported only `workspace`, leaving all other application models unregistered, and `backend/migrations/versions/` had zero migration revisions.
6. **Corrupted / Mixed Dependency Declarations:** Root `requirements.txt` mixed a `pip freeze` dump with unpinned requirements, was UTF-16 encoded, and `backend/requirements.txt` was deleted.
7. **Insecure Password Hashing:** `app/core/security.py` used salted SHA-256 (`hashlib.sha256`), failing enterprise security requirements for bcrypt/Argon2.
8. **Insecure Frontend Auth Fallback:** `frontend/src/app/providers.tsx` silently defaulted to a fake Admin user (`user-demo-admin`) in the `catch` block of `/auth/me`, bypassing authentication on server failure.
9. **Unprotected Frontend Routes:** `frontend/src/components/layout/AppShell.tsx` did not verify authentication state or redirect unauthenticated visitors.
10. **Fabricated Analytical Fallback in Agent:** `analysis_service.py` and `agent_orchestrator.py` substituted hardcoded synthetic figures and fabricated rows rather than honestly reporting zero rows or query errors.
11. **Hardcoded Telemetry & Fake Evidence:** Agent execution events and evidence cards contained hardcoded strings rather than reflecting actual database execution results.
12. **Unused Source ID in Execution:** `sql_execution_service.py` ignored the selected data source and solely executed queries against SQLite.
13. **Placeholder Document Extraction:** `document_service.py` returned simulated text strings for PDF and DOCX uploads that were indexed into the knowledge base as if they were real content.
14. **Frontend TypeScript Build Errors:**
    - `frontend/src/api/http.ts`: missing Vite `ImportMeta.env` typing.
    - `frontend/src/features/analyst/AnalystPage.tsx`: `ChartCard` used without being imported.
    - `frontend/src/features/dashboards/DashboardViewerPage.tsx`: implicit-any parameters on line 175.
15. **Inconsistent Demo Credentials:** README documented `admin123456`, whereas `seed.py` seeded `AnalystAI123!`.

---

## 4. Issues That Could Not Be Verified

- **Live Supabase PostgreSQL Connectivity:** Cannot be verified without network credentials for the user's private Supabase instance. A dedicated development fallback and connection verification interface is provided.
- **External Warehouse Drivers (Oracle, Snowflake, BigQuery):** Production drivers require proprietary client libraries or cloud warehouse credentials.

---

## 5. Files Intentionally Preserved / Left Unchanged

- Pre-existing frontend UI components, styling tokens (`frontend/src/styles/tokens.css`, `globals.css`), and visual layouts are preserved.
- Existing database tables in `backend/data/analystai_analytics.db` are preserved.
- Seed data structures are preserved while separating execution into explicit commands.

---

## 6. Mandatory Security Actions for the Developer

1. **Rotate Credentials:** Any database password, secret key, or token that existed in `backend/.env` before this audit must be treated as potentially compromised and rotated immediately in the Supabase dashboard.
2. **Never Commit `.env`:** Ensure `backend/.env` remains ignored by Git and never committed.
3. **Set a Strong `SECRET_KEY`:** Generate a high-entropy secret (e.g. `openssl rand -hex 32`) for `backend/.env`.

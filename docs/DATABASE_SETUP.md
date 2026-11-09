# AnalystAI — Database Architecture & Setup Guide

This guide details the database architecture of **AnalystAI**, including the separation between the central application database and external analytical data sources, local SQLite development configuration, Supabase PostgreSQL configuration, DBeaver connection setup, and safe Alembic migration workflows.

---

## 1. Architectural Database Separation

AnalystAI enforces a strict architectural boundary between two distinct database domains:

```
+-----------------------------------------------------------------------------------+
|                                     AnalystAI                                     |
+-----------------------------------------------------------------------------------+
|  A. Application Database                          B. Analytical Data Sources       |
|  (ApplicationBase)                                (AnalyticsBase / Connectors)    |
|                                                                                   |
|  - Engine: PostgreSQL (Supabase / local SQLite)    - Engine: SQLite (Demo Warehouse)|
|  - Metadata: Users, Orgs, Data Sources, Sessions,  - External: Postgres, Oracle,    |
|    Agent Runs, RAG Documents, Glossary, Reports    MySQL, SQL Server (Customer DBs)|
|  - Managed by: Alembic Migrations                  - Managed by: Read-Only Connectors|
|  - Session: sessionmaker(bind=application_engine)  - Session: Independent per-query  |
+-----------------------------------------------------------------------------------+
```

### A. Central Application Database (`ApplicationBase`)
- **Purpose**: Stores application state, user accounts, authentication credentials, audit logs, workspace definitions, registered datasource configurations, saved analyses, dashboards, and agent telemetry.
- **ORM Base**: `app.db.base.ApplicationBase` in `backend/app/db/base.py`.
- **Target Systems**: Production uses PostgreSQL (e.g. hosted on Supabase); local development and test automation support SQLite (`sqlite:///./data/analystai.db`).
- **Schema Management**: Managed exclusively by **Alembic**. Never invoke `Base.metadata.create_all()` in production environments.

### B. Analytical Data Sources (`AnalyticsBase` & External Connectors)
- **Purpose**: Represents external customer or enterprise data warehouses queried by AnalystAI's AI analyst and SQL workspace.
- **ORM Base**: `app.db.base.AnalyticsBase` in `backend/app/db/base.py` (anchoring models like `SalesOrder`, `Customer`, `Product`, `Region`).
- **Demo Warehouse**: Local SQLite database populated with realistic synthetic enterprise sales data (`sqlite:///./data/analystai_analytics.db`).
- **External Connectors**: PostgreSQL, MySQL, SQL Server, and Oracle connectors configured via registered `data_sources` entries.
- **Safety Boundary**: AnalystAI connects to analytical sources with strictly read-only permissions, query timeouts, and AST/authorizer guards. Analytical tables are **never** managed by application Alembic migrations.

---

## 2. Local Environment Setup

### 2.1 Prerequisites
- Python 3.11+ installed.
- Canonical virtual environment at repository root: `.venv`.

### 2.2 Activate Environment
```powershell
# Windows PowerShell (Repository Root)
.\.venv\Scripts\Activate.ps1

# Linux / macOS
source .venv/bin/activate
```

### 2.3 Verify Installed Dependencies
Ensure backend dependencies are installed:
```powershell
pip install -r backend/requirements.txt
```

---

## 3. Configuration & Environment Variables

Application configuration is loaded deterministically from `backend/.env` via `pydantic-settings` in `backend/app/core/config.py`.

### 3.1 Initial Setup from Template
Copy the template to create your local `.env`:
```powershell
cp backend/.env.example backend/.env
```

### 3.2 Development Mode (Default: Local SQLite)
For instant local offline development and automated testing:
```ini
APP_NAME=AnalystAI
APP_ENV=development
DEBUG=true
API_V1_PREFIX=/api/v1
SECRET_KEY=dev-secret-key-replace-in-production-must-be-at-least-32-chars-long!
DATABASE_URL=sqlite:///./data/analystai.db
ANALYTICS_DATABASE_URL=sqlite:///./data/analystai_analytics.db
ACCESS_TOKEN_EXPIRE_MINUTES=480
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

> [!NOTE]
> Never commit `backend/.env` or any file containing real passwords to version control. The `.gitignore` file is configured to exclude all `.env` files.

---

## 4. Connecting to Supabase PostgreSQL

To run AnalystAI against a cloud-hosted Supabase PostgreSQL instance:

### 4.1 Obtain Connection String from Supabase Dashboard
1. Log into [Supabase](https://supabase.com/dashboard) and open your project.
2. Navigate to **Project Settings** -> **Database**.
3. Under **Connection string**, select **URI**.
4. Choose either:
   - **Direct Connection** (Port 5432): `postgresql+psycopg://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres?sslmode=require`
   - **Transaction Pooler** (Port 6543): Use this if deploying to serverless environments.

> [!IMPORTANT]
> - URL-encode special characters in your password (e.g., `#`, `@`, `!`, `%`) using `urllib.parse.quote_plus()`.
> - Always specify `sslmode=require` for hosted PostgreSQL.
> - Ensure the driver prefix is `postgresql+psycopg://` to match `psycopg` (v3) in `requirements.txt`.

### 4.2 Update `backend/.env`
```ini
APP_ENV=development
DATABASE_URL=postgresql+psycopg://postgres.YOUR_PROJECT_REF:YOUR_ENCODED_PASSWORD@[YOUR_POOLER_HOST].supabase.com:6543/postgres?sslmode=require
ANALYTICS_DATABASE_URL=sqlite:///./data/analystai_analytics.db
```

---

## 5. DBeaver Connection Instructions

To inspect and manage tables visually using DBeaver:

### 5.1 Connecting to Supabase PostgreSQL
1. Open DBeaver and select **New Database Connection** -> **PostgreSQL**.
2. Enter the connection settings:
   - **Host**: `[YOUR_POOLER_HOST].supabase.com` (or your project's direct host)
   - **Port**: `6543` (for pooler) or `5432` (for direct)
   - **Database**: `postgres`
   - **Username**: `postgres.YOUR_PROJECT_REF`
   - **Password**: `[YOUR-PASSWORD]`
3. In the **SSL** tab:
   - Check **Use SSL**.
   - SSL mode: `require`.
4. Click **Test Connection**, then **Finish**.

### 5.2 Connecting to Local SQLite Warehouses
1. Select **New Database Connection** -> **SQLite**.
2. Set path to:
   - Application DB: `<repo-root>/data/analystai.db`
   - Analytical Warehouse: `<repo-root>/data/analystai_analytics.db`
3. Click **Test Connection**, then **Finish**.

---

## 6. Alembic Migration Workflow

AnalystAI uses Alembic to manage all schema revisions for `ApplicationBase`.

### 6.1 Inspecting Current Schema State
From the `backend/` directory:
```powershell
cd backend
python -m alembic current
python -m alembic history
```

### 6.2 Generating a New Migration Revision
When you add or update models in `backend/app/models/`:
1. Verify the model is imported in `backend/migrations/env.py` and inherits from `ApplicationBase`.
2. Generate an autogenerated revision:
   ```powershell
   python -m alembic revision --autogenerate -m "add_table_or_column_description"
   ```
3. **Inspect the generated script** in `backend/migrations/versions/`. Ensure it only affects application tables and does not drop unrelated database objects.

### 6.3 Applying Migrations
```powershell
python -m alembic upgrade head
```

### 6.4 Baseline Precautions & Production Safeguards
> [!WARNING]
> - **Always backup your database** before running `alembic upgrade head` in staging or production.
> - If an existing database already has tables created outside Alembic, do not generate a migration that attempts to recreate them. Use `alembic stamp head` to mark the existing schema as up-to-date without re-executing DDL statements.
> - Never run destructive operations (`DROP TABLE`, `TRUNCATE`) without explicit verification and backup.

---

## 7. Seeding Development Data

Development seeds populate realistic mock users, glossary items, and analytics records.

### 7.1 Running the Seed Script
Execute the seed script from the repository root:
```powershell
.\.venv\Scripts\python.exe -m backend.app.db.seed
```

This creates:
- **Application Database**:
  - Demo Admin: `admin@analystai.local` / `AnalystAI123!`
  - Demo Analyst: `demo@analystai.local` / `AnalystAI123!`
  - Demo Viewer: `viewer@analystai.local` / `AnalystAI123!`
  - Default workspace, business glossary terms, sample dashboards, and reports.
- **Analytics Warehouse (`analystai_analytics.db`)**:
  - 4 geographic regions (`North America`, `EMEA`, `APAC`, `LATAM`).
  - 10 SaaS product tiers and add-ons.
  - 20 corporate enterprise customer accounts.
  - 250+ historical sales orders with real monetary amounts, dates, and discounts.

---

## 8. Summary: Application DB vs. Customer Data Sources

| Dimension | Application Database (`ApplicationBase`) | Analytical Data Sources (`AnalyticsBase`) |
|---|---|---|
| **Location** | `DATABASE_URL` (Supabase / SQLite) | `ANALYTICS_DATABASE_URL` (SQLite demo) / External URLs |
| **Schema Owner** | Alembic migrations (`backend/migrations/`) | External customer database owner / seed script |
| **Permissions** | Read / Write (Application operations) | Strictly Read-Only (AST & authorizer guarded) |
| **Lifespan** | Persistent application metadata | External business datastores |
| **Models** | `User`, `Workspace`, `DataSource`, `AgentRun`, etc. | `SalesOrder`, `Customer`, `Product`, `Region` |

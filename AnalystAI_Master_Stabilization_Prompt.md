# AnalystAI --- Master Repository Stabilization & Integration Prompt

**Target tool:** Google Antigravity\
**Target repository:** The existing `AI Analyst` project folder\
**Execution style:** One bounded implementation pass, with verification
and documentation\
**Primary objective:** Turn the existing AI-generated starter repository
into a coherent, runnable, testable foundation without destroying
working features or pretending unfinished AI capabilities are
production-ready.

------------------------------------------------------------------------

# 0. Your role and operating instructions

Act as a senior software architect, staff-level full-stack engineer,
database engineer, application-security reviewer, and technical
documentation lead.

You are working inside an **existing repository** named `AI Analyst`.
This is not a greenfield project. You must inspect the repository before
changing anything and preserve its existing architecture, frontend
screens, useful services, naming conventions, and working functionality
wherever possible.

The product is **AnalystAI**, a business data analyst application with a
React/TypeScript frontend and a FastAPI/Python backend. Its intended
long-term capabilities include:

-   Connecting to business databases such as PostgreSQL, Oracle, SQL
    Server, and MySQL.
-   Discovering database schemas and profiling data.
-   Natural-language business questions and Text-to-SQL.
-   Retrieval-augmented generation (RAG) over business documents and
    glossary terms.
-   Agentic analysis workflows.
-   Charts, dashboards, reports, saved analyses, and scheduled jobs.
-   User, workspace, team, audit, and access management.

The current repository already contains a substantial UI and backend
foundation. Do not replace it with a new template.

## Non-negotiable rules

1.  **Inspect before editing.** Read the actual files and trace imports,
    configuration, startup, API routes, models, frontend routes, and
    tests.
2.  **Make changes in the current repository.** Do not create a parallel
    project or duplicate backend.
3.  **Preserve the frontend's existing design and screens.** Do not
    redesign the application unless a small change is necessary to
    repair a broken interaction.
4.  **Do not invent successful functionality.** A mock, stub,
    deterministic rule, or placeholder must be labelled honestly in code
    and documentation.
5.  **Do not fabricate analytical results.** Empty query results,
    connection failures, or missing data must remain empty/error states.
    Never substitute fabricated business rows.
6.  **Never expose secrets.** Do not print, copy, commit, or put real
    passwords, tokens, API keys, database URLs, wallet files, or secret
    keys into documentation, logs, test fixtures, frontend bundles, or
    Git.
7.  **Do not silently discard user data.** Never drop tables, reset a
    database, delete migration history, delete data files, or run
    destructive SQL without explicit approval.
8.  **Do not run database migrations against production or a user
    database automatically.** Generate and inspect migration scripts;
    explain the exact command the developer must run after backing up
    and verifying the target database.
9.  **Do not use `Base.metadata.create_all()` as the production
    schema-management mechanism.** Alembic owns application-schema
    changes.
10. **Use one Python virtual environment.** The intended environment is
    the repository-root `.venv`. Do not create another environment or
    delete an existing environment unless the user explicitly asks. If
    `backend/venv` exists, leave it untouched during this task and
    document that it is redundant; the developer can remove it after
    confirming it is not needed.
11. **Keep frontend package management separate.** Use the existing
    `frontend/package.json` and lockfile; do not install frontend
    dependencies globally.
12. **No unnecessary new frameworks.** Prefer the existing FastAPI,
    SQLAlchemy, Pydantic, Alembic, React, TypeScript, Vite, and current
    UI libraries.
13. **Do not upgrade every dependency indiscriminately.** Fix actual
    compatibility issues with the smallest justified changes.
14. **No broad rewrite.** Implement only the bounded stabilization work
    described below. Do not attempt to build the entire future
    LLM/RAG/agent product in this pass.
15. **Work in small, verifiable phases.** After each phase, run the
    relevant checks and repair regressions before proceeding.
16. If a requirement cannot safely be completed because credentials,
    cloud access, network access, or a decision is missing, implement a
    safe interface/configuration and document the exact manual step. Do
    not guess.
17. At the end, provide a concise report of changed files, commands run,
    test/build outcomes, remaining limitations, and manual steps.

------------------------------------------------------------------------

# 1. Repository context and initial known findings

Use these as audit leads, not as permission to assume the repository has
not changed. Re-check the current working tree before acting.

The repository has previously been observed to contain:

-   A React 18 + TypeScript + Vite + Tailwind + Recharts frontend.
-   A FastAPI backend with modular API routes, services, schemas,
    SQLAlchemy models, providers, and connectors.
-   Feature screens for authentication/onboarding, overview, AI analyst,
    data sources/explorer, SQL workspace, knowledge base, glossary,
    dashboards, reports, saved analyses, schedules, agent runs,
    notifications, team, settings, and audit logs.
-   An API client in `frontend/src/api/http.ts`.
-   Frontend routes in `frontend/src/app/router.tsx`.
-   Frontend providers in `frontend/src/app/providers.tsx`.
-   Backend settings in `backend/app/core/config.py`.
-   Database infrastructure in `backend/app/db/`.
-   SQLAlchemy models in `backend/app/models/`.
-   API endpoints in `backend/app/api/`.
-   Agent, Text-to-SQL, document, knowledge, SQL validation, and
    connector services.
-   Alembic initialized under `backend/migrations/`.
-   Existing docs under `docs/` and/or `backend/docs/`.
-   Existing tests under `backend/tests/`.

Previously observed issues to verify:

1.  `Settings` did not define `BASE_DIR`, although database/session or
    SQLite demo connector code referenced it.
2.  Application PostgreSQL and local analytical SQLite engines were not
    cleanly separated.
3.  `init_db.py` called `Base.metadata.create_all()` against both
    engines even though metadata included models with different database
    responsibilities.
4.  Startup seeded data and swallowed initialization errors, potentially
    allowing the server to appear healthy after database initialization
    failed.
5.  Alembic had no migration revision files, and `migrations/env.py`
    imported only a subset of model modules.
6.  `backend/requirements.txt` was missing in the uploaded archive; root
    `requirements.txt` appeared to mix package-freeze output with
    unpinned declarations and may have been UTF-16 encoded.
7.  Password hashing used salted SHA-256, despite stronger hashing being
    described in documentation.
8.  Frontend authentication provider appeared to fall back to a
    hardcoded demo administrator if `/auth/me` failed.
9.  Frontend route protection needed verification.
10. Agent orchestration used deterministic/template logic, included
    hardcoded telemetry/evidence, and could substitute fabricated rows
    after empty query results.
11. Text-to-SQL used keyword/template rules rather than a genuine LLM.
12. RAG embeddings/vector storage were mock implementations; business
    knowledge retrieval used lexical matching.
13. PDF/DOCX extraction had placeholder behavior.
14. SQL validation relied heavily on regex/token checks and was not
    sufficient as a universal external-database security boundary.
15. Query execution appeared to use a SQLite demo connector regardless
    of the selected external data source.
16. A prior frontend build reported:
    -   Missing Vite `ImportMeta.env` typing in `src/api/http.ts`.
    -   `ChartCard` used without import in `AnalystPage.tsx`.
    -   Two implicit-`any` parameters in `DashboardViewerPage.tsx`.
17. README demo credentials did not match the credentials created by
    seed logic.
18. A real `backend/.env` was present in the uploaded archive. Treat it
    as potentially compromised. Do not inspect or reproduce secret
    values. The developer must rotate any real credentials that were
    included in the archive.

Important: the current local repository may differ from the archived
version. Reconfirm all findings before applying fixes.

------------------------------------------------------------------------

# 2. Scope of this one-pass task

This task is a **repository stabilization and integration pass**, not
the final implementation of every AnalystAI feature.

## Included in this pass

A. Repository/configuration cleanup (without destructive deletion).\
B. One consistent Python interpreter/environment strategy.\
C. Correct backend settings and safe environment loading.\
D. Clean separation between the application database and
analytical/customer data sources.\
E. Correct SQLAlchemy session and engine management.\
F. Safe application startup and health checks.\
G. Alembic model registration and migration configuration.\
H. A first, minimal application-schema migration only if it can be
generated safely and reviewed.\
I. Authentication security corrections that can be made without changing
the product's intended auth contract.\
J. Removal of insecure hardcoded demo-auth fallback.\
K. Repair of known frontend TypeScript/build errors.\
L. Correct error/empty states and removal of fabricated analytical
fallback data.\
M. Tests for the repaired foundations.\
N. Accurate, complete developer documentation and `.env.example`
templates.

## Explicitly out of scope for this pass

Do **not** implement these large features now:

-   A production LLM provider or full model selection system.
-   Full LangGraph or multi-agent orchestration migration.
-   A production-grade Text-to-SQL reasoning engine.
-   Full RAG ingestion/retrieval with real embedding models.
-   Production hybrid search/reranking/evaluation.
-   Complete Oracle, SQL Server, MySQL and PostgreSQL customer connector
    implementations.
-   Production-grade multi-tenant billing.
-   Full dashboard/report/scheduler redesign.
-   Kubernetes, microservices, or a new cloud deployment architecture.
-   Replacing the existing frontend design.
-   Rewriting every service or every endpoint.

Instead, ensure existing interfaces and mock components are clearly
marked as mocks and fail safely. Add TODOs only where a real future
implementation is required. Do not falsely mark future features as
complete.

------------------------------------------------------------------------

# 3. Phase 0 --- Establish a safe baseline

Before editing:

1.  Confirm the repository root.
2.  Run `git status --short` and identify pre-existing user changes. Do
    not overwrite or discard them.
3.  If Git is initialized, create a safety branch or commit only if this
    can be done without including secrets. Do not force-push or rewrite
    history.
4.  Inspect the repository `.gitignore`.
5.  Find all `.env` files by filename, but do not print their contents.
6.  Search for likely secrets in tracked files using safe redacted
    output. Do not display matching secret values.
7.  Identify generated folders (`.venv`, `venv`, `node_modules`, `dist`,
    `__pycache__`, `.pytest_cache`) and exclude them from source
    analysis.
8.  Inspect README, architecture docs, package manifests, dependency
    files, backend entry point, settings, database setup, model
    registry, Alembic config, auth implementation, frontend API client,
    providers, router, and test configuration.
9.  Record the existing baseline commands and results.

Create or update `docs/IMPLEMENTATION_AUDIT.md` with: - Date of audit. -
Existing architecture. - Baseline commands and outcomes. - Confirmed
issues. - Issues that could not be verified. - Files intentionally left
unchanged. - Security actions the developer must perform.

Do not claim tests pass unless they were actually executed successfully.

------------------------------------------------------------------------

# 4. Phase 1 --- Normalize repository configuration

## 4.1 Python environment

Use the existing root `.venv` as the canonical Python environment.

-   Do not create a new virtual environment.
-   Do not install packages globally.
-   Do not automatically delete `backend/venv`.
-   Ensure documentation and VS Code configuration point to
    `.venv/Scripts/python.exe` on Windows where appropriate.
-   Add equivalent Unix instructions to documentation.
-   Check Python version compatibility against the actual project
    dependencies.

The frontend continues to use Node/npm from `frontend/package.json`.

## 4.2 Dependency files

Inspect:

-   Root `requirements.txt`
-   `backend/requirements.txt`, if present
-   `backend/pyproject.toml`
-   `frontend/package.json`
-   Frontend lockfile

Establish one clear source of truth for backend runtime dependencies.
Prefer `backend/requirements.txt` if that matches the existing project
layout.

Requirements:

-   Do not put the output of `pip freeze` and hand-written package
    declarations into one malformed file.
-   Ensure the dependency file is valid UTF-8.
-   Keep runtime dependencies separate from development/test tools if
    practical.
-   Include dependencies actually imported by the backend, including
    `python-jose` if still required by the auth implementation.
-   Do not add packages that are not used.
-   Do not blindly upgrade packages.
-   Keep frontend lockfile consistent with `package.json`.
-   Document exact installation commands.

If root `requirements.txt` is currently used by deployment or tooling,
do not remove it without tracing its consumers. Either retain it as a
clearly documented pointer/compatibility file or make it a valid,
deliberate dependency file.

## 4.3 `.gitignore`

Ensure the root `.gitignore` excludes at minimum:

``` gitignore
.venv/
venv/
**/.venv/
**/venv/
node_modules/
dist/
__pycache__/
*.py[cod]
.pytest_cache/
.mypy_cache/
.ruff_cache/
.env
.env.*
!.env.example
*.log
```

Do not ignore: - Alembic migration scripts. - Source code. - Tests. -
Documentation. - Safe sample datasets intentionally tracked by the
project.

Do not blanket-ignore `backend/data/` until its contents are inspected
and classified.

## 4.4 Environment templates

Backend secrets/configuration belong in `backend/.env`, loaded only by
the backend.

Maintain `backend/.env.example` with placeholders only. It must never
contain real credentials.

Frontend public configuration belongs in `frontend/.env` and
`frontend/.env.example`, using only public `VITE_` variables such as the
API base URL. Never put database passwords, LLM API keys, signing keys,
Supabase service-role keys, or private credentials in frontend
variables.

Keep root `.env.example` only if the root tooling actually consumes it.
Otherwise document its role or remove it only after confirming it is
unused.

Suggested backend template (adapt to actual settings and existing auth
design):

``` env
APP_NAME=AnalystAI
APP_ENV=development
DEBUG=false
API_V1_PREFIX=/api/v1
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
SECRET_KEY=REPLACE_WITH_A_LONG_RANDOM_SECRET
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:5173
```

Do not add unused variables merely to make the template look complete.
The template must match the actual Settings class.

Important: - Use Pydantic Settings with a deterministic absolute path to
`backend/.env`, not a working-directory-dependent relative path. -
URL-encode credentials when using a URL string, or construct SQLAlchemy
URLs safely. - Do not log `DATABASE_URL` or secret values. - Never put
actual secrets in docs or generated reports.

------------------------------------------------------------------------

# 5. Phase 2 --- Repair backend settings and configuration

Inspect `backend/app/core/config.py` and all references to `settings.*`.

Create one consistent Settings class that:

-   Defines only real, used configuration values.
-   Includes `APP_NAME`, environment/debug configuration, API prefix,
    database URL, secret key, token expiry and CORS settings only if
    required by existing code.
-   Defines a reliable `BASE_DIR` or removes all obsolete references to
    it.
-   Uses a deterministic path to `backend/.env`.
-   Validates required production settings.
-   Does not use insecure hardcoded production secrets.
-   Has safe development defaults only where appropriate.
-   Does not expose secrets through repr/logging.

Search the complete backend for: - `settings.BASE_DIR` -
`settings.DATABASE_URL` - `settings.SECRET_KEY` - Any old SQLite path
setting - Any old `DATABASE_URL` name or alias - Any direct `os.getenv`
calls that conflict with Pydantic Settings

Update every caller consistently.

Do not leave commented-out obsolete configuration that creates
ambiguity. Remove obsolete code only after confirming it is unused.

Add tests for: - Settings load from the intended `.env` path. - Required
settings validation. - Missing production secret rejection. - No
accidental secret logging.

------------------------------------------------------------------------

# 6. Phase 3 --- Correct database architecture

This is a critical architectural task.

AnalystAI has two different database responsibilities:

## A. Application database

The central application database is PostgreSQL (currently Supabase in
development).

It stores AnalystAI's own data:

-   Users and authentication-related records.
-   Organizations, memberships, workspaces and roles.
-   Registered data-source metadata (not plaintext passwords).
-   Schema discovery metadata.
-   Conversations and messages.
-   Agent runs, steps and tool-call metadata.
-   Document metadata and chunks.
-   Embedding vectors and business glossary data.
-   Query execution metadata and saved results.
-   Analyses, dashboards, reports, schedules, notifications and audit
    logs.

## B. Customer/analytical data sources

These are external databases selected by the user:

-   PostgreSQL
-   Oracle
-   SQL Server
-   MySQL
-   SQLite demo database where explicitly configured

They contain the customer's business data. They must not be confused
with AnalystAI's application database.

## 6.1 Separate SQLAlchemy metadata ownership

Inspect all model modules and identify which models belong to:

1.  Application PostgreSQL metadata.
2.  Demo/analytical SQLite metadata, if the demo database genuinely
    needs ORM-managed tables.

Do not blindly run the same `Base.metadata.create_all()` against both
engines.

Preferred approach: - One declarative base/metadata for application
tables. - A separate declarative base/metadata only if the local demo
analytical database genuinely requires ORM models. - If the demo
connector uses a prebuilt SQLite file or raw SQL schema, keep it
independent of the application ORM metadata.

Name the bases clearly, for example: - `ApplicationBase` -
`AnalyticsBase` (only if needed)

Avoid ambiguous names such as `Base` if multiple metadata domains exist.
If changing the existing name would cause excessive churn, keep `Base`
as the application base and create a clearly named separate base for
analytics.

Do not move or delete model classes until their imports, relationships
and consumers have been traced.

## 6.2 Application engine and sessions

The application engine must use the configured PostgreSQL
`DATABASE_URL`.

Use SQLAlchemy 2.x patterns.

Requirements: - `pool_pre_ping=True`. - Sensible configurable pool
sizing. - `SessionLocal` with `autoflush=False`, `autocommit=False`, and
explicit transaction handling. - `get_db()` dependency that always
closes the session. - Avoid creating multiple engines on every
request. - Do not create a global connection per API request. - Do not
print credentials. - Handle database connection errors with safe
messages.

If Supabase transaction pooler is used, document the relevant connection
mode and limitations. Do not assume port 5432 if the developer uses a
pooler. Use the exact host, port, username and SSL settings from the
developer's connection string.

## 6.3 Analytical connector lifecycle

The SQLite demo connector and future external database connectors must
be independent from the application session.

-   Use a connector factory or existing provider abstraction.
-   Select connector by the registered data-source type.
-   Do not silently execute every user's query against SQLite.
-   Do not silently fall back to a different data source if a connection
    fails.
-   Make source selection explicit and verify ownership/authorization.
-   Close external connections reliably.
-   Use read-only credentials for customer databases.
-   Enforce query timeouts and result-size limits where supported.
-   Do not store plaintext connection passwords in application tables.
-   Design credential storage around encryption/secret management, but
    do not invent a weak encryption scheme. If no key-management
    solution exists, implement a safe interface and clearly block
    persistence of plaintext credentials.

## 6.4 Database initialization

Inspect `backend/app/db/init_db.py` and application startup.

-   Remove broad `create_all()` calls for application production schema.
-   Do not run Alembic migrations automatically in application startup.
-   Do not silently swallow database initialization failures.
-   Do not seed demo users automatically in production.
-   If seed data is required, make it an explicit development-only
    command.
-   Do not create a default admin with a hardcoded password in
    production.
-   Provide explicit CLI/script instructions for development seed data.
-   Ensure startup failure or degraded health is visible and logged
    safely.

The application must not report itself healthy if the application
database is unavailable.

## 6.5 Health endpoints

Provide separate, truthful health endpoints if appropriate:

-   `/health/live`: process is alive; no database dependency.
-   `/health/ready`: checks required application dependencies.
-   `/health/database`: performs a minimal database connectivity check.

Do not return database passwords, host credentials, stack traces, or
sensitive internal details in public responses.

Add tests for success and database failure.

------------------------------------------------------------------------

# 7. Phase 4 --- Repair Alembic properly

Inspect:

-   `backend/alembic.ini`
-   `backend/migrations/env.py`
-   `backend/migrations/versions/`
-   All application model modules and relationships.

Requirements:

1.  Alembic must target only the application database metadata.
2.  Import/register every application model before autogeneration.
3.  Do not include SQLite demo/analytics models in application
    migrations.
4.  Use the Settings database URL safely without putting it into source
    control.
5.  Handle URL percent characters safely.
6.  Keep migration scripts under version control.
7.  Add a documented migration workflow.
8.  Do not delete migration history.
9.  Do not use autogenerate output without reviewing it.

Commands to document:

``` powershell
# From backend directory, with root .venv active
alembic revision --autogenerate -m "descriptive migration name"
alembic upgrade head
alembic current
alembic history
```

Before generating a first migration: - Confirm all application model
imports. - Confirm the target database is the intended development
database. - Inspect whether tables already exist in Supabase. - If the
database already contains tables, do not generate a migration that
blindly recreates them. Explain and implement an appropriate
baseline/stamping strategy only after checking the actual schema. - Do
not execute migrations against production automatically.

If the first migration can be safely generated against a clean
development database, generate it and review it. Otherwise prepare the
migration configuration and document the exact safe manual procedure.

Do not generate a huge initial migration from incomplete or unverified
metadata.

------------------------------------------------------------------------

# 8. Phase 5 --- Authentication and authorization safety

Inspect the existing auth contract end-to-end: - User model. - Password
schema. - Auth service. - Token generation/verification. - Auth
endpoints. - Frontend API client. - `AppProviders`. - Frontend router
and protected routes. - Seed/demo logic. - Tests.

## 8.1 Password hashing

Salted SHA-256 is not a suitable password hashing algorithm.

Use a maintained password hashing library and a modern password hashing
algorithm such as Argon2id or bcrypt, based on compatible dependencies
already in the project.

Requirements: - Use per-password salts through the library. - Use a
verification function. - Support safe rehashing when parameters change
if practical. - Never log or return passwords or password hashes. - Do
not silently invalidate existing users without a migration strategy. -
If old SHA-256 hashes exist, implement a safe legacy
verification-and-rehash flow only if the current stored format can be
identified reliably. Otherwise document the required password reset. -
Update tests.

## 8.2 JWT/token handling

-   Use the existing intended JWT contract unless it is demonstrably
    broken.
-   Require a strong secret from environment configuration.
-   Do not ship a hardcoded secret.
-   Validate token expiry and signature.
-   Validate the expected algorithm explicitly.
-   Keep token payload minimal.
-   Never put passwords, API keys or sensitive business data in token
    claims.

## 8.3 Remove fake frontend authentication

The frontend must not assign a hardcoded demo administrator when
`/auth/me` fails.

Correct behavior: - If a valid session exists, load the real user. - If
unauthenticated, show the login state or redirect to login. - If the
backend is unavailable, show a meaningful service/network error state. -
Do not confuse a network failure with a valid authenticated session. -
Do not grant access to protected routes by default.

Add route guards according to the existing router structure. Preserve
the existing login and onboarding UI.

## 8.4 Demo credentials

Search README, seed scripts, tests and docs for demo credentials.

-   Remove inconsistent or hardcoded credentials from production
    documentation.
-   If a development demo user is needed, document that the seed command
    creates it and make the credential configurable.
-   Never put a real password into Git.
-   Clearly label development-only demo access.

------------------------------------------------------------------------

# 9. Phase 6 --- Correct agent and analytical result behavior

Do not implement a full LLM agent in this task. Repair the current
deterministic workflow so that it is honest, safe, and testable.

Inspect: - Agent orchestrator. - Planner. - Text-to-SQL service. - SQL
validator. - SQL execution service. - Analysis/synthesis service. - API
response schemas. - Frontend analyst page and result components.

Requirements:

1.  The selected data source must be passed through the workflow and
    used by the connector factory.
2.  If a selected data source is unavailable, return a clear error; do
    not silently use SQLite.
3.  If the query returns zero rows, return an empty result with an
    explanation. Never fabricate rows.
4.  Remove hardcoded evidence, fabricated data coverage, fake execution
    duration, and misleading telemetry.
5.  If a metric is unknown, represent it as unknown/null or omit it. Do
    not invent it.
6.  Label keyword/template Text-to-SQL as a deterministic demo
    implementation.
7.  Ensure generated SQL is validated before execution.
8.  Restrict execution to read-only operations.
9.  Add result row limits, query timeout support where available, and
    safe error mapping.
10. Do not claim regex checks alone make SQL safe.
11. Make the current SQL validation limitations explicit.
12. Keep a clear interface boundary so a future AST-based, dialect-aware
    validator can be added.
13. Ensure the frontend displays loading, empty, failure, and success
    states distinctly.
14. Never show stale or fabricated charts after an execution failure.

Where a full safe implementation cannot be completed for every database
dialect, block unsupported execution rather than pretending it is safe.

------------------------------------------------------------------------

# 10. Phase 7 --- Correct RAG/document mock boundaries

Do not add paid API keys or implement a full production RAG pipeline in
this pass.

Inspect: - Document upload API. - Document service. - File extraction
utilities. - Chunking service. - Embedding provider. - Vector store
provider. - Knowledge retrieval. - Business glossary retrieval. -
Document/chunk models. - Frontend knowledge-base states.

Requirements:

1.  Verify accepted file types and validate actual MIME/content, not
    only filename extensions.
2.  Enforce upload size limits.
3.  Store uploaded files outside public frontend assets.
4.  Sanitize filenames and prevent path traversal.
5.  Do not execute macros, formulas, embedded scripts, or uploaded
    content.
6.  Implement real TXT and CSV extraction if currently straightforward.
7.  For PDF/DOCX, either implement extraction using existing installed
    dependencies or clearly report unsupported extraction. Never return
    a fake successful extraction.
8.  If embedding/vector providers are mocks, label them as mocks.
9.  Do not persist fake embeddings as if they were production
    embeddings.
10. Ensure retrieval returns source metadata and document references
    when available.
11. If no documents are indexed, return a clear empty knowledge-base
    response.
12. Keep interfaces ready for future real embedding and vector
    implementations.

Add tests for invalid extension, oversized file, empty file, malformed
file and successful supported extraction.

------------------------------------------------------------------------

# 11. Phase 8 --- Repair frontend build and API behavior

Inspect the complete frontend before changing it.

Previously reported build problems to verify:

-   `frontend/src/api/http.ts`: missing `ImportMeta.env` typing.
-   `frontend/src/features/analyst/AnalystPage.tsx`: `ChartCard` missing
    import.
-   `frontend/src/features/dashboards/DashboardViewerPage.tsx`:
    implicit-any parameters.

Fix the actual current errors, not just these remembered examples.

Requirements:

1.  Add the correct Vite environment type declaration file if missing,
    usually `frontend/src/vite-env.d.ts` containing:

    ``` ts
    /// <reference types="vite/client" />
    ```

2.  Fix missing imports.

3.  Correct TypeScript parameter types based on the actual data
    contracts.

4.  Avoid `any` unless there is a justified, documented boundary.

5.  Ensure API base URL comes from a public Vite environment variable
    with a safe local development default.

6.  Centralize API error handling in the existing API client.

7.  Handle 401, 403, 404, 422, 500 and network errors consistently.

8.  Do not leak backend stack traces to users.

9.  Do not expose secret environment variables in the frontend.

10. Preserve existing layout, visual design, navigation, and reusable
    components.

11. Verify all routes compile.

12. Ensure empty/loading/error states do not display fake business data.

Do not replace the frontend with a generic dashboard template.

------------------------------------------------------------------------

# 12. Phase 9 --- Testing requirements

Run tests using the existing root `.venv` Python interpreter.

At minimum, add or update tests for:

## Backend configuration/database

-   Settings load correctly.
-   Missing required production secret is rejected.
-   Database session closes.
-   Health endpoint succeeds when database is available.
-   Health endpoint reports failure safely when database is unavailable.
-   Application metadata is separate from analytics metadata.
-   Alembic can import all intended application models.

## Authentication

-   Password hash is not plaintext.
-   Correct password verifies.
-   Incorrect password fails.
-   Expired/invalid JWT fails.
-   `/auth/me` rejects unauthenticated requests.
-   Frontend does not silently authenticate on API failure.

## SQL/agent behavior

-   Unsupported data source returns an error.
-   Selected source reaches the connector factory.
-   Read-only policy rejects writes and DDL.
-   Empty query result remains empty.
-   Failed query does not return fabricated data.
-   SQL validation failure prevents execution.

## RAG/document behavior

-   Unsupported file rejected.
-   Oversized upload rejected.
-   Empty/malformed document handled.
-   Supported TXT/CSV extraction returns actual content.
-   Empty vector index returns no fabricated results.
-   Mock provider clearly identifies itself as mock.

## Frontend

Run the existing package scripts. At minimum: - TypeScript check. -
Production build. - Existing lint/test commands, if defined.

Do not invent npm scripts. Inspect `package.json` and run the scripts
that exist.

## Verification commands

Use the actual package scripts and configuration. Typical commands may
be:

``` powershell
# From repository root
.\.venv\Scripts\python.exe --version

# Backend tests (from backend)
pytest -q

# Backend compile check
python -m compileall app

# Alembic validation (from backend)
alembic current
alembic history

# Frontend (from frontend)
npm run build
```

If a command fails because a dependency is missing, distinguish: - code
failure, - environment/dependency failure, - external service/credential
failure.

Do not claim success when the command did not complete.

------------------------------------------------------------------------

# 13. Phase 10 --- Documentation must be updated

The documentation is part of the deliverable. A future developer should
be able to clone the project and understand how to set it up without
relying on chat history.

Inspect existing docs first and update them rather than creating many
duplicate documents.

At minimum, ensure the following documentation exists and is accurate:

## 13.1 Root `README.md`

Include: - What AnalystAI is. - Current implemented capabilities. -
Explicitly incomplete/mock capabilities. - Technology stack. -
Repository structure. - Prerequisites. - Local setup. - Backend
startup. - Frontend startup. - Test commands. - Environment
configuration links. - Database setup reference. - Troubleshooting. -
Security warning not to commit `.env`.

Do not claim all planned AI features are complete.

## 13.2 `docs/ARCHITECTURE.md`

Document: - Frontend architecture. - Backend layers. - API routing. -
Service boundaries. - Provider abstractions. - Application database
versus customer data sources. - Authentication flow. - Agent workflow
and current deterministic limitations. - RAG/document workflow and
current mock limitations. - Request lifecycle.

Include Mermaid diagrams if the existing documentation style supports
them.

## 13.3 `docs/DATABASE_SETUP.md`

Provide exact setup instructions: - Root `.venv` activation. -
Installing backend dependencies. - Supabase PostgreSQL project setup. -
Where to obtain connection information. - `backend/.env` creation. -
`.env.example` usage. - DBeaver connection steps. - SQLAlchemy
connection architecture. - Alembic
initialization/current/revision/upgrade workflow. - Existing
database/baseline migration precautions. - Backup warning before schema
changes. - SQLite demo database role, if retained. - How external
customer database connectors differ from the application database.

Never include real credentials.

## 13.4 `docs/DEVELOPMENT_GUIDE.md`

Include: - Project structure. - How to add an API endpoint. - How to add
a service. - How to add a SQLAlchemy model. - How to add a Pydantic
schema. - How to add a migration. - How to add a frontend
page/feature. - How to connect frontend to backend. - How to write and
run tests. - Logging and error-handling conventions. - Git workflow and
secret handling.

## 13.5 `docs/IMPLEMENTATION_STATUS.md`

Create a truthful matrix:

  -------------------------------------------------------------------------------
  Feature              Status            Evidence/notes         Next work
  -------------------- ----------------- ---------------------- -----------------
  Frontend shell       Actual verified   Relevant               Remaining work
                       status            route/components       

  Authentication       Actual verified   Tests and limitations  Remaining work
                       status                                   

  PostgreSQL           Actual verified   Connection/migration   Remaining work
  application DB       status            evidence               

  External connectors  Actual verified   Supported connectors   Remaining work
                       status                                   

  Text-to-SQL          Actual verified   Deterministic/LLM      Remaining work
                       status                                   

  RAG                  Actual verified   Mock/real retrieval    Remaining work
                       status                                   

  Agent orchestration  Actual verified   Current workflow       Remaining work
                       status                                   

  Dashboards/reports   Actual verified   Actual behavior        Remaining work
                       status                                   
  -------------------------------------------------------------------------------

Use statuses such as: - Implemented and tested - Implemented but not
integration-tested - Partial - Mock/demo - Not implemented - Blocked by
credentials/external service

Never mark a feature implemented and tested without evidence.

## 13.6 `docs/SECURITY.md`

Document: - Secret management. - Credential rotation after accidental
exposure. - Password hashing. - JWT configuration. - CORS. -
Authentication/authorization. - Customer database credential handling. -
Read-only query execution. - SQL safety limitations. - Upload
validation. - File storage. - Logging policy. - Database backups. -
Production deployment checklist.

## 13.7 `.env.example` files

Keep templates synchronized with actual configuration fields. Use
placeholders only.

## 13.8 Documentation consistency

Search and update any conflicting claims, particularly: - Demo
credentials. - Claims of bcrypt/Argon2 if the implementation differs. -
Claims of complete LLM/Text-to-SQL. - Claims of real embeddings/vector
search. - Claims of production-ready connectors. - Claims of passing
tests.

Do not copy stale implementation claims into the new docs.

------------------------------------------------------------------------

# 14. Phase 11 --- Final quality gate

Before declaring completion:

1.  Run backend import/compile checks.
2.  Run backend tests.
3.  Run Alembic validation.
4.  Run frontend TypeScript/build checks.
5.  Inspect `git diff`.
6.  Search for accidental secrets in changed/tracked files.
7.  Confirm `.env` is ignored.
8.  Confirm migration files are tracked and not ignored.
9.  Confirm no generated environment folders or `node_modules` were
    added to Git.
10. Confirm no unrelated UI redesign or mass formatting occurred.
11. Confirm no destructive database operation was executed.
12. Confirm all new docs match the actual implementation.

If any quality gate fails: - Fix it if within scope. - Otherwise
document the exact failure and cause. - Do not hide the failure or claim
the repository is fully working.

------------------------------------------------------------------------

# 15. Required final response from you (Antigravity)

When finished, provide a structured implementation report:

## A. Summary

What was repaired and what was deliberately left for future work.

## B. Files changed

List each created/modified/deleted file with a one-line reason.

## C. Database changes

Explain: - Application database engine. - Analytics/customer database
separation. - SQLAlchemy session behavior. - Alembic metadata and
migration state. - Whether a migration was generated or deliberately
deferred. - Any manual database operation still required.

## D. Authentication/security changes

Explain password hashing, token configuration, route protection, secret
handling, and limitations.

## E. Agent/RAG behavior

Clearly distinguish real functionality from mock/demo behavior.

## F. Verification results

Show actual commands and outcomes: - Backend tests. - Python
compilation/import. - Alembic checks. - Frontend build/type checking. -
Any failed or skipped checks and why.

## G. Manual steps for the developer

Provide exact commands and dashboard actions that still require the
developer's credentials or approval.

## H. Remaining roadmap

Prioritize remaining work without starting it in this task.

## I. Known limitations

List all known incomplete functionality and security caveats.

------------------------------------------------------------------------

# 16. Completion definition

This task is complete only when:

-   Existing repository structure is understood and preserved.
-   Configuration is consistent and secrets are not exposed.
-   The backend has one documented Python environment strategy.
-   Application database and analytical/customer data sources are
    correctly separated.
-   Database startup no longer creates the wrong schema in multiple
    databases.
-   Database failures are visible and not silently swallowed.
-   Alembic is configured against the correct metadata.
-   Authentication no longer grants a fake admin session on API failure.
-   Password storage uses an appropriate password-hashing approach or a
    documented safe migration path.
-   The agent does not fabricate query results or telemetry.
-   The frontend's known build/type errors are fixed.
-   Backend and frontend verification results are reported honestly.
-   Setup, database, architecture, security, and implementation-status
    documentation is updated.
-   No real credentials are committed or printed.
-   No destructive database operation has been run without approval.

**Do not attempt to finish the entire future AnalystAI product in this
task.** Deliver a stable, understandable, runnable foundation that the
developer can safely extend with genuine Text-to-SQL, RAG, and agentic
intelligence in later focused tasks.

Begin by inspecting the current working tree and repository. Then
execute the phases in order. Make the smallest coherent set of changes
that meets the completion definition.

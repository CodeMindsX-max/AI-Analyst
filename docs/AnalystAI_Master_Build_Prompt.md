# AnalystAI — Complete Full-Stack FYP Master Build Prompt

> **How to use this document:** Open an empty project folder in a repository-aware coding agent, paste the entire section named **MASTER PROMPT** into the agent, and let it create the project files in that folder. The agent must edit files, install dependencies, run checks, and fix errors—not merely return code snippets in chat. If your tool cannot fit the whole prompt in one message, attach this Markdown file as project context and tell it to follow it as the source of truth.
>
> **Product name:** AnalystAI  
> **Product category:** Agentic Business Intelligence / AI Business Data Analyst  
> **Academic context:** Final Year Project (FYP), with an NLP focus  
> **Delivery goal:** A complete, professional, runnable full-stack demo with realistic mock data and clearly marked extension points where the student will implement genuine NLP, RAG, agent, and live database capabilities later.

---

# MASTER PROMPT

## 0. Your role and execution contract

Act as a senior full-stack software architect, senior React/TypeScript engineer, senior Python/FastAPI engineer, product designer, UX architect, data engineer, AI/NLP engineer, QA engineer, and technical mentor. Build a coherent application in the currently opened workspace. Work as an implementation agent with filesystem and terminal access, not as a consultant who merely describes what should be done.

Your task is to create **AnalystAI**, a polished, end-to-end enterprise-style AI Business Data Analyst application. The deliverable must be runnable locally as a real application and must contain the frontend, backend, API client, data models, database setup, deterministic demo services, mock data, automated checks, developer documentation, and replaceable interfaces for later AI integrations.

### Non-negotiable execution rules

1. **Inspect before changing.** Inspect the existing workspace. If it already contains user work, preserve it and integrate carefully. Do not delete or overwrite unrelated files. If empty, create the repository structure specified below.
2. **Actually create files.** Do not respond with a plan, a tree only, pseudocode, or scattered snippets. Write the files into the workspace.
3. **Run and verify.** Install dependencies where permitted, run frontend and backend checks, launch or smoke-test the application where possible, and fix errors you discover. Do not claim a command passed unless you ran it and saw its result.
4. **Never leave the main experience as static screenshots.** Buttons, menus, tabs, filters, forms, dialogs, search, table actions, chart filters, save/export actions, onboarding, and navigation must have sensible working behavior in demo mode.
5. **Build one connected product.** Every page must share the same application shell, design tokens, component library, mock data conventions, API layer, and navigation model.
6. **Mock honestly.** When a feature is simulated, label it as demo/simulated. Never imply that a production database, live LLM, real embedding model, real OAuth integration, or real email service is connected when it is not.
7. **Do not require paid services to run the sample.** The default path must work without API keys, cloud accounts, external databases, or billing. Use seeded SQLite data and deterministic demo services.
8. **Separate demo implementations from future real implementations.** Put TODOs and integration instructions at clearly identified service/provider boundaries. Do not scatter TODOs throughout the UI or leave core page actions broken.
9. **Keep secret keys on the server.** Never place API secrets in frontend code, source control, static client bundles, or sample `.env` files.
10. **No false AI reasoning display.** Do not expose or invent hidden chain-of-thought. Show concise user-facing execution summaries, the tools used, the steps completed, query provenance, and evidence instead.
11. **Use maintainable files.** Avoid one enormous React component, one enormous Python router, duplicated layout shells, and hard-coded API calls embedded inside visual components.
12. **Do not stop for routine clarifications.** Make reasonable choices consistent with this specification and document any unavoidable limitation.
13. **Prioritize a running vertical slice.** If execution limits prevent every polish detail at once, get the whole app running first—shell, routes, seeded demo, core analyst flow, backend API, and error handling—then complete the remaining sections and re-run checks.
14. **No empty placeholders presented as finished screens.** Every required route must display a complete usable layout. It may use clearly identified demo behavior where production infrastructure is not yet wired.
15. **Deliver a final implementation report.** At the end, state which files were created, how to run the project, which checks were executed, which features are demo-only, and what the student should implement next. Be transparent about unverified checks.

## 1. Product vision

Build **AnalystAI**, an AI-powered Business Data Analyst workspace that lets business managers, analysts, and non-technical stakeholders ask questions about company data in natural language and receive explainable, evidence-linked analysis.

Example user question:

> “Why did revenue decrease in September compared with August? Break the change down by region and product category, and show the evidence.”

The intended eventual intelligence pipeline is:

1. Understand the question and identify the business task.
2. Retrieve relevant business definitions, KPI formulas, policies, and data dictionary content using a RAG-ready knowledge layer.
3. Retrieve database schema, table descriptions, join relationships, and column metadata.
4. Plan a bounded analysis using a controlled agent orchestrator.
5. Generate a candidate SQL query through an interchangeable Text-to-SQL provider.
6. Validate that the query is read-only, scoped to permitted data, syntactically valid, and subject to limits.
7. Execute it through a controlled database tool.
8. Analyze returned rows and metrics in a deterministic Python analysis service.
9. Produce suitable charts and data tables.
10. Create a clear natural-language business explanation with traceable evidence and sources.
11. Let the user save, export, share, schedule, and revisit the analysis.

**Important:** The first generated version must implement the UI and API flow with a deterministic mock provider that works without external models. Use the same interfaces that a real LLM, embedding model, vector index, database connection, and orchestration framework can implement later. The product should be architected to evolve—not falsely advertised as already having autonomous production AI.

## 2. Audience, personas, and key user journeys

### Primary personas

- **Business Manager:** asks business questions, reads trends, exports reports; does not want to write SQL.
- **Data Analyst:** explores schemas, inspects generated SQL, adjusts queries, validates results, builds dashboards.
- **Workspace Admin:** configures sources, glossary, users, access settings, and audit logs.
- **Student / FYP Evaluator:** needs to see the product’s NLP, RAG-ready retrieval, controlled agent workflow, Text-to-SQL, analytics, and evaluation roadmap in a clear demo.

### Primary journey A — first-time setup

Login → welcome → create/select workspace → connect demo dataset or upload CSV/XLSX → inspect profiling → see overview dashboard → ask a sample business question.

### Primary journey B — analyze a business question

AI Analyst empty state → enter question or choose suggestion → select date/source filters → submit → see agent status timeline → view answer/findings/charts/table → inspect SQL and evidence → save analysis → export or create report.

### Primary journey C — understand the data

Data Sources → add demo/file source → test/inspect connection → select dataset/table → Data Explorer → profile columns → inspect schema → edit business glossary terms.

### Primary journey D — knowledge/RAG management

Knowledge Base → upload permitted PDF/DOCX/TXT/CSV/XLSX → show processing/indexing states → view extracted text/chunk metadata → create glossary term → use these definitions in the demo analyst response. If real embeddings are not configured, display indexing as “Demo index” or “Mock retrieval”; never claim a real vector embedding was generated.

### Primary journey E — SQL and BI outputs

SQL Workspace → edit or generate a safe SELECT query → execute against the seeded local demo dataset → inspect rows/error/latency → save query. From an analysis, create dashboard widget/report, export data, and optionally schedule a simulated report.

### Primary journey F — governance and monitoring

Agent Runs → view run timeline and tool records → see success/failure states → inspect audit events → manage demo workspace members and AI configuration.

## 3. Technology decisions

Use this stack unless workspace constraints make it genuinely impossible. If you change a technology, record the reason in `docs/DECISIONS.md` and keep the replacement equally simple to run locally.

### Frontend

- React + TypeScript
- Vite
- React Router for routes
- Tailwind CSS for styling
- A reusable accessible component system; use shadcn/ui and Radix primitives where practical, or implement simple equivalent components consistently if setup is not compatible
- Lucide React icons
- Recharts for visualizations
- TanStack Table for advanced tabular views when beneficial; basic accessible tables are acceptable for simpler lists
- React Hook Form + Zod for forms where appropriate
- A lightweight toast/notification solution or an in-house reusable toast component
- `fetch`-based, centralized typed API client

### Backend

- Python 3.11 or 3.12 recommended (do not require Python 3.14-specific features)
- FastAPI
- Pydantic v2
- SQLAlchemy 2.x
- SQLite by default for a no-setup demo
- Alembic-ready database organization; use a simple working initialization/seed path even if full migrations are deferred
- `pandas` and `openpyxl` for small demo CSV/XLSX ingestion and analysis where suitable
- `python-multipart` for uploads
- `pytest` and FastAPI TestClient for backend tests
- Keep database access behind repository/service boundaries so SQLite can later be replaced by PostgreSQL

### Development runtime

- Frontend default: `http://localhost:5173`
- Backend default: `http://127.0.0.1:8000`
- API prefix: `/api/v1`
- Backend health endpoint: `/api/v1/health`
- Swagger/OpenAPI: `/docs`
- Vite dev proxy should route `/api` to the backend, avoiding CORS headaches during local development; also configure explicit development CORS correctly.

### Keep the dependency stack manageable

Do not add Redis, Celery, Kafka, Kubernetes, Docker, paid observability services, or external hosted databases as requirements for the first working version. You may document optional future additions, but the base app must run with a normal Python virtual environment and Node.js installation on a Windows laptop.

## 4. Demo-first architecture and configuration

Create an environment-based configuration system and safe defaults.

### Required behavior

- First launch automatically initializes the SQLite database and seeds realistic sample data if it is empty.
- The frontend can be explored without configuring a real model provider or database connector.
- Demo AI service produces deterministic, plausible responses and marks them as demo outputs.
- Seeded example data includes sales/orders, customers, products, regions, and monthly revenue/order values—enough to support revenue trend, regional comparison, product contribution, top product, and customer segment demos.
- Seed predictable, internally consistent totals and use these same figures across dashboard cards, charts, analysis results, table previews, and reports.
- Add a small `demo data` or `simulated` label wherever necessary to avoid confusing seed metrics with a real company’s data.
- Do not depend on internet access after dependencies have been installed.
- Do not add any real credentials, real customer PII, or secrets to demo data.

### Environment variables

Create `.env.example` files with safe non-secret defaults. At minimum document:

Backend:

- `APP_ENV=development`
- `DEMO_MODE=true`
- `DATABASE_URL=sqlite:///./data/analystai.db`
- `CORS_ORIGINS=http://localhost:5173`
- `UPLOAD_DIR=./data/uploads`
- `MAX_UPLOAD_MB=20`
- `MAX_QUERY_ROWS=500`
- `QUERY_TIMEOUT_SECONDS=5`
- `LLM_PROVIDER=mock`
- `EMBEDDING_PROVIDER=mock`
- `VECTOR_STORE_PROVIDER=mock`
- `LOG_LEVEL=INFO`

Frontend:

- `VITE_API_BASE_URL=/api/v1`

Do not ask the user to configure a secret for mock mode.

## 5. Required repository structure

Create a clean monorepo. You may refine the layout if needed, but preserve the separation of concerns and ensure every important module has a real implementation or a clearly documented extension interface.

```text
analystai/
├── README.md
├── .gitignore
├── .editorconfig
├── .env.example
├── package.json                    # optional root scripts; useful if implemented correctly
├── docs/
│   ├── PRODUCT_OVERVIEW.md
│   ├── ARCHITECTURE.md
│   ├── API_REFERENCE.md
│   ├── DATA_MODEL.md
│   ├── DEVELOPMENT_GUIDE.md
│   ├── AI_INTEGRATION_ROADMAP.md
│   ├── TEST_PLAN.md
│   ├── SECURITY_NOTES.md
│   └── DECISIONS.md
├── frontend/
│   ├── package.json
│   ├── package-lock.json           # generate using npm install when possible
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   ├── .env.example
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── app/
│       │   ├── router.tsx
│       │   ├── providers.tsx
│       │   └── routeConfig.ts
│       ├── api/
│       │   ├── http.ts
│       │   ├── types.ts
│       │   ├── authApi.ts
│       │   ├── dashboardApi.ts
│       │   ├── analystApi.ts
│       │   ├── dataSourcesApi.ts
│       │   ├── explorerApi.ts
│       │   ├── sqlApi.ts
│       │   ├── knowledgeApi.ts
│       │   ├── glossaryApi.ts
│       │   ├── reportsApi.ts
│       │   ├── agentRunsApi.ts
│       │   ├── schedulesApi.ts
│       │   ├── notificationsApi.ts
│       │   ├── settingsApi.ts
│       │   └── teamApi.ts
│       ├── assets/
│       ├── components/
│       │   ├── ui/                  # buttons, fields, dialog, drawer, badge, tabs, table, tooltip, etc.
│       │   ├── layout/              # AppShell, Sidebar, Topbar, Breadcrumbs, MobileNav
│       │   ├── charts/              # reusable chart primitives and legends
│       │   ├── data/                # data tables, filters, pagination, empty states
│       │   ├── analyst/             # question composer, plan timeline, insight cards, SQL/evidence panels
│       │   ├── agent/               # run timeline, tool event row, run status
│       │   ├── forms/               # common form controls and validation messages
│       │   └── feedback/            # toast, confirm dialog, loading, error boundaries
│       ├── features/
│       │   ├── auth/
│       │   ├── onboarding/
│       │   ├── overview/
│       │   ├── analyst/
│       │   ├── data-sources/
│       │   ├── data-explorer/
│       │   ├── sql-workspace/
│       │   ├── knowledge-base/
│       │   ├── glossary/
│       │   ├── dashboards/
│       │   ├── reports/
│       │   ├── saved-analyses/
│       │   ├── agent-runs/
│       │   ├── schedules/
│       │   ├── notifications/
│       │   ├── team/
│       │   ├── settings/
│       │   └── audit-logs/
│       ├── hooks/
│       ├── lib/                     # utils, formatters, validation, date helpers
│       ├── styles/
│       │   ├── globals.css
│       │   └── tokens.css
│       └── test/                    # frontend tests if configured
└── backend/
    ├── requirements.txt
    ├── pyproject.toml               # pytest/ruff config if used
    ├── .env.example
    ├── app/
    │   ├── __init__.py
    │   ├── main.py
    │   ├── core/
    │   │   ├── config.py
    │   │   ├── logging_config.py
    │   │   ├── security.py
    │   │   └── exceptions.py
    │   ├── api/
    │   │   ├── router.py
    │   │   └── v1/
    │   │       ├── __init__.py
    │   │       ├── health.py
    │   │       ├── auth.py
    │   │       ├── overview.py
    │   │       ├── analyst.py
    │   │       ├── data_sources.py
    │   │       ├── explorer.py
    │   │       ├── sql.py
    │   │       ├── knowledge.py
    │   │       ├── glossary.py
    │   │       ├── dashboards.py
    │   │       ├── reports.py
    │   │       ├── saved_analyses.py
    │   │       ├── agent_runs.py
    │   │       ├── schedules.py
    │   │       ├── notifications.py
    │   │       ├── team.py
    │   │       ├── settings.py
    │   │       └── audit_logs.py
    │   ├── db/
    │   │   ├── base.py
    │   │   ├── session.py
    │   │   ├── init_db.py
    │   │   └── seed.py
    │   ├── models/                  # SQLAlchemy models
    │   ├── schemas/                 # Pydantic request/response schemas
    │   ├── repositories/            # database persistence/query abstraction
    │   ├── services/
    │   │   ├── auth_service.py
    │   │   ├── overview_service.py
    │   │   ├── analyst_service.py
    │   │   ├── agent_orchestrator.py
    │   │   ├── schema_retrieval_service.py
    │   │   ├── business_knowledge_service.py
    │   │   ├── text_to_sql_service.py
    │   │   ├── sql_validation_service.py
    │   │   ├── sql_execution_service.py
    │   │   ├── analysis_service.py
    │   │   ├── chart_service.py
    │   │   ├── document_service.py
    │   │   ├── chunking_service.py
    │   │   ├── embedding_provider.py
    │   │   ├── vector_store.py
    │   │   ├── report_service.py
    │   │   ├── export_service.py
    │   │   ├── scheduling_service.py
    │   │   ├── notification_service.py
    │   │   └── audit_service.py
    │   ├── providers/
    │   │   ├── llm_base.py
    │   │   ├── mock_llm.py
    │   │   ├── embeddings_base.py
    │   │   ├── mock_embeddings.py
    │   │   ├── vector_store_base.py
    │   │   ├── mock_vector_store.py
    │   │   ├── database_connector_base.py
    │   │   └── sqlite_demo_connector.py
    │   ├── utils/
    │   │   ├── file_validation.py
    │   │   ├── csv_utils.py
    │   │   ├── sql_utils.py
    │   │   └── pagination.py
    │   └── tests/
    │       ├── conftest.py
    │       ├── test_health.py
    │       ├── test_auth.py
    │       ├── test_analyst.py
    │       ├── test_sql_safety.py
    │       ├── test_data_sources.py
    │       └── test_knowledge.py
    └── data/
        ├── .gitkeep
        └── uploads/.gitkeep
```

Do not generate meaningless empty modules just to match a tree. If a file is listed, it should contain working code, an explicit interface, or be removed from the tree and from all imports/docs. Do not leave import errors due to planned-but-absent files.

## 6. Application shell and global navigation

Create one persistent application shell for all authenticated routes:

- Collapsible left sidebar, with icon + label when expanded and icon + tooltip when collapsed.
- Top bar with workspace switcher, global search/command palette, breadcrumb/current page, help, notification button, and user menu.
- Main content region with consistent page title, subtitle, page actions, and responsive max-width behavior.
- Sidebar footer with current workspace, current user, demo-mode indicator, and settings link.
- Mobile/tablet navigation that remains usable at narrower widths. Desktop-first is appropriate because the product is a business analytics application.

### Navigation groups

**Workspace**
- Overview
- AI Analyst
- Saved Analyses

**Data**
- Data Sources
- Data Explorer
- SQL Workspace
- Knowledge Base
- Business Glossary

**Business Intelligence**
- Dashboards
- Reports
- Scheduled Jobs

**Operations**
- Agent Runs
- Notifications

**Administration**
- Team & Access
- Audit Logs
- Settings

All routes must work via sidebar links, refresh on deep-linked paths, browser back/forward, and appropriate breadcrumbs. The active route must be highlighted. Do not implement navigation elements as dead visual decoration.

## 7. Visual design system

Make the product feel like a mature commercial SaaS application: analytical, calm, clean, credible, and usable for long working sessions.

### Visual direction

- Light theme by default, optional dark theme if implemented cleanly.
- Neutral cool-gray canvas; white/light surface cards; deep navy/blue for structure; restrained indigo/blue accent for AI features.
- Green for success, amber for warning/running-attention, red for error/destructive, neutral gray for inactive.
- Avoid neon effects, gratuitous gradients, giant rounded cards, excessive glassmorphism, cartoon illustrations, and overly empty “AI landing page” layouts.
- Use an 8px-based spacing rhythm, clear typography hierarchy, moderate radii, subtle borders, and restrained shadows.
- Default desktop frame around 1440px wide. Ensure the product does not break at 1280px, 1024px, tablet width, and small mobile widths.
- Use readable numeric typography for KPIs and tables.
- Use proper skeletons while loading, helpful empty states, and inline validation.
- Charts must have labels/legends/tooltips where useful and accessible text equivalents.

### Design tokens

Centralize CSS variables for colors, spacing, radii, shadows, typography, borders, and focus rings. Avoid hardcoding arbitrary colors per component. Follow accessible color contrast and visible keyboard focus.

### Reusable UI primitives

Implement consistent reusable components: Button, IconButton, Input, PasswordInput, Textarea, Select, Combobox/SearchableSelect, Checkbox, RadioGroup, Switch, DateRangePicker or simple date controls, Tabs, Badge, Tooltip, Popover, DropdownMenu, Dialog, ConfirmDialog, Drawer/Sheet, Toast, Breadcrumb, PageHeader, Card, StatCard, Table, Pagination, SearchField, FilterBar, Skeleton, EmptyState, ErrorState, ProgressBar, StatusPill, CopyButton, CodeBlock, ChartCard, DataTable, SectionHeader, and FormField with error/help text.

Modals/drawers must be dismissible by appropriate controls, have correct focus behavior where practical, and use clear cancel/confirm actions. Destructive operations must ask for confirmation.

## 8. Screen and route inventory

Create all the following as actual navigable routes and reusable interaction patterns. Use the route names below as the baseline; small improvements are allowed if documented. The expected result is a broad application with real content and working demo actions, not a pile of empty templates.

### A. Authentication

Routes:
- `/login`
- `/signup`
- `/forgot-password`
- `/reset-password`
- `/verify-email`
- `/two-factor`

Requirements:
- Product logo/wordmark and concise value proposition.
- Email/password controls, show/hide password, remember-me where appropriate, validation, password reset link, demo login option.
- Demo credentials shown visibly in development/demo mode: `demo@analystai.local` / `AnalystAI123!`.
- The seeded demo login should actually work through the backend auth endpoint.
- Error/loading/success feedback.
- Signup and 2FA can use clearly labeled simulated flows; they must not pretend to send a real email or SMS.
- Protect private routes and redirect unauthenticated users to login.
- Use a `DemoAuthService` boundary. Document that the demo auth implementation is not production security and must be replaced before external deployment.

### B. Onboarding wizard

Routes:
- `/onboarding`
- optional nested query/state for the current step

Steps:
1. Welcome and product introduction.
2. Workspace name, organization, industry, and size.
3. Connect the demo dataset or upload CSV/XLSX.
4. Select business domain (Sales, Ecommerce, Finance, Marketing, Operations, HR, Other).
5. AI analyst defaults (answer style, visualization preference, evidence display, default comparison period).
6. Completion summary.

Requirements:
- Progress indicator, Back/Continue buttons, validation, ability to skip optional integrations, persistent form state while moving between steps.
- Finishing onboarding stores workspace preferences via API and routes to Overview.

### C. Overview dashboard — `/overview`

Design a polished executive dashboard with:
- Page title, current workspace, selected period, refresh control, Export button.
- KPI cards: Revenue, Orders, Customers, Conversion Rate, Gross Margin, Average Order Value. Each card includes a value, comparison delta, previous period label, and sparkline or mini trend where reasonable.
- Revenue-over-time line/area chart with period toggle.
- Revenue by region bar chart.
- Sales by category/product chart or table.
- AI-detected insights with severity, statement, supporting metric, period, “Investigate” action.
- Recent analyst questions/runs.
- Data source status cards including last refresh and demo/connected state.
- Recent and upcoming reports/schedules.
- Loading, empty, stale-data, and API-error states.

All dashboard visualizations must be based on a coherent seeded data contract returned by the API, not independent invented numbers per widget. Date/time formatting should be clear and consistent.

### D. AI Analyst — `/analyst`

This is the most important product area. Design it as an analytical workspace, not a generic chat clone.

Layout:
- Optional collapsible left pane for past analyses/conversations and saved prompts.
- Central analysis workspace with a question composer and results canvas.
- Optional right-side context/agent-activity/evidence panel with responsive collapse behavior.
- Top controls for data source, date range, region/product filters, and analysis scope.

Empty state:
- Ask-a-question input with placeholder: “Ask a business question about your data…”
- Example prompts: “Why did revenue drop last month?”, “Compare regional sales this quarter”, “Which products are growing fastest?”, “Show monthly revenue and order trends”, “Find customer segments with declining spend”.
- Explain that demo data is loaded if the sample dataset is active.

Question submitted state:
- Display user's question.
- Show a concise interpreted task summary and editable analysis scope.
- “Run analysis” and “Cancel” controls where applicable.

Running state:
- Use a visible status timeline with pending/running/completed/failed steps, not a fake spinner that never ends.
- Demo orchestration should complete predictably, either through a short simulated sequence or a backend run endpoint that returns a completed sample run. If there is a timer/streaming implementation, do not let it hang indefinitely.

Result state must contain:
1. Question and analysis metadata.
2. Executive answer.
3. Key finding cards with metrics and direction.
4. Charts suitable for the question.
5. Result data table with search/sort/pagination or a reasonable result preview.
6. “View SQL”/SQL tab showing the exact SQL or clearly labeled example query associated with the sample response.
7. “Evidence & sources” panel listing retrieved glossary definitions/document excerpts/schema details where available.
8. Data coverage: selected source, tables/columns used, row count, date range, last updated, execution duration when known.
9. Actions: Save analysis, Export, Share, Create dashboard widget, Create report, Ask follow-up, Copy answer.
10. Demo-mode label when the response is generated by a deterministic mock provider.

Follow-up questions should preserve the analysis context in the UI and create a separate analysis record where appropriate. A follow-up need not run a real LLM in demo mode; it must respond with coherent deterministic demo behavior.

### E. Agent activity side panel and run detail

Routes:
- `/agent-runs`
- `/agent-runs/:runId`

Timeline steps can include:
1. Understand user request.
2. Retrieve schema and table metadata.
3. Retrieve business definitions/knowledge.
4. Plan a bounded analysis.
5. Generate candidate SQL.
6. Validate query safety.
7. Execute query.
8. Analyze returned rows.
9. Prepare visualization and business explanation.

Each step shows status, short user-facing explanation, start/duration where available, tool/provider name, and expandable safe details. Do not present hidden chain-of-thought. Provide structured evidence and tool logs only.

Run list columns: run ID, question/task, user, start time, duration, status, tools count, source, and action menu. Filters: status, time period, owner. Support detail view for success and failure, including retry with demo behavior, copy run ID, inspect SQL, and export execution log.

### F. Data Sources

Routes:
- `/data-sources`
- `/data-sources/new`
- `/data-sources/:sourceId`

Source list/table/card data:
- source name, kind, status, host/database masked where relevant, number of tables, rows, last sync, owner, actions.
- source types: Demo Dataset, CSV, Excel, PostgreSQL, MySQL, SQL Server, Oracle, REST API, and generic warehouse.
- actions: View, Edit, Test Connection, Sync/Refresh, Disable/Enable, Delete.
- Include explicit status for unavailable live connectors (“Connector scaffold only” or “Not configured”), not a false “connected” state.

Add-source wizard:
1. Select connector type.
2. Enter configuration appropriate to the selected type. Database credentials must be masked and never logged.
3. Test connection.
4. Select schemas/tables.
5. Configure sync frequency (manual/hourly/daily/weekly) and timezone.
6. Preview detected tables and basic profiling.
7. Review and save.

For demo dataset and uploaded CSV/XLSX, implement actual sample workflows. For external database connector types, provide validation and a clear unconfigured/integration boundary unless the connector is genuinely implemented. Do not claim remote test success without a real connection.

### G. Data Explorer

Route: `/data-explorer`

UI:
- Left schema tree: source → database/schema → table → columns.
- Main content: table preview, column metadata, sortable rows.
- Search rows/columns, filter, pagination, sample size control.
- Tabs: Preview, Schema, Profiling, Relationships (relationships can be demo metadata).
- Profiling: inferred type, null count/percentage, distinct count, min/max/mean for numeric columns where applicable, frequent categories, sample values, duplicate/quality flags.
- CSV/XLSX-uploaded sources should appear in Explorer after import.
- Empty and unsupported-type states must guide the user back to connect/upload data.

### H. SQL Workspace

Route: `/sql-workspace`

Layout:
- Schema explorer on the left.
- Editor in the center; syntax-highlighted SQL editor if dependency support is stable, otherwise a well-styled code textarea with monospace text and formatting controls.
- Query results and execution metadata below.
- Optional AI SQL helper drawer on the right.

Actions:
- Run, Stop where feasible, Format SQL, Explain Query, Generate SQL from natural language, Save Query, Load Query, Clear, Copy.
- Query history table with execution time, returned rows, date, status.
- Results tab: table preview, row count, execution time.
- Error view: understandable error, query location if available, “Fix query” helper using deterministic suggestions.
- Seed example SELECT queries, but execute only against the sample SQLite database or approved source.

**SQL safety is mandatory:** only allow read-only queries in demo mode. Reject INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, ATTACH, DETACH, PRAGMA or multiple statements. Prefer parsing/validation using a reliable SQL parser if compatible, plus SQLite read-only connection/authorizer restrictions, row limits, and timeout. Do not execute arbitrary generated SQL against the app's own metadata database. Show a safe error instead of running prohibited statements. Document that live-connection isolation will need its own security review.

### I. Text-to-SQL demo

Can be implemented as a dedicated tab/route or as a specialized panel inside SQL Workspace. It must show:
- Natural-language question.
- Interpretation summary.
- Relevant schema evidence.
- Candidate SQL.
- Validation results.
- Execute action and resulting table/chart.
- Clear labels for mock SQL generation when no real language model is configured.
- No fabricated model confidence; omit confidence or label it as an illustrative demo score only if the implementation truly defines its calculation.

### J. Knowledge Base / RAG workspace

Routes:
- `/knowledge-base`
- `/knowledge-base/:documentId`

Overview table/cards:
- document name, type, owner, upload date, status, extracted characters/pages where available, chunk count, indexing mode (mock/real), last indexed, actions.
- Search, filter by status/type, upload documents, retry failed processing, delete with confirmation.

Upload dialog/wizard:
- file dropzone and browse button.
- supported formats PDF, DOCX, TXT, CSV, XLSX.
- enforce configured file size/type limit and explain errors.
- progress/status states: Uploaded → Extracting → Chunking → Indexing (Demo) → Ready or Failed.
- no false promise of OCR if no OCR is implemented; scanned image PDF should display a clear unsupported/no-extractable-text message.

Document detail:
- metadata and status.
- extracted text preview if actual extraction is available.
- chunks list with chunk number and metadata.
- retrieval preview/search panel.
- “Test retrieval” interaction showing matched chunks and match method (mock keyword/metadata retrieval until a real embedding provider is wired).

Design a provider interface so a real embedding model and vector database can be substituted later. In demo mode, implement useful lexical/keyword search rather than a blank result where reasonable; label it `Demo retrieval`.

### K. Business Glossary

Route: `/glossary`

Support create, view, edit, delete, search, filter, and detail drawer/modal.
Fields:
- term/name
- business definition
- synonyms
- formula/expression (optional)
- business domain
- source table(s)
- source column(s)
- owner/steward
- notes
- last updated

Seed definitions such as Revenue, Orders, Active Customer, Gross Margin, Average Order Value, Conversion Rate, and Churn Rate, with formulas consistent with demo dataset or clearly marked illustrative. The business-knowledge service used by the analyst should be able to retrieve these entries and show them in the result evidence section.

### L. Dashboards

Routes:
- `/dashboards`
- `/dashboards/new`
- `/dashboards/:dashboardId`
- `/dashboards/:dashboardId/edit`

Dashboard list:
- name, description, owner, last updated, widget count, visibility, actions.
- search, sort, create, duplicate, share, delete.

Dashboard viewer:
- title/description, date and business filters, refresh time, edit/share/export controls.
- KPI widgets, line/bar/area/donut charts, table widget, AI insight widget.
- each widget has a menu: view data, ask AI about chart, export, remove (edit mode), refresh.

Dashboard builder:
- choose/add KPI, chart, table, text, or AI insight widget.
- configure metric, dimension, aggregation, visualization, title, and filters.
- reorder widgets; drag-and-drop only if it can be made robust, otherwise use up/down controls.
- save changes through API.
- “Generate dashboard with AI” modal: natural-language dashboard request and a deterministic demo generated layout.
- Make sure builder actions actually update draft state and persist when saved.

### M. Reports

Routes:
- `/reports`
- `/reports/new`
- `/reports/:reportId`
- `/reports/:reportId/edit`

Report list: title, report type, period, owner, updated, status, schedule, actions.

Report builder:
- title, subtitle, audience, date range, business filters.
- configurable sections: Executive Summary, KPI Overview, Trends, Key Findings, Recommendations, Charts, Tables, Data Sources/Methodology.
- sections can be edited, added, removed, and reordered.
- AI generate/refresh content via deterministic demo report service; label simulated generation.
- preview page with printable layout.
- export PDF/CSV/JSON where working dependencies permit. If robust PDF generation is out of scope, provide a browser print stylesheet plus CSV export and document the limitation. Never show a nonfunctional export button.
- Share action should use application permissions/link simulation and not expose a public link unless actually implemented.

### N. Saved Analyses

Route: `/saved-analyses`

- searchable table/list of saved outputs: name, originating question, owner, created/updated time, source, tags, visibility.
- open, rename, duplicate, share, export, delete.
- saving an analysis from the Analyst flow must create a real persisted record in the demo database and it must appear here after page refresh.

### O. Scheduled Jobs

Route: `/schedules`

Create/edit schedule form:
- scheduled question/analysis/report
- data source
- frequency (daily/weekly/monthly/custom)
- time, timezone
- recipients (demo only unless email is wired)
- output type (in-app, CSV, PDF, dashboard)
- enabled/disabled status

List includes next run, last run, status, owner, actions. In demo mode, scheduling is stored and displayed; background execution/email must be labeled “not running automatically in demo mode” unless implemented.

### P. Notifications

Route: `/notifications`; topbar popover also links here.

Notification types: data import success/failure, source disconnected, scheduled report ready, unusual business trend, agent run failed/completed, document indexing finished, permission change. Include read/unread, mark all as read, open related resource, filters.

### Q. Team & Access

Route: `/team`

- Team member table: name, email, role, status, last active.
- Demo roles: Owner, Admin, Analyst, Viewer.
- Invite-member modal, edit role, deactivate/reactivate, remove with confirmation.
- Since demo auth is simplified, clearly indicate that role enforcement is simulated unless actual backend authorization is implemented. Nevertheless keep role fields and permission-check interfaces organized.

### R. Settings

Routes:
- `/settings/profile`
- `/settings/workspace`
- `/settings/ai`
- `/settings/data`
- `/settings/security`
- `/settings/notifications`
- `/settings/integrations`
- `/settings/appearance`

Implement a settings landing/nav and working forms for persisted demo preferences where sensible.

AI configuration fields:
- provider selector with Mock (enabled by default), future provider options marked unconfigured.
- response style: concise/analytical/executive.
- max output length.
- default chart preference.
- citation/evidence preference.
- retrieval top-k setting (documented as mock until real retrieval is active).
- tool allowlist toggles for schema retrieval, knowledge retrieval, SQL preview, SQL execution, Python analysis, chart generation, report generation.
- configurable SQL max row count.
- save/reset controls; invalid combinations must be validated.

Security/integration forms must never claim full enterprise security simply because a UI exists. Mark advanced SSO, external OAuth, secret vault, and external connector credentials as extension points if not implemented.

### S. Audit Logs

Route: `/audit-logs`

Table: timestamp, actor, action, resource type, resource ID, outcome, detail. Filters by date/action/actor/outcome. Seed useful audit events and append demo events on important actions such as login, upload, save analysis, delete, schedule update, and settings change. Avoid storing secrets or raw passwords in logs.

### T. Global search and command palette

Implement global search over available demo resources (routes, saved analyses, reports, dashboards, glossary terms, data sources, documents). Keyboard shortcut such as Ctrl/Cmd+K opens a command palette. If a complete cross-entity search service is too large, implement route/resource search with clear grouping and useful empty results.

### U. Mandatory dialogs, drawers, and popovers

Create functional reusable patterns for:
- Add/edit data source
- Test connection result
- Table selection
- Delete confirmation
- Upload document/file validation
- Create/edit glossary term
- Save analysis / name and tags
- Share item and choose role/scope
- Export settings
- Schedule analysis/report
- Invite member / role change
- AI dashboard generation
- Report generation options
- SQL query confirmation when needed
- Query error detail
- Agent run detail/evidence/SQL drawers
- Notification popover
- User menu/workspace switcher
- Discard unsaved changes confirmation
- Success/error/empty/loading states

Do not create a separate full route for trivial confirmations. Use a dialog, drawer, or popover consistent with its purpose.

## 9. NLP, RAG, Text-to-SQL, and Agent interfaces

This is an NLP FYP. The architecture must make its AI components easy for the student to study and replace one by one.

### Required provider interfaces

Create clear Python protocols/abstract base classes or typed service contracts for:

- `LLMProvider`: generate answer/structured output from a prompt/context.
- `EmbeddingProvider`: embed text for vector retrieval.
- `VectorStore`: upsert/search/delete document chunks.
- `DatabaseConnector`: list schemas/tables/columns, preview rows, execute permitted read-only query.
- `TextToSQLService`: map natural language + retrieved schema/business definitions to candidate SQL and a user-facing explanation.
- `AgentOrchestrator`: run a bounded sequence of registered tools and persist run events.
- `DocumentParser`: extract text/metadata from supported file types.

Provide working `Mock...` implementation classes for the default path. Keep dependency injection or provider selection centralized rather than imported directly in every router.

### Mock analyst flow must be demonstrable

- Accept a natural-language question, selected source, date range, and filters.
- Return a persisted run/analysis record.
- Produce structured progress events for the UI timeline.
- Select sensible sample SQL/analysis output according to basic intent keywords (revenue trend, regional performance, product performance, order count, customer segment, general exploratory query) or use a deterministic mock response.
- Include a concise answer, findings, metrics, chart configuration/data, result table rows, candidate SQL, query-safety outcome, source/tables, business definitions used, and run metadata.
- Use one consistent result schema across frontend/backend.
- Make the design explicitly replaceable by a real LLM provider and actual planner later.

### Explainability and evidence

Use structured evidence objects such as:

- `type`: `schema`, `glossary`, `document_chunk`, `query_result`, or `calculation`
- `title`
- `source_name`
- `source_id`
- `excerpt` or `description`
- `table_name` / `column_name` if applicable
- `url_or_location` if actually available
- `is_demo`

Do not invent page numbers, external citations, or document sources. If no document evidence exists, show schema/glossary/calculation evidence and say so honestly.

### Future real AI integration points

Write `docs/AI_INTEGRATION_ROADMAP.md` with specific steps for replacing:
1. Mock LLM with a chosen model API or local model.
2. Mock embeddings with a real text embedding model.
3. Mock vector retrieval with FAISS/Chroma/Qdrant or another selected vector store.
4. Keyword/demo document retrieval with embedding-based retrieval + optional reranking.
5. Mock Text-to-SQL with model-backed generation and schema grounding.
6. Simple mock orchestrator with a controlled tool-calling loop or framework such as LangGraph only if justified.
7. Demo SQLite-only connector with a safe, read-only connector for a selected external database.
8. Demo report generation with template-driven evidence and optional LLM-written prose.

Do not require LangChain, LangGraph, Transformers, vector DBs, or any paid APIs for the app's first launch. Do not add large ML downloads by default. The first version must run quickly on a normal laptop.

## 10. Backend REST API contract

Prefix all application endpoints with `/api/v1`. Use consistent Pydantic request and response models, sensible HTTP status codes, pagination for long lists, structured errors, and OpenAPI documentation.

At minimum implement endpoints aligned with these areas. You may combine minor endpoints but must not leave frontend calls without a backend contract.

### Health and auth

- `GET /health`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/forgot-password` (demo acknowledgement only)
- `POST /auth/reset-password` (demo acknowledgement only)

### Overview

- `GET /overview/summary`
- `GET /overview/revenue-trend`
- `GET /overview/region-performance`
- `GET /overview/insights`
- `GET /overview/recent-activity`

### Analyst

- `POST /analyst/runs`
- `GET /analyst/runs/{run_id}`
- `GET /analyst/runs/{run_id}/events`
- `POST /analyst/runs/{run_id}/follow-up`
- `POST /analyst/analyses/{analysis_id}/save` or a clean equivalent
- `GET /analyst/suggestions`

### Data sources and explorer

- `GET /data-sources`
- `POST /data-sources`
- `GET /data-sources/{source_id}`
- `PATCH /data-sources/{source_id}`
- `DELETE /data-sources/{source_id}`
- `POST /data-sources/{source_id}/test-connection`
- `POST /data-sources/{source_id}/sync`
- `POST /data-sources/upload` for CSV/XLSX upload if appropriate
- `GET /explorer/sources/{source_id}/tables`
- `GET /explorer/tables/{table_id}/schema`
- `GET /explorer/tables/{table_id}/rows`
- `GET /explorer/tables/{table_id}/profile`

### SQL workspace

- `POST /sql/validate`
- `POST /sql/execute`
- `POST /sql/format` (simple formatting is fine)
- `POST /sql/explain` (useful safe explanation)
- `GET /sql/history`
- `POST /sql/saved-queries`
- `GET /sql/saved-queries`

### Knowledge/RAG and glossary

- `GET /knowledge/documents`
- `POST /knowledge/documents/upload`
- `GET /knowledge/documents/{document_id}`
- `DELETE /knowledge/documents/{document_id}`
- `POST /knowledge/documents/{document_id}/reindex`
- `POST /knowledge/retrieval-preview`
- `GET /glossary`
- `POST /glossary`
- `GET /glossary/{term_id}`
- `PATCH /glossary/{term_id}`
- `DELETE /glossary/{term_id}`

### Dashboards and reports

- `GET /dashboards`
- `POST /dashboards`
- `GET /dashboards/{dashboard_id}`
- `PATCH /dashboards/{dashboard_id}`
- `DELETE /dashboards/{dashboard_id}`
- `POST /dashboards/{dashboard_id}/duplicate`
- `GET /reports`
- `POST /reports`
- `GET /reports/{report_id}`
- `PATCH /reports/{report_id}`
- `DELETE /reports/{report_id}`
- `POST /reports/{report_id}/generate`
- `GET /reports/{report_id}/export` or a documented export endpoint pattern

### Saved analyses, agent runs, schedules, notifications

- CRUD or equivalent endpoints for saved analyses.
- `GET /agent-runs`, `GET /agent-runs/{run_id}`, `POST /agent-runs/{run_id}/retry` where supported.
- CRUD endpoints for scheduled jobs; validate frequency/timezone.
- `GET /notifications`, `POST /notifications/{notification_id}/read`, `POST /notifications/read-all`.

### Team, settings, audit

- `GET /team`, `POST /team/invitations`, `PATCH /team/{member_id}`, `DELETE /team/{member_id}`.
- `GET /settings`, `PATCH /settings` (or subresource endpoints).
- `GET /audit-logs` with filters and pagination.
- `GET /search?q=...` for global search.

### API conventions

- Consistent response shapes and `created_at`/`updated_at` timestamps.
- ISO-8601 timestamps and explicit timezone handling.
- Pagination parameters for lists (`page`, `page_size`) with server-side maximum.
- Return empty arrays rather than `null` for collection fields.
- Structured error payload such as `{ "detail": "Human-readable explanation", "code": "VALIDATION_ERROR" }` without leaking internal secrets/stack traces.
- Make upload handling enforce extension, MIME/size checks, safe generated storage names, and no path traversal.
- Record audit events for key operations without logging passwords, tokens, or raw credentials.

## 11. Data model and persistence

Create SQLAlchemy models and Pydantic schemas appropriate to the actual features implemented. Avoid making one giant JSON blob the only persistence mechanism for everything.

Core entities should include, as applicable:

- User (demo auth)
- Workspace
- WorkspaceSetting
- DataSource
- UploadedDataset or table metadata
- AnalysisRun / AgentRun
- AgentRunEvent / ToolEvent
- SavedAnalysis
- QueryHistory / SavedQuery
- KnowledgeDocument
- DocumentChunk (for extracted text/chunk metadata; embeddings can be nullable/not stored in mock mode)
- GlossaryTerm
- Dashboard
- DashboardWidget
- Report
- ScheduledJob
- Notification
- TeamMember or workspace membership
- AuditEvent

The seeded analytics dataset may use separate SQLite tables such as `sales_orders`, `customers`, `products`, and `regions`. Choose column names and relationships carefully, document them in `docs/DATA_MODEL.md`, and use the same schema consistently in SQL examples, charts, glossary formulas, and Text-to-SQL examples.

Use database initialization/seeding that is idempotent. Do not duplicate seed data on every server reload. Store uploaded files under a configurable local data directory, not in the public frontend assets folder. Add the `data/` folder to `.gitignore` except safe `.gitkeep` files.

## 12. SQL execution and security constraints

The SQL engine is a high-risk boundary. Implement safer behavior even in demo mode.

- Default to a dedicated demo analytics SQLite database/connection, separated from metadata persistence if practicable.
- Only permit one read-only query at a time in demo mode.
- Allow SELECT and safe read-only CTE (`WITH ... SELECT`) patterns only.
- Reject multi-statement SQL and statement separators that could chain statements.
- Reject write/DDL/admin statements, extension loading, attach/detach, pragmas, and dangerous functions where possible.
- Run through a read-only connection or restricted authorizer and enforce timeout + row cap.
- Validate schema/table access against configured allowlists.
- Return safe, user-friendly validation reasons.
- Never pass an unvalidated model-generated SQL statement straight into execution.
- Never run user SQL against the app's administrative ORM database.
- Keep a clear abstraction for future credentials/connection pool/tenant scope; no real remote credentials required in demo mode.
- Write tests for malicious examples (DROP, DELETE, INSERT, multi-statement, PRAGMA, ATTACH, write CTE) and safe SELECTs.
- Treat this as a learning/demo baseline, not a complete production security guarantee, and state this in `docs/SECURITY_NOTES.md`.

## 13. File upload and document processing requirements

- Only accept the extensions configured for each screen.
- Validate extension, content type where feasible, file size, and generated destination name.
- Prevent path traversal and overwrites caused by user-supplied file names.
- Handle empty/corrupt files gracefully.
- Extract text from TXT, CSV, XLSX and DOCX/PDF using appropriate lightweight libraries if installed; if a library is optional or extraction fails, return a clear status/error rather than crashing.
- Do not run uploaded code or macros.
- Do not assume OCR exists for scanned PDFs.
- Use chunk metadata with document ID, filename, chunk index, and any available heading/page marker. Only display page numbers if extraction provides reliable page metadata.
- Mock embedding/vector search must be explicitly marked as mock. Keep real provider code behind an interface.

## 14. Frontend behavior and quality rules

- All route transitions work; no dead links.
- All async actions show loading, success, and error feedback.
- Use API calls for data rather than duplicating hard-coded frontend fixtures. Fixtures are acceptable only for static decorative config/suggested prompts; primary business data should come from backend endpoints.
- Use an API layer with typed requests/responses and a centralized error handler.
- Show an offline/API error state if FastAPI is not running; do not silently present old static data as current live API data.
- Forms have labels, validation, helper text, disabled/loading states, and success/error handling.
- Tables support search/filter/sort where useful, pagination for larger datasets, and empty results states.
- Destructive controls confirm first.
- Use optimistic UI only when errors can be rolled back or reported clearly.
- Use unique stable IDs/keys.
- Avoid `any` unless justified and isolated.
- Avoid unnecessary global state. Use React context/hooks for auth/workspace/theme and local state for page interactions; choose a small state library only if necessary.
- Make keyboard navigation usable, provide labels for icon-only buttons, and show focus outlines.
- Add error boundaries for frontend route-level rendering errors.
- Keep loading and error states visually consistent.
- Ensure chart tooltips, axes, and legend values correspond to actual chart data.
- Avoid lorem ipsum. Use realistic sample data and meaningful copy.

## 15. Demo behavior acceptance criteria

The application is not complete until a user can perform these local flows without adding an API key:

1. Start backend and frontend using documented commands.
2. Login using the demo credentials.
3. Complete or skip onboarding and land on Overview.
4. Browse overview KPIs and charts backed by API data.
5. Open Data Sources and see the seeded demo source.
6. Open Data Explorer, choose a seeded table, inspect columns, sample rows, and basic profiling.
7. Navigate to AI Analyst and submit “Why did revenue decrease in September?” or another suggested question.
8. See a deterministic agent run with meaningful timeline events.
9. See result summary, findings, chart(s), underlying data preview, SQL preview, evidence, and clear demo labels.
10. Save the analysis, refresh the page, and find it in Saved Analyses.
11. Open SQL Workspace, run a permitted SELECT, and see rows and execution metadata.
12. Try an unsafe query such as `DROP TABLE sales_orders` and see it rejected safely.
13. Upload a small valid CSV/XLSX if upload support is implemented, inspect the result/source; for unsupported/corrupt files see a friendly error.
14. Upload a text-bearing document and see extraction/chunk/retrieval preview behavior; if real embedding is unavailable, it must say mock/demo retrieval.
15. Create/edit/delete a glossary term and see the change persist.
16. Create a dashboard and add/edit a widget, then reload and see it persist.
17. Create and edit a report, preview it, and export in the supported format.
18. Create a scheduled job and see it in the jobs list, with clear demo-mode caveat about automatic execution.
19. Search the app using global search/command palette.
20. View agent run details and audit events.
21. Verify empty/error/loading states do not crash the app.

Where an item is too large to complete truly, do not fake production capability; implement an honest scoped version with a clear error/state and document exactly what is missing.

## 16. Testing and QA

Create automated tests and run them.

### Backend tests

At minimum:
- health endpoint responds.
- demo login succeeds and invalid credentials fail safely.
- overview endpoints return valid, internally consistent data.
- analyst run request returns the required result structure and persists run/events.
- saved analysis persistence works.
- glossary CRUD works.
- data source list and test-connection demo behavior are honest.
- SQL validation allows safe SELECT and rejects dangerous/multiple statements.
- upload validation rejects unsupported/oversize files and accepts a small valid fixture.
- knowledge retrieval returns a deterministic demo result when appropriate.

### Frontend validation

- Run `npm run build` (and lint/typecheck/test if defined).
- Confirm all route imports resolve.
- Check no console errors caused by failed API contracts.
- If the environment supports browser automation, smoke-test login → overview → analyst run → result → save → saved analyses; otherwise state that browser automation was not run.

### Code quality

- TypeScript strict mode preferred.
- Python type hints and small service functions.
- Avoid giant methods.
- Remove unused imports and dead references.
- Use Ruff/pytest if configured and possible.
- Do not suppress every type error with broad ignore directives.

## 17. Documentation files

### `README.md`
Must include:
- Product description and feature summary.
- Screens/module inventory.
- Prerequisites: Python version, Node.js version, npm.
- Windows PowerShell setup steps.
- macOS/Linux steps if practical.
- How to copy `.env.example` to `.env`.
- How to create/activate a Python virtual environment.
- How to install backend/frontend dependencies.
- How to seed/reset sample data.
- Exact run commands and local URLs.
- Demo login credentials.
- How to stop each server.
- Troubleshooting for port conflict, module not found, CORS, DB initialization, and frontend API connection.
- Clear demo vs. production feature list.
- No claims of production readiness for authentication/connectors/AI that aren't implemented.

### `docs/PRODUCT_OVERVIEW.md`
Problem statement, target users, goals, scope, out-of-scope items, use cases, success criteria.

### `docs/ARCHITECTURE.md`
Mermaid flow diagrams for frontend/backend, analyst/agent pipeline, data ingestion, RAG retrieval, SQL execution safety, and module boundaries.

### `docs/API_REFERENCE.md`
Main endpoint groups, request/response samples, status/errors, and how frontend client maps to API.

### `docs/DATA_MODEL.md`
Entities, relationships, demo business tables, field definitions, glossary formulas, seed-data assumptions.

### `docs/DEVELOPMENT_GUIDE.md`
Run/debug steps, folder organization, how to add a screen/API/service, how to add a new provider.

### `docs/AI_INTEGRATION_ROADMAP.md`
A beginner-friendly sequence for implementing real NLP, RAG, embeddings, retrieval evaluation, Text-to-SQL, safe query execution, agent tool calling, and final evaluation. Explain the specific files the student should change and the tests to run.

### `docs/TEST_PLAN.md`
Manual acceptance checklist, automated test commands, edge cases.

### `docs/SECURITY_NOTES.md`
Explicit limits of demo authentication, SQL execution, upload parsing, connector support, credential storage, tenancy, and what must be upgraded before deployment.

### `docs/DECISIONS.md`
Technology/design decisions and deviations from this prompt.

## 18. Required student fill-in-the-blanks markers

The point of this first version is that it should run now while giving the student an understandable place to implement real intelligence later.

Use a consistent TODO marker format, for example:

```python
# TODO(STUDENT): Replace this MockLLMProvider with a real provider.
# Contract: accept structured messages/context and return the typed response schema.
# Keep provider credentials in backend environment variables; never in frontend code.
```

Place meaningful student tasks specifically at:

- `backend/app/providers/mock_llm.py`: actual LLM provider integration.
- `backend/app/providers/mock_embeddings.py`: actual embedding model.
- `backend/app/providers/mock_vector_store.py`: actual vector index implementation.
- `backend/app/services/chunking_service.py`: evaluate chunk sizes/overlap for project dataset.
- `backend/app/services/business_knowledge_service.py`: replace mock lexical retrieval with actual RAG retrieval and reranking.
- `backend/app/services/schema_retrieval_service.py`: schema selection, join graph, and metadata retrieval.
- `backend/app/services/text_to_sql_service.py`: implement model-backed SQL generation, constrained decoding/prompting, and schema grounding.
- `backend/app/services/sql_validation_service.py`: expand validation/parser rules after threat review.
- `backend/app/services/agent_orchestrator.py`: implement a bounded planning/tool-calling loop and failure/retry policy.
- `backend/app/services/analysis_service.py`: integrate real metric computation and optionally Pandas workflows.
- `backend/app/providers/database_connector_base.py`: add one real read-only connector selected by the student.
- `backend/app/services/*` relevant tests: add evaluation cases and regression tests.
- `docs/AI_INTEGRATION_ROADMAP.md`: give exact learning and implementation order.

**Do not replace the working demo with blank `pass` statements.** Mock implementations must work, and TODOs should mark only the precise replacement points or advanced capabilities not yet implemented.

## 19. Implementation order inside this task

Execute in stages but continue until the project is in a coherent runnable state. Do not merely print this sequence and stop.

### Stage 1 — inspect and scaffold
- Inspect workspace and available runtimes.
- Create repo, configs, dependencies, README, docs skeleton.
- Set the package scripts and application entry points.

### Stage 2 — backend foundation
- Build configuration, database/session, models, schemas, seed data, core error handling, health/auth endpoints.
- Run backend tests and fix errors.

### Stage 3 — demo data and service contracts
- Implement overview queries, source metadata, table explorer, safe SQL, mock analyst/agent pipeline, persisted runs and saved analyses, knowledge/glossary basics.
- Add relevant unit/API tests.

### Stage 4 — frontend foundation and design system
- Create route configuration, auth/session context, AppShell, sidebar/topbar, reusable UI primitives, tokens, toast/error boundary, typed API client.
- Run frontend build and fix errors.

### Stage 5 — primary product journeys
- Complete Overview, AI Analyst, Data Sources, Data Explorer, SQL Workspace, Knowledge Base, Glossary, Saved Analyses.
- Connect screens to backend APIs.

### Stage 6 — BI/admin screens
- Complete Dashboards, Reports, Agent Runs, Schedules, Notifications, Team, Settings, Audit Logs, onboarding, auth secondary flows, modals and empty states.
- Ensure links/actions behave and persisted resources reload correctly.

### Stage 7 — verification and polish
- Install/test/build where environment allows.
- Fix runtime/type/import/API-contract problems.
- Review visual consistency and responsive behavior.
- Check acceptance criteria one by one.
- Update docs to reflect what truly works and what remains scaffolded.

## 20. Final response required from you, the coding agent

After editing files and running checks, respond with:

1. **What you built** — short feature summary and architecture.
2. **How to run it on Windows PowerShell** — exact commands, ordered, including virtual environment activation.
3. **URLs** — frontend, backend health, Swagger docs.
4. **Demo login** — email and password.
5. **Verification results** — exact tests/builds executed and their pass/fail status.
6. **Demo vs. real capabilities** — table clearly stating what is truly implemented, mocked, and not yet implemented.
7. **Next student tasks** — the first five practical tasks to replace mocks with real NLP/RAG/Text-to-SQL/agent behavior in a safe learning order.
8. **Known limitations** — do not conceal them.

Do not claim deployment or browser testing happened unless it actually did. Do not claim the AI is production-grade simply because the UI includes AI-related screens.

---

# Additional operating instructions for the coding agent

Treat this prompt as the product specification and source of truth. Keep the application consistent across pages. Before considering the task complete, read the acceptance criteria again, verify all main navigation routes, and inspect all import/dependency/build errors.

If this task cannot be completed fully in one execution due to context/runtime limits, **do not destroy or restart the project**. Preserve the files already created, update a `docs/IMPLEMENTATION_STATUS.md` checklist, complete the most important missing work next, and state the precise unfinished items. The first deliverable must still be a runnable demo as early as possible.

The project should serve both as a polished FYP prototype and as a learning codebase in which the student can understand and replace AI components incrementally. Optimize for correctness, transparency, modularity, usability, and a smooth local developer experience—not for the highest number of files or buzzwords.

# END MASTER PROMPT

---

## Recommended way to run this prompt

1. Create an empty folder named `analystai` on your computer and open that folder in a repository-aware coding agent.
2. Save this file in the folder or attach it as project context.
3. Ask the agent to **execute** the prompt: create files, install dependencies, run tests/build, repair errors, and return exact run steps. Do not ask it merely to “explain” the prompt.
4. If the agent stops after producing only the scaffold, give it this follow-up instruction:

   > Continue from the existing repository. Read `AnalystAI_Master_Build_Prompt.md` (or the attached master build prompt) and `docs/IMPLEMENTATION_STATUS.md` if present. Inspect the files and terminal output, identify the most important incomplete acceptance criteria, implement them directly, run the relevant checks, fix any regressions, and update the status checklist. Do not recreate the project or overwrite completed work.

5. Once it runs, commit the working baseline to Git before asking the AI to implement actual RAG, model API integrations, or external database connections.

## Important expectations

A comprehensive prompt is a specification, not a guarantee that any AI will generate a perfect, fully production-ready enterprise product in one pass. The correct target for this first generation is a **complete connected, runnable demo** with realistic screens and working mock flows. Real embeddings, a production agent loop, live database connectors, robust auth, background scheduling, email delivery, and deployment hardening should be implemented and tested as separate engineering milestones. This is not a weakness; it gives you a stable application that you can understand and improve without rebuilding the entire frontend each time.

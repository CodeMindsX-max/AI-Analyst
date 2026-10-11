# AnalystAI — REST API Reference Manual

Base URL: `http://127.0.0.1:8000/api/v1`  
All protected routes require standard HTTP header: `Authorization: Bearer <access_token>`.

---

## 1. Health & System
- `GET /health`: Basic service status check. Returns `{"status": "ok", "app": "AnalystAI", "version": "1.0.0"}`.

---

## 2. Authentication (`/auth`)
- `POST /auth/login`: Authenticate with email and password. Returns `{ "access_token": "...", "token_type": "bearer", "user": { ... } }`.
- `GET /auth/me`: Retrieve profile of currently authenticated user.
- `POST /auth/logout`: Revoke active session token.

---

## 3. Executive Overview (`/overview`)
- `GET /overview/summary?period=Q3%202026`: Returns macro business KPIs (revenue, gross margin, orders, AOV), revenue trend timeseries, regional attainment list, category sales breakdown, and automated business alerts.

---

## 4. AI Analyst (`/analyst`)
- `GET /analyst/suggestions`: Returns curated prompt suggestions across Revenue, Operations, and Regional domains.
- `POST /analyst/runs`: Launch 9-step agent workflow.
  - Request body: `{ "question": "Why did gross margin decline in August?", "source_id": "demo-source-1" }`
  - Returns complete `AgentRunResponse` including `events`, `candidate_sql`, `findings`, `charts`, and `evidence`.
- `GET /analyst/runs/{run_id}`: Retrieve past agent execution trace.
- `POST /analyst/analyses/{run_id}/save`: Bookmark insight to Saved Analyses collection with custom title and tags.

---

## 5. Data Sources (`/data-sources`)
- `GET /data-sources`: List registered enterprise analytical sources.
- `POST /data-sources`: Register new data connector.
- `POST /data-sources/{id}/test-connection`: Execute live connection diagnostics.
- `POST /data-sources/{id}/sync`: Trigger schema metadata introspection.
- `DELETE /data-sources/{id}`: Unregister data source.

---

## 6. Data Explorer (`/explorer`)
- `GET /explorer/sources/{source_id}/tables`: Return list of table names in target source.
- `GET /explorer/tables/{table_name}/schema`: Return detailed schema and column metadata.
- `GET /explorer/tables/{table_name}/rows?page=1&page_size=25`: Fetch paginated live rows from warehouse.
- `GET /explorer/tables/{table_name}/profile`: Return column distribution statistics (nulls, distinct values, min/max/mean).

---

## 7. SQL Workspace (`/sql`)
- `POST /sql/validate`: Inspect query string for AST validity and read-only compliance.
  - Body: `{ "query_sql": "SELECT category, SUM(revenue) FROM sales_orders GROUP BY category" }`
- `POST /sql/execute`: Execute validated read-only SQL with authorizer sandboxing. Returns `{ columns, rows, row_count, duration_ms }`.
- `POST /sql/format`: Automatically capitalize SQL keywords and format indentation.
- `POST /sql/explain`: Return SQLite query execution plan and table scan diagnostics.
- `GET /sql/history`: Fetch user query execution history.
- `GET /sql/saved-queries`: Fetch saved query snippets.
- `POST /sql/saved-queries`: Save query snippet to personal workspace.

---

## 8. Knowledge Base & RAG (`/knowledge`)
- `GET /knowledge/documents`: List uploaded knowledge documents.
- `POST /knowledge/documents/upload`: Upload `.txt`, `.md`, `.pdf`, or `.json` file for automatic parsing and semantic chunking.
- `GET /knowledge/documents/{id}`: Fetch document details, text preview, and extracted chunks.
- `DELETE /knowledge/documents/{id}`: Remove document and its chunks.
- `POST /knowledge/retrieval-preview`: Diagnostic tool for semantic search testing.
  - Body: `{ "query": "What is the return policy?", "top_k": 3 }`

---

## 9. Business Glossary (`/glossary`)
- `GET /glossary?search=...&domain=...`: Search and filter standardized metrics.
- `POST /glossary`: Create new glossary term with canonical definition, SQL formula, source tables, and steward.
- `GET /glossary/{id}`: Fetch glossary term details.
- `PATCH /glossary/{id}`: Update term attributes.
- `DELETE /glossary/{id}`: Delete term from catalog.

---

## 10. Dashboards (`/dashboards`)
- `GET /dashboards`: List dashboards.
- `POST /dashboards`: Create dashboard layout with widget array.
- `GET /dashboards/{id}`: Fetch dashboard layout and widgets.
- `PATCH /dashboards/{id}`: Update layout.
- `POST /dashboards/{id}/duplicate`: Clone existing dashboard.
- `DELETE /dashboards/{id}`: Delete dashboard.

---

## 11. Reports (`/reports`)
- `GET /reports`: List executive reports.
- `POST /reports`: Initialize report draft.
- `GET /reports/{id}`: Fetch report sections and findings.
- `POST /reports/{id}/generate`: Synthesize executive report sections from analytical warehouse.
- `GET /reports/{id}/export?export_format=markdown`: Export report formatted as Markdown.
- `DELETE /reports/{id}`: Delete report.

---

## 12. Operations & Administration
- `GET /schedules`: List cron automation jobs.
- `POST /schedules`: Schedule new recurring job.
- `DELETE /schedules/{id}`: Cancel scheduled job.
- `GET /notifications`: List workspace alerts.
- `POST /notifications/{id}/read`: Mark notification as read.
- `POST /notifications/read-all`: Mark all alerts as read.
- `GET /team`: List workspace members.
- `POST /team/invitations`: Invite new team member.
- `PATCH /team/{id}`: Update user role.
- `DELETE /team/{id}`: Remove member.
- `GET /settings`: Fetch workspace AI model and safety configurations.
- `PATCH /settings`: Update LLM provider, embedding model, and response style.
- `GET /audit-logs`: Fetch security audit trail.
- `GET /search?q=...`: Global search across all entities.

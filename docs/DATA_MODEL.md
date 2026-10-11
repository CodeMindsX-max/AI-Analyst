# AnalystAI — Data Models & Database Schema

AnalystAI cleanly isolates administrative application state from analytical warehouse data using two independent SQLite database files:

1. **`backend/analystai.db`**: Application metadata store (Users, Workspaces, Agent Runs, Saved Analyses, Glossary, Dashboards, Reports, Schedules, Audit Logs).
2. **`backend/analystai_analytics.db`**: Seeded enterprise data warehouse store (`sales_orders`, `customers`, `products`, `regions`).

---

## 1. Analytical Warehouse Store (`analystai_analytics.db`)

### `sales_orders`
| Column | Type | Description |
|---|---|---|
| `order_id` | VARCHAR(64) | Primary key (e.g., `ORD-2026-0001`) |
| `order_date` | DATETIME | Timestamp of order execution |
| `customer_id` | VARCHAR(64) | Foreign key referencing `customers.customer_id` |
| `product_id` | VARCHAR(64) | Foreign key referencing `products.product_id` |
| `region_id` | VARCHAR(64) | Foreign key referencing `regions.region_id` |
| `quantity` | INTEGER | Quantity units purchased |
| `unit_price` | FLOAT | Listed unit price |
| `discount` | FLOAT | Discount percentage (0.0 to 0.4) |
| `revenue` | FLOAT | Net revenue (`quantity * unit_price * (1 - discount)`) |
| `cost` | FLOAT | Cost of goods sold (COGS) |
| `margin` | FLOAT | Gross profit (`revenue - cost`) |
| `status` | VARCHAR(32) | Order status (`Completed`, `Pending`, `Refunded`) |

### `customers`
| Column | Type | Description |
|---|---|---|
| `customer_id` | VARCHAR(64) | Primary key |
| `company_name` | VARCHAR(255) | Client business name |
| `industry` | VARCHAR(128) | Client industry sector (`Healthcare`, `Financial Services`, etc.) |
| `tier` | VARCHAR(64) | Client segment (`Enterprise`, `Mid-Market`, `Growth`) |
| `region_id` | VARCHAR(64) | Region identifier |
| `country` | VARCHAR(128) | Country of incorporation |
| `signup_date` | DATETIME | Initial onboarding date |

### `products`
| Column | Type | Description |
|---|---|---|
| `product_id` | VARCHAR(64) | Primary key |
| `sku` | VARCHAR(64) | Stock Keeping Unit identifier |
| `name` | VARCHAR(255) | Commercial product name |
| `category` | VARCHAR(128) | Category (`Electronics`, `Enterprise SaaS`, `Consulting`, etc.) |
| `unit_cost` | FLOAT | Base unit production cost |
| `list_price` | FLOAT | Standard catalog price |

### `regions`
| Column | Type | Description |
|---|---|---|
| `region_id` | VARCHAR(64) | Primary key |
| `name` | VARCHAR(128) | Region name (`North America`, `Europe`, `Asia Pacific`, `Latin America`) |
| `quarterly_target` | FLOAT | Target revenue quota |
| `director` | VARCHAR(128) | Regional managing director |

---

## 2. Application Metadata Store (`analystai.db`)

### Authentication & Workspaces
- `users`: ID, email, hashed password, role (`Admin`, `Analyst`, `Viewer`), status.
- `workspaces`: ID, name, slug, owner ID.
- `workspace_settings`: AI provider, embedding provider, response style, top_k, max_sql_rows.

### Agentic Intelligence
- `agent_runs`: ID, question, task summary, duration_ms, source_id, synthesized SQL, created_at.
- `agent_run_events`: Event ID, run_id, step_index (0-8), step_name, status, tool_name, details (JSON), duration_ms.
- `saved_analyses`: Analysis ID, title, question, summary, SQL query, chart config (JSON), tags, owner, pinned flag.

### RAG & Glossary
- `knowledge_documents`: ID, name, file_type, size, chunk_count, indexing_mode, status.
- `document_chunks`: Chunk ID, document_id, chunk_index, content, metadata (JSON).
- `glossary_terms`: Term ID, term, definition, formula, domain, source_tables, source_columns, steward.

### Business Intelligence
- `dashboards` & `dashboard_widgets`: User-defined multi-metric dashboards.
- `reports`: Executive briefings, reporting period, audience, sections (JSON).
- `scheduled_jobs`: Cron-based scheduled automations and delivery endpoints.
- `audit_events`: Security logging of every executed action with IP, actor, and payload.

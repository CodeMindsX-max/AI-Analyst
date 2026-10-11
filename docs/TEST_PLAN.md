# AnalystAI — Quality Assurance & Test Plan

This document details automated test suites and manual validation verification procedures for AnalystAI.

---

## 1. Automated Test Suite (Pytest)

Executed via `python -m pytest backend/app/tests`:

| Test Module | Coverage & Invariants Verified |
|---|---|
| `test_health.py` | Validates API availability, correct server timestamp, and app version. |
| `test_auth.py` | Tests JWT token issuance, login validation, password hashing, and user profile retrieval (`/auth/me`). |
| `test_data_sources.py` | Tests registration of data sources, retrieval of tables, and connector diagnostic testing. |
| `test_knowledge.py` | Tests file upload handling, text extraction, semantic chunking windows, and RAG retrieval preview. |
| `test_sql_safety.py` | **Critical Security Suite:** Tests AST validation and execution rejection of mutating queries (`DROP TABLE`, `UPDATE`, `INSERT`, `ALTER`, `ATTACH DATABASE`, `DELETE FROM`). |
| `test_analyst.py` | Verifies end-to-end 9-step agent workflow execution, prompt suggestions, and analysis saving. |

---

## 2. Frontend Verification & TypeScript Checks

Executed via `tsc -b` and `vite build`:
- **TypeScript Type Safety:** Confirms all API contracts, schemas, React props, and state structures are free from type errors.
- **Tailwind Utility Generation:** Verifies that all design tokens and utility classes are compiled into production CSS bundle.
- **Routing & Navigation Integrity:** Tests all routes (Public Auth, Onboarding, Protected Workspace Shell, Error fallback).

---

## 3. Manual Smoke Testing Acceptance Matrix

| Verification Item | Acceptance Criteria | Verified Result |
|---|---|---|
| **Overview Screen** | Renders 4 KPI cards, historical revenue chart, regional attainment list, and insights. | **PASSED** |
| **AI Analyst Core Run** | Submitting a prompt initiates the 9-step timeline, outputs findings cards, visual charts, and verified SQL. | **PASSED** |
| **Data Explorer** | Navigating to `sales_orders` displays column data types, profiling metrics, and live rows preview. | **PASSED** |
| **SQL Workspace** | Running `SELECT * FROM sales_orders LIMIT 10` returns results; executing `DROP TABLE sales_orders` is blocked by safety validator. | **PASSED** |
| **Knowledge Base** | Ingests uploaded `.md`/`.txt` files, generates semantic chunks, and allows RAG retrieval test queries. | **PASSED** |
| **Business Glossary** | Allows searching and adding terms with SQL formulas and data steward assignments. | **PASSED** |
| **Custom Dashboards** | Creating and opening a dashboard renders interactive Recharts widgets. | **PASSED** |
| **Executive Reports** | Generates multi-section narrative reports with Markdown export capability. | **PASSED** |
| **Command Palette** | Pressing `Ctrl+K` opens universal modal for global entity search and page shortcuts. | **PASSED** |

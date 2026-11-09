# AnalystAI — Developer & Contributor Guide

Welcome to the **AnalystAI** developer guide. This document provides step-by-step instructions for extending the application, writing tests, creating migrations, adding frontend features, and adhering to engineering standards.

---

## 1. Project Architecture & Directory Layout

```
AI Analyst/
├── backend/
│   ├── app/
│   │   ├── api/v1/              # FastAPI route controllers (auth, analyst, sql, etc.)
│   │   ├── core/                # App settings (config.py), security (security.py)
│   │   ├── db/                  # Session factories, declarative bases, seed logic
│   │   ├── models/              # SQLAlchemy models (ApplicationBase & AnalyticsBase)
│   │   ├── providers/           # Replaceable LLM, vector, and connector interfaces
│   │   ├── schemas/             # Pydantic request/response validation schemas
│   │   ├── services/            # Pure business logic (orchestrator, analysis, rag)
│   │   ├── tests/               # Pytest suite with DirectClient test harness
│   │   └── main.py              # FastAPI application factory and lifecycle
│   ├── data/                    # Local SQLite databases (development only)
│   ├── migrations/              # Alembic migration environment and versions
│   ├── alembic.ini              # Alembic configuration
│   └── requirements.txt         # Pinned backend runtime dependencies
├── docs/                        # Complete architecture, security, and setup guides
├── frontend/
│   ├── src/
│   │   ├── api/                 # HTTP client (http.ts) with typed error handling
│   │   ├── app/                 # Providers, Router, AppShell layout
│   │   ├── components/          # Reusable UI primitives (buttons, modals, badges, charts)
│   │   ├── features/            # Page-level features (analyst, dashboards, explorer)
│   │   ├── types/               # TypeScript domain interfaces and API types
│   │   ├── App.tsx              # Root React component
│   │   └── main.tsx             # DOM mount point
│   ├── package.json             # Frontend dependencies & npm scripts
│   ├── vite.config.ts           # Vite bundler configuration
│   └── tsconfig.json            # TypeScript compiler configuration
├── .gitignore                   # Ignores .venv, node_modules, dist, .env
├── README.md                    # Quickstart and overview
└── requirements.txt             # Root dependency pointer
```

---

## 2. Environment Setup & Tooling

### 2.1 Canonical Python Environment
The single canonical Python environment is the root `.venv`.
```powershell
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt

# macOS / Linux
source .venv/bin/activate
pip install -r backend/requirements.txt
```

> [!NOTE]
> If a redundant `backend/venv` exists from legacy builds, leave it unreferenced; always point your editor, terminal, and pytest runner to the repository-root `.venv`.

### 2.2 Frontend Environment
Node.js 18+ is required.
```powershell
cd frontend
npm install
```

---

## 3. How to Extend the Application

### 3.1 Adding a New API Endpoint
1. **Define Schema**: Create input and response Pydantic models in `backend/app/schemas/`.
2. **Implement Service**: Add or extend domain logic in `backend/app/services/`.
3. **Add Route Handler**: Create or update the route in `backend/app/api/v1/<feature>.py`.
4. **Register Router**: Include the router in `backend/app/api/v1/__init__.py` or `backend/app/main.py`.

Example Route (`backend/app/api/v1/metrics.py`):
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.auth import User
from app.schemas.metrics import MetricResponse

router = APIRouter(prefix="/metrics", tags=["Metrics"])

@router.get("/summary", response_model=MetricResponse)
def get_metrics_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MetricResponse:
    # Business logic delegated to service layer
    return MetricResponse(status="success", count=42)
```

### 3.2 Adding a SQLAlchemy Model
1. Determine the model's domain:
   - **Application Model**: Must inherit from `ApplicationBase` in `backend/app/db/base.py`.
   - **Analytical Model**: Must inherit from `AnalyticsBase` in `backend/app/db/base.py`.
2. Define the model in `backend/app/models/<domain>.py`.
3. Export the model in `backend/app/models/__init__.py`.
4. Register the model in `backend/migrations/env.py` so Alembic detects it.

Example Model:
```python
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from app.db.base import ApplicationBase

class ReportBookmark(ApplicationBase):
    __tablename__ = "report_bookmarks"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    report_id = Column(String(36), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
```

### 3.3 Adding an Alembic Migration
Whenever an `ApplicationBase` model is added or altered:
```powershell
# From repository root or backend folder with .venv active:
cd backend
python -m alembic revision --autogenerate -m "create_report_bookmarks_table"
```
- Open the newly generated revision file in `backend/migrations/versions/`.
- Review the `upgrade()` and `downgrade()` functions to ensure no unrelated tables are altered.
- Apply the migration:
```powershell
python -m alembic upgrade head
```

### 3.4 Adding a Frontend Feature / Route
1. **Create Feature View**: Build the component in `frontend/src/features/<feature_name>/<FeaturePage>.tsx`.
2. **Add API Functions**: Add typed API methods in `frontend/src/api/` or directly consume `frontend/src/api/http.ts`.
3. **Register Route**: Add the route in `frontend/src/app/router.tsx`:
```tsx
import { FeaturePage } from '../features/feature/FeaturePage';

// Inside router children array:
{
  path: 'new-feature',
  element: <FeaturePage />,
}
```
4. **Update App Navigation**: If the page belongs in the main sidebar, add its icon and route path to `frontend/src/components/layout/AppShell.tsx`.

---

## 4. Testing & Verification

### 4.1 Running Backend Tests
All tests run with pytest against local SQLite databases:
```powershell
# From repository root:
.\.venv\Scripts\python.exe -m pytest backend/app/tests -v
```

> [!TIP]
> The test harness (`backend/app/tests/conftest.py`) uses `DirectClient`, executing requests directly against FastAPI route handlers without thread-deadlocking or loopback socket restrictions in sandboxed Windows environments.

### 4.2 Backend Compilation Check
Verify syntax and imports across the entire backend:
```powershell
.\.venv\Scripts\python.exe -m compileall backend/app
```

### 4.3 Frontend Type Checking & Production Build
```powershell
cd frontend
npm run build
```
This runs:
- `tsc -b`: TypeScript compiler in project reference mode (checks types across all `.ts` and `.tsx` files).
- `vite build`: Bundles the production application into `frontend/dist/`.

---

## 5. Coding Standards & Conventions

### 5.1 Error Handling & Logging
- **No Stack Traces in Responses**: Endpoints must return clean HTTP error schemas (`{"detail": "User-facing message"}`) with proper status codes (400, 401, 403, 404, 422).
- **Redact Sensitive Information**: Never print or log connection strings, passwords, JWT secrets, or authorization tokens.
- **Truthful Analytics**: Never substitute synthetic business rows on empty query results or connection failures. If a query returns 0 rows, return an empty result state (`findings=[]`, `charts=[]`).

### 5.2 Frontend Routing & Auth Guards
- `AppShell.tsx` guards all application routes. If the user session is unauthenticated, the application redirects to `/login`.
- Never insert fake demo users in frontend fallback logic.

### 5.3 Git Hygiene & Secrets
- Never commit `.env` or files containing live credentials.
- Ensure all migration revision files in `backend/migrations/versions/` are tracked and committed.
- Keep dependencies updated in `backend/requirements.txt` and `frontend/package.json`.

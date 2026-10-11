# AnalystAI — Developer & Contributor Guide

## 1. Local Development Environment

### Backend Setup (Windows PowerShell)
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Database Initialization & Reseeding
To reset and re-seed the demo analytical database and metadata:
```powershell
python -m app.db.seed
```
This drops and recreates:
- `backend/analystai.db` with demo users, glossary terms, documents, sample dashboards, and reports.
- `backend/analystai_analytics.db` with 250+ sales orders, 4 regions, 10 products, and 20 customer accounts.

---

## 2. Running Automated Tests

Run backend tests using Python module execution (avoids PowerShell execution policy blocks):
```powershell
cd backend
.\venv\Scripts\python.exe -m pytest app/tests -v
```

Test coverage includes:
- `test_health.py`: API health check
- `test_auth.py`: JWT generation, demo login, password hashing
- `test_data_sources.py`: Source registration and simulated connection testing
- `test_knowledge.py`: Document upload, text parsing, semantic chunking
- `test_sql_safety.py`: Read-only enforcement, AST rejection of DROP/UPDATE/DELETE/ALTER
- `test_analyst.py`: End-to-end 9-step agent workflow execution

---

## 3. Frontend Development

### Running the Vite Dev Server
```powershell
cd frontend
npm run dev
```

### Building for Production
```powershell
cd frontend
npm run build
```
This runs `tsc -b` for type-checking and `vite build` to output optimized static assets into `frontend/dist/`.

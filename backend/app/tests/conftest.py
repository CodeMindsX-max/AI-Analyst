import os
import re
from typing import Any, Optional, Dict
import pytest

# Enforce offline SQLite test environment before importing app or database modules
os.environ["APP_ENV"] = "development"
os.environ["DEMO_MODE"] = "true"
os.environ["DATABASE_URL"] = "sqlite:///./data/test_analystai.db"
os.environ["ANALYTICS_DATABASE_URL"] = "sqlite:///./data/analystai_analytics.db"

from app.db.init_db import init_application_db, init_analytics_db
from app.db.seed import seed_all
from app.db.session import SessionLocal
from app.core.exceptions import AnalystAIException
from fastapi import HTTPException

# Route handlers
from app.api.v1 import (
    health,
    auth,
    data_sources,
    sql,
    analyst,
    knowledge,
    glossary,
    saved_analyses,
)
from app.schemas.auth import LoginRequest
from app.schemas.sql import SqlValidateRequest, SqlExecuteRequest
from app.schemas.analyst import AnalystRunRequest, SaveAnalysisRequest
from app.schemas.knowledge import GlossaryTermCreate, GlossaryTermUpdate, RetrievalPreviewRequest


class DirectTestResponse:
    def __init__(self, status_code: int, data: Any):
        self.status_code = status_code
        self._data = data

    def json(self):
        if hasattr(self._data, "model_dump"):
            return self._data.model_dump(mode="json")
        elif isinstance(self._data, list):
            return [item.model_dump(mode="json") if hasattr(item, "model_dump") else item for item in self._data]
        elif isinstance(self._data, dict):
            return self._data
        return self._data


class DirectClient:
    def get(self, url: str, params: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, Any]] = None):
        db = SessionLocal()
        try:
            if url in ("/api/v1/health", "/api/v1/health/live", "/health", "/health/live"):
                return DirectTestResponse(200, health.liveness_check())
            elif url == "/api/v1/health/ready":
                return DirectTestResponse(200, health.readiness_check(db=db))
            elif url == "/api/v1/health/database":
                return DirectTestResponse(200, health.database_health(db=db))
            elif url == "/api/v1/data-sources":
                return DirectTestResponse(200, data_sources.list_data_sources(db=db))
            elif url == "/api/v1/glossary":
                return DirectTestResponse(200, glossary.list_glossary_terms(db=db))
            elif re.match(r"^/api/v1/glossary/([^/]+)$", url):
                m = re.match(r"^/api/v1/glossary/([^/]+)$", url)
                return DirectTestResponse(200, glossary.get_glossary_term(m.group(1), db=db))
            elif url == "/api/v1/saved-analyses":
                return DirectTestResponse(200, saved_analyses.list_saved_analyses(db=db))
            raise HTTPException(status_code=404, detail="Not Found")
        except AnalystAIException as e:
            return DirectTestResponse(e.status_code, {"detail": e.detail, "code": e.code})
        except HTTPException as e:
            return DirectTestResponse(e.status_code, {"detail": e.detail, "code": "HTTP_ERROR"})
        finally:
            db.close()

    def post(self, url: str, json: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, Any]] = None):
        db = SessionLocal()
        payload = json or {}
        try:
            if url == "/api/v1/auth/login":
                req = LoginRequest(**payload)
                res = auth.login(req, db=db)
                return DirectTestResponse(200, res)
            elif url == "/api/v1/sql/validate":
                req = SqlValidateRequest(**payload)
                return DirectTestResponse(200, sql.validate_sql(req))
            elif url == "/api/v1/sql/execute":
                req = SqlExecuteRequest(**payload)
                return DirectTestResponse(200, sql.execute_sql(req, db=db))
            elif url == "/api/v1/analyst/runs":
                req = AnalystRunRequest(**payload)
                return DirectTestResponse(200, analyst.create_analyst_run(req, db=db))
            elif re.match(r"^/api/v1/data-sources/([^/]+)/test-connection$", url):
                m = re.match(r"^/api/v1/data-sources/([^/]+)/test-connection$", url)
                return DirectTestResponse(200, data_sources.test_data_source_connection(m.group(1), db=db))
            elif re.match(r"^/api/v1/analyst/analyses/([^/]+)/save$", url):
                m = re.match(r"^/api/v1/analyst/analyses/([^/]+)/save$", url)
                req = SaveAnalysisRequest(**payload)
                return DirectTestResponse(200, analyst.save_analysis(m.group(1), req, db=db))
            elif url == "/api/v1/glossary":
                req = GlossaryTermCreate(**payload)
                return DirectTestResponse(200, glossary.create_glossary_term(req, db=db))
            elif url == "/api/v1/knowledge/retrieval-preview":
                req = RetrievalPreviewRequest(**payload)
                return DirectTestResponse(200, knowledge.retrieval_preview(req, db=db))
            raise HTTPException(status_code=404, detail="Not Found")
        except AnalystAIException as e:
            return DirectTestResponse(e.status_code, {"detail": e.detail, "code": e.code})
        except HTTPException as e:
            return DirectTestResponse(e.status_code, {"detail": e.detail, "code": "HTTP_ERROR"})
        finally:
            db.close()

    def patch(self, url: str, json: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, Any]] = None):
        db = SessionLocal()
        payload = json or {}
        try:
            if re.match(r"^/api/v1/glossary/([^/]+)$", url):
                m = re.match(r"^/api/v1/glossary/([^/]+)$", url)
                req = GlossaryTermUpdate(**payload)
                return DirectTestResponse(200, glossary.update_glossary_term(m.group(1), req, db=db))
            raise HTTPException(status_code=404, detail="Not Found")
        except AnalystAIException as e:
            return DirectTestResponse(e.status_code, {"detail": e.detail, "code": e.code})
        except HTTPException as e:
            return DirectTestResponse(e.status_code, {"detail": e.detail, "code": "HTTP_ERROR"})
        finally:
            db.close()

    def delete(self, url: str, headers: Optional[Dict[str, Any]] = None):
        db = SessionLocal()
        try:
            if re.match(r"^/api/v1/glossary/([^/]+)$", url):
                m = re.match(r"^/api/v1/glossary/([^/]+)$", url)
                return DirectTestResponse(200, glossary.delete_glossary_term(m.group(1), db=db))
            raise HTTPException(status_code=404, detail="Not Found")
        except AnalystAIException as e:
            return DirectTestResponse(e.status_code, {"detail": e.detail, "code": e.code})
        except HTTPException as e:
            return DirectTestResponse(e.status_code, {"detail": e.detail, "code": "HTTP_ERROR"})
        finally:
            db.close()


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Ensure database tables and demo seed data exist before running tests."""
    init_application_db()
    init_analytics_db()
    seed_all()
    yield


@pytest.fixture
def client():
    """Fast, safe direct client fixture avoiding blocking portal deadlocks in sandboxes."""
    return DirectClient()

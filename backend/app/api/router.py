from fastapi import APIRouter
from app.api.v1 import (
    health,
    auth,
    overview,
    analyst,
    data_sources,
    explorer,
    sql,
    knowledge,
    glossary,
    dashboards,
    reports,
    saved_analyses,
    agent_runs,
    schedules,
    notifications,
    team,
    settings,
    audit_logs,
    search,
)

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(overview.router)
api_router.include_router(analyst.router)
api_router.include_router(data_sources.router)
api_router.include_router(explorer.router)
api_router.include_router(sql.router)
api_router.include_router(knowledge.router)
api_router.include_router(glossary.router)
api_router.include_router(dashboards.router)
api_router.include_router(reports.router)
api_router.include_router(saved_analyses.router)
api_router.include_router(agent_runs.router)
api_router.include_router(schedules.router)
api_router.include_router(notifications.router)
api_router.include_router(team.router)
api_router.include_router(settings.router)
api_router.include_router(audit_logs.router)
api_router.include_router(search.router)

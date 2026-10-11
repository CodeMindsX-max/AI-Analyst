from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.operations import GlobalSearchResponse, GlobalSearchResultItem
from app.models.knowledge import GlossaryTerm, KnowledgeDocument
from app.models.analyst import SavedAnalysis
from app.models.bi import Dashboard, Report
from app.models.data_source import DataSource

router = APIRouter(tags=["Global Search"])


@router.get("/search", response_model=GlobalSearchResponse)
def global_search(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    """Search routes, analyses, reports, dashboards, glossary, and documents."""
    results: List[GlobalSearchResultItem] = []
    pattern = f"%{q}%"
    lower_q = q.lower()

    # Search Standard Navigation Routes
    nav_items = [
        {"title": "Executive Overview", "desc": "Company KPIs, trends, and business insights", "url": "/overview"},
        {"title": "AI Analyst", "desc": "Natural language analytical workspace", "url": "/analyst"},
        {"title": "Saved Analyses", "desc": "Archived queries and investigation cards", "url": "/saved-analyses"},
        {"title": "Data Sources", "desc": "Manage database connectors and uploaded files", "url": "/data-sources"},
        {"title": "Data Explorer", "desc": "Browse schemas, tables, and column profiles", "url": "/data-explorer"},
        {"title": "SQL Workspace", "desc": "Run and validate read-only analytical queries", "url": "/sql-workspace"},
        {"title": "Knowledge Base & RAG", "desc": "Uploaded policies, reports, and chunk retrieval", "url": "/knowledge-base"},
        {"title": "Business Glossary", "desc": "KPI formulas and business metric definitions", "url": "/glossary"},
        {"title": "Dashboards", "desc": "Customizable BI dashboards and charts", "url": "/dashboards"},
        {"title": "Executive Reports", "desc": "Multi-section briefings and exports", "url": "/reports"},
        {"title": "Scheduled Jobs", "desc": "Automated report generation and monitoring", "url": "/schedules"},
        {"title": "Agent Runs", "desc": "Multi-step tool timeline and execution logs", "url": "/agent-runs"},
        {"title": "Team & Access", "desc": "Manage workspace members and roles", "url": "/team"},
        {"title": "Audit Logs", "desc": "Traceable system activity log", "url": "/audit-logs"},
        {"title": "Settings", "desc": "Configure AI providers and workspace defaults", "url": "/settings"},
    ]

    for nav in nav_items:
        if lower_q in nav["title"].lower() or lower_q in nav["desc"].lower():
            results.append(
                GlobalSearchResultItem(
                    id=f"nav-{nav['url']}",
                    title=nav["title"],
                    description=nav["desc"],
                    category="navigation",
                    url=nav["url"],
                )
            )

    # Search Glossary
    terms = db.query(GlossaryTerm).filter(
        (GlossaryTerm.term.ilike(pattern)) | (GlossaryTerm.definition.ilike(pattern))
    ).limit(5).all()
    for t in terms:
        results.append(
            GlobalSearchResultItem(
                id=t.id,
                title=f"Glossary: {t.term}",
                description=t.definition[:100] + "...",
                category="glossary",
                url=f"/glossary?search={t.term}",
            )
        )

    # Search Saved Analyses
    saved = db.query(SavedAnalysis).filter(
        (SavedAnalysis.title.ilike(pattern)) | (SavedAnalysis.question.ilike(pattern))
    ).limit(5).all()
    for s in saved:
        results.append(
            GlobalSearchResultItem(
                id=s.id,
                title=f"Analysis: {s.title}",
                description=s.question,
                category="analysis",
                url="/saved-analyses",
            )
        )

    # Search Dashboards
    dashboards = db.query(Dashboard).filter(Dashboard.title.ilike(pattern)).limit(5).all()
    for d in dashboards:
        results.append(
            GlobalSearchResultItem(
                id=d.id,
                title=f"Dashboard: {d.title}",
                description=d.description or "BI Dashboard",
                category="dashboard",
                url=f"/dashboards/{d.id}",
            )
        )

    # Search Reports
    reports = db.query(Report).filter(Report.title.ilike(pattern)).limit(5).all()
    for r in reports:
        results.append(
            GlobalSearchResultItem(
                id=r.id,
                title=f"Report: {r.title}",
                description=r.subtitle or r.report_type,
                category="report",
                url=f"/reports/{r.id}",
            )
        )

    return GlobalSearchResponse(query=q, results=results)

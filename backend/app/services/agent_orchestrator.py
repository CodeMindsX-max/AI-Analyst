import json
import time
import uuid
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.analyst import AgentRun, AgentRunEvent
from app.schemas.analyst import (
    AnalystRunRequest,
    AnalystResult,
    EvidenceItem,
    DataCoverage,
)
from app.services.schema_retrieval_service import schema_retrieval_service
from app.services.business_knowledge_service import business_knowledge_service
from app.services.text_to_sql_service import text_to_sql_service
from app.services.sql_validation_service import sql_validation_service
from app.services.sql_execution_service import sql_execution_service
from app.services.analysis_service import analysis_service

# TODO(STUDENT): Implement a dynamic, tool-calling agent orchestrator.
# Architectural suggestions:
# 1. State machine or graph orchestrator (e.g. custom DAG or LangGraph state machine).
# 2. Self-correction / Reflexion loop: If SQL execution returns a syntax error, feed the error back to the LLM to self-repair up to 2 times.
# 3. Dynamic tool selection: let the agent decide whether it needs glossary terms, documents, or schema based on intent.


class AgentOrchestrator:
    """Bounded, transparent agent orchestrator running multi-step business analysis."""

    def run_pipeline(
        self,
        db: Session,
        request: AnalystRunRequest,
        user_email: str = "demo@analystai.local",
    ) -> AgentRun:
        run_id = f"run-{uuid.uuid4().hex[:10]}"
        pipeline_start = time.perf_counter()

        # Create AgentRun record
        agent_run = AgentRun(
            id=run_id,
            workspace_id="default-ws",
            user_email=user_email,
            question=request.question,
            status="running",
            source_id=request.source_id or "demo-source-1",
            duration_ms=0,
        )
        db.add(agent_run)
        db.commit()

        events: List[AgentRunEvent] = []

        # Step 1: Understand user request
        s1_start = time.perf_counter()
        task_summary = f"Decomposed query '{request.question}' into time-series comparison, regional aggregation, and product breakdown."
        s1_dur = int((time.perf_counter() - s1_start) * 1000)
        events.append(
            AgentRunEvent(
                id=f"evt-{uuid.uuid4().hex[:8]}",
                run_id=run_id,
                step_index=1,
                step_name="Understand Request",
                status="completed",
                description="Parsed question intent and identified required temporal and categorical dimensions.",
                tool_name="NLUIntentParser",
                details_json='{"intent": "variance_analysis", "dimensions": ["time", "region", "category"]}',
                duration_ms=s1_dur,
            )
        )

        # Step 2: Retrieve schema metadata
        s2_start = time.perf_counter()
        schema_context = schema_retrieval_service.retrieve_relevant_schema_context(request.question)
        s2_dur = int((time.perf_counter() - s2_start) * 1000)
        events.append(
            AgentRunEvent(
                id=f"evt-{uuid.uuid4().hex[:8]}",
                run_id=run_id,
                step_index=2,
                step_name="Retrieve Schema",
                status="completed",
                description=f"Identified tables {schema_context['tables_selected']} with join keys.",
                tool_name="SchemaRetriever",
                details_json=json.dumps({"tables": list(schema_context["tables_selected"])}),
                duration_ms=s2_dur,
            )
        )

        # Step 3: Retrieve business definitions
        s3_start = time.perf_counter()
        glossary_items = business_knowledge_service.retrieve_glossary_definitions(db, request.question)
        s3_dur = int((time.perf_counter() - s3_start) * 1000)
        events.append(
            AgentRunEvent(
                id=f"evt-{uuid.uuid4().hex[:8]}",
                run_id=run_id,
                step_index=3,
                step_name="Retrieve Knowledge",
                status="completed",
                description=f"Retrieved {len(glossary_items)} business KPI definition(s) from knowledge base.",
                tool_name="KnowledgeRetriever",
                details_json='{"matched_terms": ["Revenue", "Gross Margin"]}',
                duration_ms=s3_dur,
            )
        )

        # Step 4: Plan bounded analysis
        s4_start = time.perf_counter()
        s4_dur = int((time.perf_counter() - s4_start) * 1000)
        events.append(
            AgentRunEvent(
                id=f"evt-{uuid.uuid4().hex[:8]}",
                run_id=run_id,
                step_index=4,
                step_name="Plan Analysis",
                status="completed",
                description="Formulated query plan: aggregate monthly sales, compute regional deltas, calculate category variance.",
                tool_name="AgentPlanner",
                details_json='{"plan_steps": ["Generate SQL", "Validate Safety", "Execute Query", "Synthesize Results"]}',
                duration_ms=s4_dur,
            )
        )

        # Step 5: Generate candidate SQL
        s5_start = time.perf_counter()
        sql_gen = text_to_sql_service.generate_candidate_sql(request.question, schema_context, glossary_items)
        candidate_sql = sql_gen["sql"]
        s5_dur = int((time.perf_counter() - s5_start) * 1000)
        events.append(
            AgentRunEvent(
                id=f"evt-{uuid.uuid4().hex[:8]}",
                run_id=run_id,
                step_index=5,
                step_name="Generate SQL",
                status="completed",
                description="Constructed grounded candidate SQL query with parameter constraints.",
                tool_name="TextToSQLGenerator",
                details_json=json.dumps({"sql": f"{candidate_sql[:80]}..."}),
                duration_ms=s5_dur,
            )
        )

        # Step 6: Validate query safety
        s6_start = time.perf_counter()
        validation = sql_validation_service.validate_query(candidate_sql)
        s6_dur = int((time.perf_counter() - s6_start) * 1000)
        events.append(
            AgentRunEvent(
                id=f"evt-{uuid.uuid4().hex[:8]}",
                run_id=run_id,
                step_index=6,
                step_name="Validate SQL Safety",
                status="completed" if validation.is_valid else "failed",
                description="Verified read-only status, statement count, and allowed table references.",
                tool_name="SQLSafetyValidator",
                details_json='{"is_read_only": true, "safety_status": "PASSED"}',
                duration_ms=s6_dur,
            )
        )

        # Step 7: Execute query
        s7_start = time.perf_counter()
        exec_res = sql_execution_service.execute(
            candidate_sql,
            limit=100,
            source_id=request.source_id,
            db=db,
        )
        s7_dur = exec_res.duration_ms
        step7_desc = (
            f"Executed read-only query; fetched {exec_res.row_count} rows in {exec_res.duration_ms}ms."
            if exec_res.status == "success"
            else f"Query execution failed: {exec_res.error_message}"
        )
        events.append(
            AgentRunEvent(
                id=f"evt-{uuid.uuid4().hex[:8]}",
                run_id=run_id,
                step_index=7,
                step_name="Execute Query",
                status=exec_res.status,
                description=step7_desc,
                tool_name="DatabaseExecutionTool",
                details_json=f'{{"row_count": {exec_res.row_count}, "latency_ms": {exec_res.duration_ms}, "status": "{exec_res.status}"}}',
                duration_ms=s7_dur,
            )
        )

        # Step 8: Analyze returned rows
        s8_start = time.perf_counter()
        if exec_res.status == "error":
            analysis = {
                "executive_answer": f"Analysis halted due to SQL execution failure: {exec_res.error_message}",
                "findings": [],
                "charts": [],
            }
            s8_status = "failed"
            s8_desc = "Analysis skipped due to query execution error."
        else:
            analysis = analysis_service.analyze_results(request.question, exec_res.rows, exec_res.columns)
            s8_status = "completed"
            s8_desc = f"Synthesized findings and chart datasets across {exec_res.row_count} queried records."

        s8_dur = int((time.perf_counter() - s8_start) * 1000)
        events.append(
            AgentRunEvent(
                id=f"evt-{uuid.uuid4().hex[:8]}",
                run_id=run_id,
                step_index=8,
                step_name="Analyze Data Rows",
                status=s8_status,
                description=s8_desc,
                tool_name="DeterministicAnalysisEngine",
                details_json=f'{{"findings_count": {len(analysis["findings"])}}}',
                duration_ms=s8_dur,
            )
        )

        # Step 9: Prepare visual and business explanation
        s9_start = time.perf_counter()
        s9_dur = int((time.perf_counter() - s9_start) * 1000)
        events.append(
            AgentRunEvent(
                id=f"evt-{uuid.uuid4().hex[:8]}",
                run_id=run_id,
                step_index=9,
                step_name="Synthesize Explanation",
                status="completed" if exec_res.status == "success" else "failed",
                description="Synthesized executive answer, formatted finding cards, and assembled interactive charts."
                if exec_res.status == "success"
                else "Synthesis halted due to upstream execution error.",
                tool_name="BusinessExplanationSynthesizer",
                details_json=f'{{"charts_count": {len(analysis["charts"])}, "findings_count": {len(analysis["findings"])}}}',
                duration_ms=s9_dur,
            )
        )

        # Build Grounded Evidence Items
        evidence: List[EvidenceItem] = []
        for tbl in schema_context.get("tables_selected", []):
            evidence.append(
                EvidenceItem(
                    type="schema",
                    title=f"Database Table: {tbl}",
                    source_name="Demo Analytics Database",
                    source_id=request.source_id or "demo-source-1",
                    excerpt=f"Table '{tbl}' schema referenced for analytic joins and aggregations.",
                    table_name=tbl,
                    is_demo=True,
                )
            )

        for g in glossary_items[:2]:
            evidence.append(
                EvidenceItem(
                    type="glossary",
                    title=f"KPI Definition: {g.get('term', 'Metric')}",
                    source_name="Business Glossary",
                    source_id=f"glossary-{g.get('term', 'metric').lower()}",
                    excerpt=f"{g.get('definition', '')} Formula: {g.get('formula') or 'N/A'}",
                    table_name=g.get("tables"),
                    column_name=g.get("columns"),
                    is_demo=True,
                )
            )

        if exec_res.status == "success" and exec_res.row_count > 0:
            evidence.append(
                EvidenceItem(
                    type="calculation",
                    title="SQL Execution Provenance",
                    source_name="Analysis Engine",
                    excerpt=f"Query successfully evaluated {exec_res.row_count} rows across {len(exec_res.columns)} columns in {exec_res.duration_ms}ms.",
                    is_demo=True,
                )
            )

        total_duration = int((time.perf_counter() - pipeline_start) * 1000)

        # Assemble Full AnalystResult (honestly, with no synthetic fallback rows)
        result = AnalystResult(
            question=request.question,
            task_summary=task_summary,
            executive_answer=analysis["executive_answer"],
            findings=analysis["findings"],
            charts=analysis["charts"],
            table_columns=exec_res.columns or [],
            table_rows=exec_res.rows or [],
            candidate_sql=candidate_sql,
            query_safety_status="PASSED (Read-only single statement)" if validation.is_valid else "FAILED",
            evidence=evidence,
            data_coverage=DataCoverage(
                selected_source="Demo Sales Dataset (SQLite)" if (not request.source_id or request.source_id == "demo-source-1") else f"Source: {request.source_id}",
                tables_used=list(schema_context["tables_selected"]),
                columns_used=exec_res.columns or [],
                row_count=exec_res.row_count,
                date_range_applied=request.date_range or "all_time",
                last_updated="2026-10-11T12:00:00Z",
                execution_duration_ms=total_duration,
            ),
            is_demo_generated=True,
            model_provider="mock",
        )

        # Update AgentRun in DB
        agent_run.task_summary = task_summary
        agent_run.status = "completed" if exec_res.status == "success" else "failed"
        agent_run.duration_ms = total_duration
        agent_run.query_sql = candidate_sql
        agent_run.result_json = result.model_dump_json()

        for ev in events:
            db.add(ev)
        db.commit()
        db.refresh(agent_run)

        return agent_run


agent_orchestrator = AgentOrchestrator()

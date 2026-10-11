import json
import uuid
from datetime import date, datetime, timezone, timedelta
from app.core.logging_config import logger
from app.core.security import get_password_hash
from app.db.init_db import init_db
from app.db.session import SessionLocal, AnalyticsSessionLocal
from app.models import (
    User,
    Workspace,
    WorkspaceSetting,
    DataSource,
    SalesOrder,
    Customer,
    Product,
    Region,
    GlossaryTerm,
    KnowledgeDocument,
    DocumentChunk,
    Dashboard,
    DashboardWidget,
    Report,
    SavedAnalysis,
    ScheduledJob,
    Notification,
    TeamMember,
    AuditEvent,
)


def seed_all():
    """Seed idempotent demo dataset across metadata and analytics stores."""
    init_db()

    app_db = SessionLocal()
    analytics_db = AnalyticsSessionLocal()

    try:
        # 1. Seed Demo User
        existing_user = app_db.query(User).filter(User.email == "demo@analystai.local").first()
        if not existing_user:
            logger.info("Seeding demo admin user: demo@analystai.local")
            demo_user = User(
                id="user-demo-admin",
                email="demo@analystai.local",
                full_name="Alex Mercer (Demo Lead)",
                hashed_password=get_password_hash("AnalystAI123!"),
                role="Admin",
                is_active=True,
                avatar_url="",
            )
            app_db.add(demo_user)

        # 2. Seed Workspace & Settings
        existing_ws = app_db.query(Workspace).filter(Workspace.id == "default-ws").first()
        if not existing_ws:
            logger.info("Seeding default workspace: Acme Enterprise Analytics")
            ws = Workspace(
                id="default-ws",
                name="Acme Enterprise Analytics",
                organization="Acme Corporation",
                industry="SaaS & Cloud Services",
                size="100-500",
                domain="Sales & Revenue Operations",
                is_onboarded=True,
            )
            app_db.add(ws)

            ws_settings = WorkspaceSetting(
                id="ws-set-default",
                workspace_id="default-ws",
                llm_provider="mock",
                embedding_provider="mock",
                response_style="analytical",
                max_output_tokens=2048,
                default_chart_type="bar",
                citation_preference="detailed",
                top_k=5,
                allowed_tools="schema,glossary,sql,analysis,chart,report",
                max_sql_rows=500,
            )
            app_db.add(ws_settings)

        # 3. Seed Data Sources
        existing_ds = app_db.query(DataSource).filter(DataSource.id == "demo-source-1").first()
        if not existing_ds:
            logger.info("Seeding data sources...")
            app_db.add(
                DataSource(
                    id="demo-source-1",
                    workspace_id="default-ws",
                    name="Demo Sales Dataset (SQLite)",
                    kind="demo_dataset",
                    status="active",
                    table_count=4,
                    row_count=1420,
                    last_synced_at=datetime.now(timezone.utc),
                    owner="System Demo Seed",
                )
            )
            app_db.add(
                DataSource(
                    id="src-pg-1",
                    workspace_id="default-ws",
                    name="Enterprise PostgreSQL Warehouse",
                    kind="postgresql",
                    status="scaffold",
                    table_count=0,
                    row_count=0,
                    owner="Data Engineering Team",
                )
            )
            app_db.add(
                DataSource(
                    id="src-sf-1",
                    workspace_id="default-ws",
                    name="Finance Snowflake Data Mart",
                    kind="snowflake",
                    status="scaffold",
                    table_count=0,
                    row_count=0,
                    owner="Finance Operations",
                )
            )

        # 4. Seed Glossary Terms
        if app_db.query(GlossaryTerm).count() == 0:
            logger.info("Seeding business glossary terms...")
            glossary_terms = [
                GlossaryTerm(
                    id="gloss-1",
                    workspace_id="default-ws",
                    term="Revenue",
                    definition="Net recognized billing from customer orders, minus applied discounts and cancellations.",
                    synonyms="Net Revenue, Net Sales, Recognized Billing",
                    formula="SUM(net_amount)",
                    domain="Sales",
                    source_tables="sales_orders",
                    source_columns="net_amount",
                    steward="Head of Revenue Operations",
                    notes="Primary top-line metric. Synchronized nightly.",
                ),
                GlossaryTerm(
                    id="gloss-2",
                    workspace_id="default-ws",
                    term="Orders",
                    definition="Count of distinct completed sales orders in Paid or Active status.",
                    synonyms="Order Volume, Closed Bookings, Transaction Count",
                    formula="COUNT(DISTINCT order_id)",
                    domain="Sales",
                    source_tables="sales_orders",
                    source_columns="order_id",
                    steward="Sales Ops Analyst",
                    notes="Includes all channel bookings.",
                ),
                GlossaryTerm(
                    id="gloss-3",
                    workspace_id="default-ws",
                    term="Active Customer",
                    definition="Unique corporate customer accounts with at least one transaction in the trailing 90-day window.",
                    synonyms="Active Accounts, Transacting Clients",
                    formula="COUNT(DISTINCT customer_id)",
                    domain="Customer Success",
                    source_tables="customers, sales_orders",
                    source_columns="customer_id",
                    steward="Customer Success Director",
                    notes="Used for cohort retention calculations.",
                ),
                GlossaryTerm(
                    id="gloss-4",
                    workspace_id="default-ws",
                    term="Gross Margin",
                    definition="Percentage of total net revenue retained after subtracting cost of goods and services.",
                    synonyms="GM%, Contribution Margin",
                    formula="(SUM(profit_amount) / SUM(net_amount)) * 100",
                    domain="Finance",
                    source_tables="sales_orders",
                    source_columns="profit_amount, net_amount",
                    steward="VP of FP&A",
                    notes="Target minimum threshold is 75% for enterprise software.",
                ),
                GlossaryTerm(
                    id="gloss-5",
                    workspace_id="default-ws",
                    term="Average Order Value",
                    definition="Average monetary value per transaction across all active sales orders.",
                    synonyms="AOV, Average Deal Size, ASP",
                    formula="SUM(net_amount) / COUNT(order_id)",
                    domain="Sales",
                    source_tables="sales_orders",
                    source_columns="net_amount, order_id",
                    steward="Sales Enablement Lead",
                    notes="Monitored for pricing tier migration.",
                ),
                GlossaryTerm(
                    id="gloss-6",
                    workspace_id="default-ws",
                    term="Conversion Rate",
                    definition="Percentage of qualified inbound enterprise prospects that result in closed-won contracts.",
                    synonyms="Win Rate, Opportunity Conversion",
                    formula="(Won Deals / Qualified Leads) * 100",
                    domain="Marketing",
                    source_tables="sales_orders, leads",
                    source_columns="payment_status",
                    steward="Growth Marketing Lead",
                    notes="Benchmark standard is 3.2% - 3.8%.",
                ),
                GlossaryTerm(
                    id="gloss-7",
                    workspace_id="default-ws",
                    term="Churn Rate",
                    definition="Percentage of active accounts that did not renew their annual subscriptions.",
                    synonyms="Logo Churn, Customer Attrition",
                    formula="(Churned Accounts / Total Beginning Accounts) * 100",
                    domain="Customer Success",
                    source_tables="customers",
                    source_columns="churn_risk",
                    steward="VP Customer Success",
                    notes="Calculated at the end of every quarter.",
                ),
            ]
            for t in glossary_terms:
                app_db.add(t)

        # 5. Seed Knowledge Documents
        if app_db.query(KnowledgeDocument).count() == 0:
            logger.info("Seeding knowledge documents...")
            doc1 = KnowledgeDocument(
                id="doc-q3-policy",
                workspace_id="default-ws",
                name="Q3_2026_Revenue_Recognition_Policy.txt",
                file_path="./data/uploads/Q3_2026_Revenue_Recognition_Policy.txt",
                file_type="txt",
                file_size_bytes=1420,
                status="indexed",
                char_count=980,
                chunk_count=2,
                indexing_mode="mock",
                owner="Finance Compliance",
            )
            app_db.add(doc1)
            app_db.commit()

            app_db.add(
                DocumentChunk(
                    id="chk-policy-1",
                    document_id="doc-q3-policy",
                    chunk_index=0,
                    content=(
                        "Acme Revenue Recognition Standard: SaaS subscription fees are recognized ratably over the contract term. "
                        "Professional Services billings are recognized upon milestone acceptance. In Q3 2026, European procurement "
                        "delays extended the average sales cycle from 42 days to 61 days for EMEA enterprise deals."
                    ),
                    metadata_json='{"section": "SaaS Billing Policy", "is_demo": true}',
                )
            )
            app_db.add(
                DocumentChunk(
                    id="chk-policy-2",
                    document_id="doc-q3-policy",
                    chunk_index=1,
                    content=(
                        "Regional Target Allocations for Q3 2026: North America: $1,150,000. EMEA: $780,000. APAC: $400,000. LATAM: $180,000. "
                        "Discounts above 15% require VP Revenue approval."
                    ),
                    metadata_json='{"section": "Regional Quotas", "is_demo": true}',
                )
            )

        # 6. Seed Saved Analysis
        if app_db.query(SavedAnalysis).count() == 0:
            logger.info("Seeding saved analysis...")
            app_db.add(
                SavedAnalysis(
                    id="sa-demo-september",
                    workspace_id="default-ws",
                    title="September Revenue Contraction Variance Analysis",
                    question="Why did revenue decrease in September compared with August?",
                    summary="Root-cause investigation identifying a 26.8% volume dip in EMEA Enterprise SaaS bookings due to extended procurement delays.",
                    run_id="run-init-seed",
                    query_sql=(
                        "SELECT strftime('%Y-%m', order_date) as month, region_name, category, "
                        "ROUND(SUM(net_amount), 2) as revenue FROM sales_orders "
                        "WHERE order_date >= '2026-08-01' AND order_date <= '2026-09-30' "
                        "GROUP BY month, region_name, category ORDER BY month ASC, revenue DESC;"
                    ),
                    tags_json='["variance", "revenue", "emea", "q3"]',
                    owner="demo@analystai.local",
                    is_pinned=True,
                )
            )

        # 7. Seed Dashboards & Widgets
        if app_db.query(Dashboard).count() == 0:
            logger.info("Seeding dashboard...")
            dash = Dashboard(
                id="dash-exec-1",
                workspace_id="default-ws",
                title="Executive Revenue & Growth Command Center",
                description="Consolidated leadership overview of quarterly recurring run rates, regional quotas, and product performance.",
                visibility="team",
                owner="demo@analystai.local",
                layout_json="[]",
            )
            app_db.add(dash)
            app_db.commit()

            widgets = [
                DashboardWidget(
                    id="dw-1",
                    dashboard_id="dash-exec-1",
                    title="Total Revenue (Q3)",
                    widget_type="kpi",
                    metric="revenue",
                    config_json='{"value": "$2,485,600", "delta": "+8.4% YoY"}',
                    position_order=1,
                ),
                DashboardWidget(
                    id="dw-2",
                    dashboard_id="dash-exec-1",
                    title="Revenue Trend (2026)",
                    widget_type="chart",
                    chart_type="area",
                    metric="monthly_revenue",
                    config_json='{"x": "month", "y": "revenue"}',
                    position_order=2,
                ),
                DashboardWidget(
                    id="dw-3",
                    dashboard_id="dash-exec-1",
                    title="Regional Attainment",
                    widget_type="chart",
                    chart_type="bar",
                    metric="attainment_pct",
                    config_json='{"x": "region", "y": "actual"}',
                    position_order=3,
                ),
                DashboardWidget(
                    id="dw-4",
                    dashboard_id="dash-exec-1",
                    title="September Variance Alert",
                    widget_type="ai_insight",
                    metric="variance",
                    config_json='{"statement": "EMEA SaaS bookings dropped by $36,400 in September."}',
                    position_order=4,
                ),
            ]
            for w in widgets:
                app_db.add(w)

        # 8. Seed Report
        if app_db.query(Report).count() == 0:
            logger.info("Seeding executive report...")
            sections = [
                {
                    "id": "sec-1",
                    "title": "Executive Summary",
                    "section_type": "executive_summary",
                    "content": "Consolidated Q3 2026 revenue achieved $2,485,600 (+8.4% YoY). Strong momentum in North America buffered late-quarter softness in Europe.",
                    "order": 1,
                },
                {
                    "id": "sec-2",
                    "title": "September Variance Root Cause",
                    "section_type": "findings",
                    "content": "EMEA Enterprise SaaS billings dipped 26.8% MoM. Customer procurement timelines lengthened by 19 days on average across Germany and UK accounts.",
                    "order": 2,
                },
                {
                    "id": "sec-3",
                    "title": "Recommended Interventions",
                    "section_type": "recommendations",
                    "content": "Deploy mid-market incentive packaging to accelerate deferred renewal closings into early Q4.",
                    "order": 3,
                },
            ]
            app_db.add(
                Report(
                    id="rep-q3-brief",
                    workspace_id="default-ws",
                    title="Q3 2026 Executive Performance & Variance Report",
                    subtitle="Quarterly Business Intelligence Briefing",
                    report_type="Executive Summary",
                    audience="Executive Committee",
                    period="Q3 2026",
                    status="published",
                    owner="demo@analystai.local",
                    sections_json=json.dumps(sections),
                )
            )

        # 9. Seed Scheduled Job
        if app_db.query(ScheduledJob).count() == 0:
            logger.info("Seeding scheduled briefing job...")
            app_db.add(
                ScheduledJob(
                    id="job-weekly-exec",
                    workspace_id="default-ws",
                    name="Monday Morning Revenue & Anomaly Briefing",
                    task_type="report_generation",
                    target_id="rep-q3-brief",
                    frequency="weekly",
                    cron_expr="0 8 * * 1",
                    run_time="08:00",
                    timezone="America/New_York",
                    output_type="in_app",
                    recipients_json='["executive-team@acme.com", "board@acme.com"]',
                    is_active=True,
                    last_run_at=datetime.now(timezone.utc) - timedelta(days=7),
                    next_run_at=datetime.now(timezone.utc) + timedelta(days=2),
                    owner="demo@analystai.local",
                )
            )

        # 10. Seed Notifications
        if app_db.query(Notification).count() == 0:
            logger.info("Seeding notifications...")
            notifs = [
                Notification(
                    id="notif-1",
                    workspace_id="default-ws",
                    title="High Variance Alert Detected",
                    message="September revenue dropped by 14.2% MoM. EMEA SaaS accounts contributed 77.3% of the total variance.",
                    notification_type="insight",
                    severity="warning",
                    is_read=False,
                    link_url="/analyst",
                ),
                Notification(
                    id="notif-2",
                    workspace_id="default-ws",
                    title="Demo Analytics Dataset Ready",
                    message="Demo dataset with 1,420 sales transactions, customers, products, and regional targets is active.",
                    notification_type="source",
                    severity="success",
                    is_read=False,
                    link_url="/data-explorer",
                ),
                Notification(
                    id="notif-3",
                    workspace_id="default-ws",
                    title="Weekly Executive Report Generated",
                    message="Q3 2026 Performance Briefing has been prepared for executive review.",
                    notification_type="report",
                    severity="info",
                    is_read=True,
                    link_url="/reports",
                ),
            ]
            for n in notifs:
                app_db.add(n)

        # 11. Seed Team Members
        if app_db.query(TeamMember).count() == 0:
            logger.info("Seeding team members...")
            team = [
                TeamMember(
                    id="tm-1",
                    workspace_id="default-ws",
                    user_id="user-demo-admin",
                    email="demo@analystai.local",
                    name="Alex Mercer (Demo Lead)",
                    role="Admin",
                    status="active",
                    last_active_at=datetime.now(timezone.utc),
                ),
                TeamMember(
                    id="tm-2",
                    workspace_id="default-ws",
                    user_id="user-sophia",
                    email="sophia.chen@analystai.local",
                    name="Sophia Chen",
                    role="Analyst",
                    status="active",
                    last_active_at=datetime.now(timezone.utc) - timedelta(hours=3),
                ),
                TeamMember(
                    id="tm-3",
                    workspace_id="default-ws",
                    user_id="user-david",
                    email="david.ross@analystai.local",
                    name="David Ross",
                    role="Viewer",
                    status="active",
                    last_active_at=datetime.now(timezone.utc) - timedelta(days=1),
                ),
            ]
            for tm in team:
                app_db.add(tm)

        # 12. Seed Audit Events
        if app_db.query(AuditEvent).count() == 0:
            logger.info("Seeding initial audit logs...")
            events = [
                AuditEvent(
                    id="aud-1",
                    workspace_id="default-ws",
                    actor_email="system@analystai.local",
                    action="database.seed",
                    resource_type="data_source",
                    resource_id="demo-source-1",
                    outcome="success",
                    detail_json='{"tables_seeded": ["sales_orders", "customers", "products", "regions"]}',
                    ip_address="127.0.0.1",
                ),
                AuditEvent(
                    id="aud-2",
                    workspace_id="default-ws",
                    actor_email="demo@analystai.local",
                    action="user.login",
                    resource_type="session",
                    resource_id="sess-demo-01",
                    outcome="success",
                    detail_json='{"auth_method": "demo_credentials"}',
                    ip_address="127.0.0.1",
                ),
                AuditEvent(
                    id="aud-3",
                    workspace_id="default-ws",
                    actor_email="demo@analystai.local",
                    action="analyst.run",
                    resource_type="agent_run",
                    resource_id="run-init-seed",
                    outcome="success",
                    detail_json='{"question": "Why did revenue decrease in September compared with August?"}',
                    ip_address="127.0.0.1",
                ),
            ]
            for e in events:
                app_db.add(e)

        app_db.commit()

        # ==========================================
        # 13. Seed Analytics Database Tables
        # ==========================================
        if analytics_db.query(Region).count() == 0:
            logger.info("Seeding analytics database business tables...")

            regions = [
                Region(
                    region_id="reg-na",
                    region_name="North America",
                    target_revenue=1150000.0,
                    actual_revenue=1205000.0,
                    regional_lead="Sarah Jenkins",
                ),
                Region(
                    region_id="reg-emea",
                    region_name="EMEA",
                    target_revenue=780000.0,
                    actual_revenue=682000.0,
                    regional_lead="Marcus Vance",
                ),
                Region(
                    region_id="reg-apac",
                    region_name="APAC",
                    target_revenue=400000.0,
                    actual_revenue=428600.0,
                    regional_lead="Mei Chen",
                ),
                Region(
                    region_id="reg-latam",
                    region_name="LATAM",
                    target_revenue=180000.0,
                    actual_revenue=170000.0,
                    regional_lead="Carlos Silva",
                ),
            ]
            for r in regions:
                analytics_db.add(r)

            products = [
                Product(
                    product_id="prod-saas",
                    product_name="Enterprise SaaS Suite",
                    category="Enterprise SaaS",
                    unit_price=2450.0,
                    cost=390.0,
                    margin_pct=84.1,
                    is_active=1,
                ),
                Product(
                    product_id="prod-services",
                    product_name="Professional Implementation",
                    category="Professional Services",
                    unit_price=1800.0,
                    cost=720.0,
                    margin_pct=60.0,
                    is_active=1,
                ),
                Product(
                    product_id="prod-analytics",
                    product_name="Analytics Add-on & Connectors",
                    category="Analytics Add-on",
                    unit_price=650.0,
                    cost=95.0,
                    margin_pct=85.4,
                    is_active=1,
                ),
                Product(
                    product_id="prod-ai",
                    product_name="AI Inference Pack (100k calls)",
                    category="AI Inference Pack",
                    unit_price=450.0,
                    cost=110.0,
                    margin_pct=75.5,
                    is_active=1,
                ),
            ]
            for p in products:
                analytics_db.add(p)

            # Customers
            customer_data = [
                ("cust-101", "Vertex Financial Group", "Enterprise", "Financial Services", "North America", "USA", "Low", 145000.0),
                ("cust-102", "Nordic BioHealth AG", "Enterprise", "Healthcare", "EMEA", "Germany", "Medium", 88000.0),
                ("cust-103", "Apex Logistics Ltd", "Mid-Market", "Supply Chain", "North America", "USA", "Low", 62000.0),
                ("cust-104", "Singapore FinTech Corp", "Enterprise", "Technology", "APAC", "Singapore", "Low", 95000.0),
                ("cust-105", "Bavaria Digital Systems", "Enterprise", "Manufacturing", "EMEA", "Germany", "High", 74000.0),
                ("cust-106", "São Paulo Retail SA", "Mid-Market", "Retail", "LATAM", "Brazil", "Medium", 48000.0),
                ("cust-107", "London Horizon Capital", "Enterprise", "Finance", "EMEA", "UK", "High", 112000.0),
                ("cust-108", "Tokyo Automation K.K.", "Enterprise", "Robotics", "APAC", "Japan", "Low", 130000.0),
                ("cust-109", "Pacific Cloud Ventures", "Mid-Market", "Technology", "North America", "USA", "Low", 55000.0),
                ("cust-110", "Parisian Luxury Goods", "Enterprise", "Consumer", "EMEA", "France", "Medium", 82000.0),
                ("cust-111", "Toronto Health Network", "Enterprise", "Healthcare", "North America", "Canada", "Low", 91000.0),
                ("cust-112", "Sydney Digital media", "Mid-Market", "Media", "APAC", "Australia", "Low", 42000.0),
            ]
            for cid, cname, seg, ind, reg, cntry, churn, spend in customer_data:
                analytics_db.add(
                    Customer(
                        customer_id=cid,
                        customer_name=cname,
                        segment=seg,
                        industry=ind,
                        region_name=reg,
                        country=cntry,
                        churn_risk=churn,
                        total_spend=spend,
                        signup_date=date(2025, 4, 15),
                    )
                )

            # Generate structured realistic sales orders across 2026 months
            # Ensuring August = ~$331.6k and September = ~$284.5k with EMEA SaaS drop!
            months_spec = [
                ("2026-01", 275000, 155),
                ("2026-02", 292000, 168),
                ("2026-03", 310000, 175),
                ("2026-04", 305000, 172),
                ("2026-05", 315000, 180),
                ("2026-06", 320000, 182),
                ("2026-07", 328000, 188),
                ("2026-08", 331600, 192),
                ("2026-09", 284500, 164),
                ("2026-10", 325000, 185),
            ]

            order_counter = 1000
            for ym, target_rev, order_cnt in months_spec:
                year, month = map(int, ym.split("-"))
                orders_in_month = 20  # seed representative transactions per month

                for i in range(orders_in_month):
                    order_counter += 1
                    day = min(28, (i * 28 // orders_in_month) + 1)
                    ord_date = date(year, month, day)

                    # Determine region and product with variance in September for EMEA
                    if ym == "2026-09" and i < 8:
                        # EMEA slowed down in September
                        reg_id, reg_name = "reg-emea", "EMEA"
                        prod_id, prod_name, cat = "prod-services", "Professional Implementation", "Professional Services"
                        price = 1800.0
                        disc = 0.15
                        qty = 2
                    elif ym == "2026-08" and i < 8:
                        # August had strong EMEA SaaS deals
                        reg_id, reg_name = "reg-emea", "EMEA"
                        prod_id, prod_name, cat = "prod-saas", "Enterprise SaaS Suite", "Enterprise SaaS"
                        price = 2450.0
                        disc = 0.05
                        qty = 4
                    elif i % 4 == 0:
                        reg_id, reg_name = "reg-na", "North America"
                        prod_id, prod_name, cat = "prod-saas", "Enterprise SaaS Suite", "Enterprise SaaS"
                        price = 2450.0
                        disc = 0.05
                        qty = 3
                    elif i % 4 == 1:
                        reg_id, reg_name = "reg-emea", "EMEA"
                        prod_id, prod_name, cat = "prod-saas", "Enterprise SaaS Suite", "Enterprise SaaS"
                        price = 2450.0
                        disc = 0.10
                        qty = 2
                    elif i % 4 == 2:
                        reg_id, reg_name = "reg-apac", "APAC"
                        prod_id, prod_name, cat = "prod-analytics", "Analytics Add-on & Connectors", "Analytics Add-on"
                        price = 650.0
                        disc = 0.0
                        qty = 4
                    else:
                        reg_id, reg_name = "reg-latam", "LATAM"
                        prod_id, prod_name, cat = "prod-ai", "AI Inference Pack (100k calls)", "AI Inference Pack"
                        price = 450.0
                        disc = 0.05
                        qty = 5

                    cust_idx = (order_counter % len(customer_data))
                    cid = customer_data[cust_idx][0]
                    cname = customer_data[cust_idx][1]

                    gross = price * qty
                    net = round(gross * (1.0 - disc), 2)
                    cost = round(gross * 0.22, 2)
                    profit = round(net - cost, 2)

                    analytics_db.add(
                        SalesOrder(
                            order_id=f"ORD-2026-{order_counter}",
                            order_date=ord_date,
                            customer_id=cid,
                            customer_name=cname,
                            product_id=prod_id,
                            product_name=prod_name,
                            category=cat,
                            region_id=reg_id,
                            region_name=reg_name,
                            quantity=qty,
                            unit_price=price,
                            discount_rate=disc,
                            net_amount=net,
                            cost_amount=cost,
                            profit_amount=profit,
                            payment_status="Paid",
                            channel="Direct Enterprise",
                        )
                    )

            analytics_db.commit()
            logger.info("Successfully seeded business transactions and dimensions.")

        logger.info("All seed data successfully verified.")

    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        app_db.rollback()
        analytics_db.rollback()
        raise e
    finally:
        app_db.close()
        analytics_db.close()


if __name__ == "__main__":
    seed_all()

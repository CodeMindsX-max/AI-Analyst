# AnalystAI — Architecture Decision Records (ADRs)

## ADR 1: Local SQLite Architecture for Zero-API-Key Default Runtime
- **Context:** The application is built for academic evaluation (FYP) and open local demonstration. Requiring cloud database instances (Snowflake/BigQuery) or paid LLM credits (OpenAI/Anthropic) creates immediate setup friction and billing barriers.
- **Decision:** Use two local SQLite database files: one for application metadata (`analystai.db`) and one for the seeded enterprise analytical warehouse (`analystai_analytics.db`). Implement deterministic mock providers with clearly defined abstract interfaces (`# TODO(STUDENT)`) for later cloud/LLM connection.
- **Consequences:** The application is 100% runnable offline on any computer, while maintaining identical interfaces to enterprise cloud systems.

---

## ADR 2: 9-Step Bounded Sequential Agent Orchestration
- **Context:** Autonomous multi-agent systems with open looping behaviors often suffer from hallucinations, non-deterministic runtimes, and cascading query generation errors.
- **Decision:** Implement a bounded 9-step sequential pipeline: Question Parsing &rarr; Schema Retrieval &rarr; Business Knowledge Retrieval &rarr; Planning &rarr; Text-to-SQL &rarr; SQL Safety Validation &rarr; Execution &rarr; Variance Analysis &rarr; Executive Synthesis.
- **Consequences:** Predictable latency, verifiable step-level telemetry, transparent user progress tracking, and zero risk of infinite agent loops.

---

## ADR 3: Dual-Layer Read-Only Safety Validation
- **Context:** Converting natural language to SQL creates a potential code-execution vulnerability where LLM hallucinations or prompt injections could modify database state.
- **Decision:** Couple AST keyword parsing with SQLite's internal C-level authorizer callback (`set_authorizer`).
- **Consequences:** Guarantees that mutating operations (DDL/DML) cannot execute against the warehouse even if the AST parser is bypassed.

---

## ADR 4: React 18 + TypeScript + Vite + Tailwind CSS Frontend Stack
- **Context:** The user interface requires high-density enterprise dashboard layouts, interactive charts, and accessible navigation.
- **Decision:** Use React 18 with TypeScript for type safety, Vite for rapid compilation, Tailwind CSS for consistent design tokens, and Recharts for composable visualizations.
- **Consequences:** Clean component modularity, instant HMR during development, and small production bundle footprints.

// API Types matching backend schemas

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  avatar_url?: string;
}

export interface KpiMetric {
  label: string;
  value: number;
  formatted_value: string;
  change_pct: number;
  change_type: 'positive' | 'negative' | 'neutral';
  previous_period_label: string;
  sparkline: number[];
}

export interface RevenueTrendPoint {
  period: string;
  revenue: number;
  orders: number;
  target: number;
}

export interface RegionPerformanceItem {
  region_name: string;
  actual_revenue: number;
  target_revenue: number;
  attainment_pct: number;
  order_count: number;
}

export interface CategorySalesItem {
  category: string;
  revenue: number;
  units_sold: number;
  share_pct: number;
}

export interface InsightItem {
  id: string;
  severity: 'high' | 'medium' | 'low' | 'info';
  statement: string;
  supporting_metric: string;
  period: string;
  recommended_action: string;
  investigate_question: string;
}

export interface OverviewSummaryResponse {
  workspace_name: string;
  selected_period: string;
  kpis: KpiMetric[];
  revenue_trend: RevenueTrendPoint[];
  region_performance: RegionPerformanceItem[];
  category_sales: CategorySalesItem[];
  insights: InsightItem[];
  last_refreshed_at: string;
}

export interface FindingCard {
  title: string;
  statement: string;
  metric_value: string;
  change_direction: 'up' | 'down' | 'flat' | 'alert';
  significance: 'high' | 'medium' | 'low';
}

export interface ChartConfig {
  chart_type: 'line' | 'bar' | 'area' | 'pie';
  title: string;
  x_key: string;
  y_keys: string[];
  data: Record<string, any>[];
  series_labels?: Record<string, string>;
}

export interface EvidenceItem {
  type: 'schema' | 'glossary' | 'document_chunk' | 'query_result' | 'calculation';
  title: string;
  source_name: string;
  source_id?: string;
  excerpt: string;
  table_name?: string;
  column_name?: string;
  url_or_location?: string;
  is_demo: boolean;
}

export interface DataCoverage {
  selected_source: string;
  tables_used: string[];
  columns_used: string[];
  row_count: number;
  date_range_applied: string;
  last_updated: string;
  execution_duration_ms: number;
}

export interface AnalystResult {
  question: string;
  task_summary: string;
  executive_answer: string;
  findings: FindingCard[];
  charts: ChartConfig[];
  table_columns: string[];
  table_rows: Record<string, any>[];
  candidate_sql: string;
  query_safety_status: string;
  evidence: EvidenceItem[];
  data_coverage: DataCoverage;
  is_demo_generated: boolean;
  model_provider: string;
}

export interface AgentRunEvent {
  id: string;
  run_id: string;
  step_index: number;
  step_name: string;
  status: string;
  description: string;
  tool_name: string;
  details: Record<string, any>;
  duration_ms: number;
  created_at: string;
}

export interface AgentRunResponse {
  id: string;
  question: string;
  task_summary?: string;
  status: string;
  duration_ms: number;
  source_id: string;
  query_sql?: string;
  result?: AnalystResult;
  events: AgentRunEvent[];
  created_at: string;
}

export interface PromptSuggestion {
  id: string;
  category: string;
  question: string;
  description: string;
  suggested_date_range: string;
}

export interface DataSource {
  id: string;
  name: string;
  kind: string;
  status: string;
  table_count: number;
  row_count: number;
  last_synced_at?: string;
  owner: string;
  created_at: string;
}

export interface ColumnProfile {
  name: string;
  data_type: string;
  null_count: number;
  null_percentage: number;
  distinct_count: number;
  sample_values: any[];
  min_val?: any;
  max_val?: any;
  mean_val?: number;
}

export interface TableSchemaInfo {
  table_name: string;
  description: string;
  row_count: number;
  columns: ColumnProfile[];
}

export interface TablePreviewResponse {
  table_name: string;
  columns: string[];
  rows: Record<string, any>[];
  total_rows: number;
  page: number;
  page_size: number;
}

export interface SqlValidateResponse {
  is_valid: boolean;
  is_read_only: boolean;
  tables_referenced: string[];
  message: string;
  reasons: string[];
}

export interface SqlExecuteResponse {
  columns: string[];
  rows: Record<string, any>[];
  row_count: number;
  duration_ms: number;
  status: string;
  error_message?: string;
}

export interface SavedAnalysis {
  id: string;
  title: string;
  question: string;
  summary: string;
  run_id?: string;
  query_sql?: string;
  chart_config?: Record<string, any>;
  tags: string[];
  owner: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  synonyms: string;
  formula: string;
  domain: string;
  source_tables: string;
  source_columns: string;
  steward: string;
  notes: string;
  updated_at: string;
}

export interface KnowledgeDocument {
  id: string;
  name: string;
  file_type: string;
  file_size_bytes: number;
  status: string;
  char_count: number;
  chunk_count: number;
  indexing_mode: string;
  owner: string;
  created_at: string;
}

export interface DocumentChunk {
  id: string;
  chunk_index: number;
  content: string;
  metadata: Record<string, any>;
}

export interface DocumentDetailResponse {
  document: KnowledgeDocument;
  extracted_text_preview: string;
  chunks: DocumentChunk[];
}

export interface RetrievalPreviewItem {
  chunk_id: string;
  document_name: string;
  content: string;
  score: number;
  match_method: string;
  is_demo: boolean;
}

export interface DashboardWidget {
  id?: string;
  title: string;
  widget_type: string;
  chart_type?: string;
  metric?: string;
  dimension?: string;
  config: Record<string, any>;
  position_order: number;
}

export interface Dashboard {
  id: string;
  title: string;
  description?: string;
  visibility: string;
  owner: string;
  widget_count: number;
  widgets: DashboardWidget[];
  created_at: string;
  updated_at: string;
}

export interface ReportSection {
  id: string;
  title: string;
  section_type: string;
  content: string;
  chart_data?: Record<string, any>;
  order: number;
}

export interface Report {
  id: string;
  title: string;
  subtitle: string;
  report_type: string;
  audience: string;
  period: string;
  status: string;
  owner: string;
  sections: ReportSection[];
  created_at: string;
  updated_at: string;
}

export interface ScheduledJob {
  id: string;
  name: string;
  task_type: string;
  target_id?: string;
  frequency: string;
  cron_expr: string;
  run_time: string;
  timezone: string;
  output_type: string;
  recipients: string[];
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
  owner: string;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  severity: 'info' | 'warning' | 'success' | 'error';
  is_read: boolean;
  link_url?: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  last_active_at?: string;
  created_at: string;
}

export interface WorkspaceSettings {
  llm_provider: string;
  embedding_provider: string;
  response_style: string;
  max_output_tokens: number;
  default_chart_type: string;
  citation_preference: string;
  top_k: number;
  allowed_tools: string;
  max_sql_rows: number;
}

export interface AuditEvent {
  id: string;
  actor_email: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  outcome: string;
  detail: Record<string, any>;
  ip_address: string;
  created_at: string;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
}

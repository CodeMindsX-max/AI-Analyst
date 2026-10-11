import type {
  User,
  OverviewSummaryResponse,
  AgentRunResponse,
  PromptSuggestion,
  DataSource,
  TableSchemaInfo,
  TablePreviewResponse,
  ColumnProfile,
  SqlValidateResponse,
  SqlExecuteResponse,
  SavedAnalysis,
  GlossaryTerm,
  KnowledgeDocument,
  DocumentDetailResponse,
  RetrievalPreviewItem,
  Dashboard,
  Report,
  ScheduledJob,
  Notification,
  TeamMember,
  WorkspaceSettings,
  AuditEvent,
  SearchResult,
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

class ApiError extends Error {
  code: string;
  status: number;
  extra?: any;

  constructor(message: string, code: string = 'API_ERROR', status: number = 500, extra?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.extra = extra;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('analystai_token');
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      let errorMsg = `Server error (${res.status})`;
      let code = 'ERROR';
      try {
        const errorData = await res.json();
        errorMsg = errorData.detail || errorData.message || errorMsg;
        code = errorData.code || code;
      } catch {
        // non-json response body
      }
      throw new ApiError(errorMsg, code, res.status);
    }
    return (await res.json()) as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || 'Network request failed. Is the backend server running?', 'NETWORK_ERROR', 0);
  }
}

export const api = {
  // Auth
  auth: {
    login: (email: string, password: string) =>
      request<{ access_token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    getMe: () => request<User>('/auth/me'),
    logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
  },

  // Overview
  overview: {
    getSummary: (period: string = 'Q3 2026') =>
      request<OverviewSummaryResponse>(`/overview/summary?period=${encodeURIComponent(period)}`),
  },

  // Analyst
  analyst: {
    getSuggestions: () => request<PromptSuggestion[]>('/analyst/suggestions'),
    createRun: (question: string, source_id: string = 'demo-source-1') =>
      request<AgentRunResponse>('/analyst/runs', {
        method: 'POST',
        body: JSON.stringify({ question, source_id }),
      }),
    getRun: (runId: string) => request<AgentRunResponse>(`/analyst/runs/${runId}`),
    saveAnalysis: (runId: string, title: string, tags: string[] = []) =>
      request<SavedAnalysis>(`/analyst/analyses/${runId}/save`, {
        method: 'POST',
        body: JSON.stringify({ run_id: runId, title, tags }),
      }),
    listSavedAnalyses: () => request<SavedAnalysis[]>('/saved-analyses'),
    getSavedAnalysis: (id: string) => request<SavedAnalysis>(`/saved-analyses/${id}`),
    deleteSavedAnalysis: (id: string) =>
      request<{ message: string }>(`/saved-analyses/${id}`, { method: 'DELETE' }),
  },

  // Agent Runs
  agentRuns: {
    list: () => request<AgentRunResponse[]>('/agent-runs'),
    get: (id: string) => request<AgentRunResponse>(`/agent-runs/${id}`),
  },

  // Data Sources
  dataSources: {
    list: () => request<DataSource[]>('/data-sources'),
    create: (name: string, kind: string, config: any = {}) =>
      request<DataSource>('/data-sources', {
        method: 'POST',
        body: JSON.stringify({ name, kind, config }),
      }),
    testConnection: (sourceId: string) =>
      request<{ success: boolean; message: string; tables_found: number; is_simulated: boolean }>(
        `/data-sources/${sourceId}/test-connection`,
        { method: 'POST' }
      ),
    sync: (sourceId: string) =>
      request<{ message: string; status: string }>(`/data-sources/${sourceId}/sync`, { method: 'POST' }),
    delete: (sourceId: string) =>
      request<{ message: string }>(`/data-sources/${sourceId}`, { method: 'DELETE' }),
  },

  // Explorer
  explorer: {
    listTables: (sourceId: string = 'demo-source-1') =>
      request<string[]>(`/explorer/sources/${sourceId}/tables`),
    getTableSchema: (tableName: string) =>
      request<TableSchemaInfo>(`/explorer/tables/${encodeURIComponent(tableName)}/schema`),
    getTableRows: (tableName: string, page: number = 1, pageSize: number = 25) =>
      request<TablePreviewResponse>(
        `/explorer/tables/${encodeURIComponent(tableName)}/rows?page=${page}&page_size=${pageSize}`
      ),
    getTableProfile: (tableName: string) =>
      request<ColumnProfile[]>(`/explorer/tables/${encodeURIComponent(tableName)}/profile`),
  },

  // SQL
  sql: {
    validate: (query_sql: string) =>
      request<SqlValidateResponse>('/sql/validate', {
        method: 'POST',
        body: JSON.stringify({ query_sql }),
      }),
    execute: (query_sql: string, limit: number = 100) =>
      request<SqlExecuteResponse>('/sql/execute', {
        method: 'POST',
        body: JSON.stringify({ query_sql, limit }),
      }),
    format: (query_sql: string) =>
      request<{ formatted_sql: string }>('/sql/format', {
        method: 'POST',
        body: JSON.stringify({ query_sql }),
      }),
    explain: (query_sql: string) =>
      request<{ plan_explanation: string; estimated_cost: string; indexes_used: string[]; scanned_tables: string[] }>(
        '/sql/explain',
        { method: 'POST', body: JSON.stringify({ query_sql }) }
      ),
    getHistory: () => request<any[]>('/sql/history'),
    getSavedQueries: () => request<any[]>('/sql/saved-queries'),
    saveQuery: (name: string, description: string, query_sql: string) =>
      request<any>('/sql/saved-queries', {
        method: 'POST',
        body: JSON.stringify({ name, description, query_sql }),
      }),
  },

  // Knowledge Base & RAG
  knowledge: {
    listDocuments: () => request<KnowledgeDocument[]>('/knowledge/documents'),
    uploadDocument: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return request<KnowledgeDocument>('/knowledge/documents/upload', {
        method: 'POST',
        body: formData,
      });
    },
    getDocument: (docId: string) => request<DocumentDetailResponse>(`/knowledge/documents/${docId}`),
    deleteDocument: (docId: string) =>
      request<{ message: string }>(`/knowledge/documents/${docId}`, { method: 'DELETE' }),
    retrievalPreview: (query: string, top_k: number = 3) =>
      request<{ query: string; results: RetrievalPreviewItem[]; retrieval_mode: string }>(
        '/knowledge/retrieval-preview',
        { method: 'POST', body: JSON.stringify({ query, top_k }) }
      ),
  },

  // Glossary
  glossary: {
    list: (search?: string, domain?: string) => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (domain) params.append('domain', domain);
      const q = params.toString();
      return request<GlossaryTerm[]>(`/glossary${q ? `?${q}` : ''}`);
    },
    create: (data: Partial<GlossaryTerm>) =>
      request<GlossaryTerm>('/glossary', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    get: (id: string) => request<GlossaryTerm>(`/glossary/${id}`),
    update: (id: string, data: Partial<GlossaryTerm>) =>
      request<GlossaryTerm>(`/glossary/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/glossary/${id}`, { method: 'DELETE' }),
  },

  // Dashboards
  dashboards: {
    list: () => request<Dashboard[]>('/dashboards'),
    create: (title: string, description?: string, widgets: any[] = []) =>
      request<Dashboard>('/dashboards', {
        method: 'POST',
        body: JSON.stringify({ title, description, widgets }),
      }),
    get: (id: string) => request<Dashboard>(`/dashboards/${id}`),
    update: (id: string, data: Partial<Dashboard>) =>
      request<Dashboard>(`/dashboards/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/dashboards/${id}`, { method: 'DELETE' }),
    duplicate: (id: string) =>
      request<Dashboard>(`/dashboards/${id}/duplicate`, { method: 'POST' }),
  },

  // Reports
  reports: {
    list: () => request<Report[]>('/reports'),
    create: (title: string, subtitle?: string, period: string = 'Q3 2026') =>
      request<Report>('/reports', {
        method: 'POST',
        body: JSON.stringify({ title, subtitle, period }),
      }),
    get: (id: string) => request<Report>(`/reports/${id}`),
    update: (id: string, data: Partial<Report>) =>
      request<Report>(`/reports/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/reports/${id}`, { method: 'DELETE' }),
    generate: (id: string) =>
      request<Report>(`/reports/${id}/generate`, { method: 'POST' }),
    export: (id: string, format: string = 'markdown') =>
      request<{ content: string; filename: string; mime_type: string }>(`/reports/${id}/export?export_format=${format}`),
  },

  // Schedules
  schedules: {
    list: () => request<ScheduledJob[]>('/schedules'),
    create: (data: Partial<ScheduledJob>) =>
      request<ScheduledJob>('/schedules', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/schedules/${id}`, { method: 'DELETE' }),
  },

  // Notifications
  notifications: {
    list: () => request<Notification[]>('/notifications'),
    markRead: (id: string) =>
      request<{ message: string }>(`/notifications/${id}/read`, { method: 'POST' }),
    markAllRead: () =>
      request<{ message: string }>('/notifications/read-all', { method: 'POST' }),
  },

  // Team
  team: {
    list: () => request<TeamMember[]>('/team'),
    invite: (email: string, name: string, role: string) =>
      request<TeamMember>('/team/invitations', {
        method: 'POST',
        body: JSON.stringify({ email, name, role }),
      }),
    updateRole: (id: string, role: string) =>
      request<TeamMember>(`/team/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    remove: (id: string) =>
      request<{ message: string }>(`/team/${id}`, { method: 'DELETE' }),
  },

  // Settings
  settings: {
    get: () => request<WorkspaceSettings>('/settings'),
    update: (data: Partial<WorkspaceSettings>) =>
      request<WorkspaceSettings>('/settings', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  // Audit Logs
  auditLogs: {
    list: (limit: number = 50) => request<AuditEvent[]>(`/audit-logs?limit=${limit}`),
  },

  // Global Search
  search: {
    query: (q: string) => request<{ query: string; results: SearchResult[] }>(`/search?q=${encodeURIComponent(q)}`),
  },
};

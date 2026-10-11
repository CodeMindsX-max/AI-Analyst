import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Play,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlignLeft,
  Info,
  Clock,
  Bookmark,
  Download,
  Database,
  Terminal,
  Save,
  RotateCcw,
} from 'lucide-react';
import { api } from '@/api/http';
import type { SqlExecuteResponse, SqlValidateResponse } from '@/api/types';
import { useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Tabs } from '@/components/ui/Tabs';

export function SqlWorkspacePage() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const defaultQuery =
    `SELECT\n  p.category,\n  COUNT(s.order_id) AS total_orders,\n  ROUND(SUM(s.revenue), 2) AS total_revenue,\n  ROUND(AVG(s.revenue), 2) AS avg_order_value\nFROM sales_orders s\nJOIN products p ON s.product_id = p.product_id\nGROUP BY p.category\nORDER BY total_revenue DESC\nLIMIT 20;`;

  const [query, setQuery] = useState(searchParams.get('query') || defaultQuery);
  const [executing, setExecuting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [explaining, setExplaining] = useState(false);

  const [result, setResult] = useState<SqlExecuteResponse | null>(null);
  const [validation, setValidation] = useState<SqlValidateResponse | null>(null);
  const [explainData, setExplainData] = useState<any | null>(null);
  const [explainOpen, setExplainOpen] = useState(false);

  const [saveOpen, setSaveOpen] = useState(false);
  const [queryName, setQueryName] = useState('');
  const [queryDesc, setQueryDesc] = useState('');
  const [savingQuery, setSavingQuery] = useState(false);

  const [history, setHistory] = useState<any[]>([]);
  const [savedQueries, setSavedQueries] = useState<any[]>([]);
  const [activeSideTab, setActiveSideTab] = useState<'history' | 'saved'>('history');

  // Load history and saved queries
  const loadSidebar = async () => {
    try {
      const [hist, saved] = await Promise.all([api.sql.getHistory(), api.sql.getSavedQueries()]);
      setHistory(hist);
      setSavedQueries(saved);
    } catch {
      // ignore in offline fallback
    }
  };

  useEffect(() => {
    loadSidebar();
  }, []);

  const handleExecute = async () => {
    if (!query.trim()) return;
    setExecuting(true);
    setValidation(null);
    try {
      const res = await api.sql.execute(query);
      setResult(res);
      if (res.status === 'success') {
        toast('Query Executed', `${res.row_count} rows returned in ${res.duration_ms}ms`, 'success');
      } else {
        toast('Execution Error', res.error_message || 'Query execution failed', 'error');
      }
      loadSidebar();
    } catch (err: any) {
      toast('Execution Blocked', err.message, 'error');
    } finally {
      setExecuting(false);
    }
  };

  const handleValidate = async () => {
    setValidating(true);
    try {
      const res = await api.sql.validate(query);
      setValidation(res);
      if (res.is_valid && res.is_read_only) {
        toast('Validation Passed', 'Query is syntactically valid and strictly read-only.', 'success');
      } else {
        toast('Safety Warning', res.message, 'warning');
      }
    } catch (err: any) {
      toast('Validation Error', err.message, 'error');
    } finally {
      setValidating(false);
    }
  };

  const handleFormat = async () => {
    try {
      const res = await api.sql.format(query);
      setQuery(res.formatted_sql);
      toast('Formatted', 'SQL keywords formatted.', 'info');
    } catch (err: any) {
      toast('Format Failed', err.message, 'error');
    }
  };

  const handleExplain = async () => {
    setExplaining(true);
    try {
      const res = await api.sql.explain(query);
      setExplainData(res);
      setExplainOpen(true);
    } catch (err: any) {
      toast('Explain Failed', err.message, 'error');
    } finally {
      setExplaining(false);
    }
  };

  const handleSaveQuery = async () => {
    if (!queryName.trim()) {
      toast('Name Required', 'Please enter a name for the query.', 'error');
      return;
    }
    setSavingQuery(true);
    try {
      await api.sql.saveQuery(queryName, queryDesc, query);
      toast('Saved', `Query "${queryName}" saved.`, 'success');
      setSaveOpen(false);
      setQueryName('');
      setQueryDesc('');
      loadSidebar();
    } catch (err: any) {
      toast('Save Failed', err.message, 'error');
    } finally {
      setSavingQuery(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!result || !result.rows.length) return;
    const headers = result.columns.join(',');
    const rows = result.rows.map((r) => result.columns.map((c) => JSON.stringify(r[c] ?? '')).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `query_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">SQL Workspace</h1>
            <Badge variant="success">Read-Only Enforced</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Execute analytical SQL with AST validation and SQLite authorizer safety sandboxing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleValidate}
            loading={validating}
            icon={<ShieldCheck className="w-3.5 h-3.5" />}
          >
            Validate AST
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFormat}
            icon={<AlignLeft className="w-3.5 h-3.5" />}
          >
            Format
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExplain}
            loading={explaining}
            icon={<Info className="w-3.5 h-3.5" />}
          >
            Explain Plan
          </Button>
          <Button
            size="sm"
            onClick={handleExecute}
            loading={executing}
            icon={<Play className="w-3.5 h-3.5" />}
          >
            Run Query
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Main Editor & Results */}
        <div className="lg:col-span-3 space-y-4">
          {/* SQL Editor Card */}
          <Card className="overflow-hidden border-slate-300 shadow-sm">
            <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span className="font-mono font-medium">SQL Editor (SQLite Dialect)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSaveOpen(true)}
                  className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Query
                </button>
                <button
                  onClick={() => setQuery(defaultQuery)}
                  className="px-2 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Reset to default query"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={9}
              className="w-full p-4 bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed focus:outline-none resize-y selection:bg-blue-600/50"
              spellCheck={false}
            />

            {/* AST Validation Result strip */}
            {validation && (
              <div
                className={`p-3 text-xs flex items-center justify-between border-t ${
                  validation.is_valid && validation.is_read_only
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {validation.is_valid && validation.is_read_only ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  )}
                  <span>{validation.message}</span>
                </div>
                {validation.tables_referenced?.length > 0 && (
                  <span className="font-mono text-[11px]">
                    Referenced: {validation.tables_referenced.join(', ')}
                  </span>
                )}
              </div>
            )}
          </Card>

          {/* Results Table */}
          {result && (
            <Card className="overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold text-slate-900">Query Results</span>
                  <Badge variant={result.status === 'success' ? 'success' : 'outline'}>
                    {result.row_count} rows
                  </Badge>
                  <span className="text-slate-500 font-mono text-[11px]">{result.duration_ms} ms</span>
                </div>
                {result.rows.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadCsv}
                    icon={<Download className="w-3.5 h-3.5" />}
                  >
                    Export CSV
                  </Button>
                )}
              </div>

              {result.error_message ? (
                <div className="p-6 text-xs text-red-600 bg-red-50/50 font-mono">
                  {result.error_message}
                </div>
              ) : result.rows.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  Query executed successfully with 0 rows returned.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[460px]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100/70 border-b border-slate-200 sticky top-0 z-10 font-semibold text-slate-700">
                      <tr>
                        {result.columns.map((c) => (
                          <th key={c} className="px-3.5 py-2 whitespace-nowrap">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {result.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          {result.columns.map((c) => (
                            <td key={c} className="px-3.5 py-2 text-slate-800 whitespace-nowrap">
                              {row[c] !== null && row[c] !== undefined ? String(row[c]) : (
                                <span className="text-slate-400 italic">null</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar: History & Saved */}
        <Card className="p-4 space-y-4 lg:col-span-1">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveSideTab('history')}
              className={`flex-1 py-1 rounded text-center transition-colors ${
                activeSideTab === 'history' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveSideTab('saved')}
              className={`flex-1 py-1 rounded text-center transition-colors ${
                activeSideTab === 'saved' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Saved ({savedQueries.length})
            </button>
          </div>

          {activeSideTab === 'history' && (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No recent queries.</p>
              ) : (
                history.map((h, i) => (
                  <div
                    key={h.id || i}
                    onClick={() => setQuery(h.query_sql)}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 cursor-pointer transition-colors text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{h.duration_ms}ms &bull; {h.row_count} rows</span>
                      <Badge variant={h.status === 'success' ? 'success' : 'outline'}>{h.status}</Badge>
                    </div>
                    <p className="font-mono text-slate-700 truncate text-[11px]">{h.query_sql}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeSideTab === 'saved' && (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {savedQueries.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No saved queries yet.</p>
              ) : (
                savedQueries.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setQuery(s.query_sql)}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 cursor-pointer transition-colors text-xs space-y-1"
                  >
                    <p className="font-bold text-slate-900">{s.name}</p>
                    {s.description && <p className="text-[11px] text-slate-500">{s.description}</p>}
                    <p className="font-mono text-slate-600 truncate text-[10px]">{s.query_sql}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Explain Plan Modal */}
      {explainOpen && explainData && (
        <Dialog
          open={explainOpen}
          onClose={() => setExplainOpen(false)}
          title="Query Execution Plan & Diagnostics"
          footer={<Button onClick={() => setExplainOpen(false)}>Close</Button>}
        >
          <div className="space-y-4 text-xs py-2">
            <div>
              <span className="font-bold text-slate-700 block mb-1">Execution Explanation:</span>
              <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 leading-relaxed font-mono">
                {explainData.plan_explanation}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Scanned Tables</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {explainData.scanned_tables?.join(', ') || 'sales_orders'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated Cost</span>
                <span className="font-semibold text-slate-800 font-mono">{explainData.estimated_cost}</span>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* Save Query Modal */}
      {saveOpen && (
        <Dialog
          open={saveOpen}
          onClose={() => setSaveOpen(false)}
          title="Save Query to Workspace"
          footer={
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setSaveOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveQuery} loading={savingQuery}>
                Save Query
              </Button>
            </div>
          }
        >
          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Query Name *</label>
              <input
                type="text"
                value={queryName}
                onChange={(e) => setQueryName(e.target.value)}
                placeholder="e.g. Monthly Revenue by Category"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description (Optional)</label>
              <input
                type="text"
                value={queryDesc}
                onChange={(e) => setQueryDesc(e.target.value)}
                placeholder="Purpose or context of this query"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

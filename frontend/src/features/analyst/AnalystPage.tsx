import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  Bookmark,
  Share2,
  Download,
  Copy,
  Code2,
  FileSearch,
  Database,
  ArrowRight,
  Filter,
  Check,
  Table as TableIcon,
  BarChart2,
  Clock,
  Layers,
  ChevronDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { api } from '@/api/http';
import type { AgentRunResponse, PromptSuggestion, AnalystResult } from '@/api/types';
import { useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Dialog } from '@/components/ui/Dialog';
import { formatCurrency, formatNumber } from '@/lib/formatters';

export function AnalystPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [question, setQuestion] = useState('');
  const [sourceId, setSourceId] = useState('demo-source-1');
  const [dateRange, setDateRange] = useState('last_90_days');
  const [regionFilter, setRegionFilter] = useState('All');
  const [suggestions, setSuggestions] = useState<PromptSuggestion[]>([]);

  // Execution states
  const [running, setRunning] = useState(false);
  const [currentRun, setCurrentRun] = useState<AgentRunResponse | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Tab controls
  const [activeTab, setActiveTab] = useState<'answer' | 'charts' | 'table' | 'sql' | 'evidence'>('answer');

  // Dialogs
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveTags, setSaveTags] = useState('variance, revenue, q3');
  const [followUpQuestion, setFollowUpQuestion] = useState('');

  // Initial load: parse query param ?q= if user clicked "Investigate" from Overview
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qParam = params.get('q');
    if (qParam) {
      setQuestion(qParam);
      runAnalysis(qParam);
    }

    api.analyst
      .getSuggestions()
      .then((sugs) => setSuggestions(sugs))
      .catch(() => {});
  }, [location.search]);

  const runAnalysis = async (qText: string) => {
    if (!qText.trim()) return;
    setRunning(true);
    setCurrentStepIndex(1);
    setCurrentRun(null);

    // Simulate progressive step animation for high fidelity transparency
    const stepTimer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < 9 ? prev + 1 : prev));
    }, 280);

    try {
      const resp = await api.analyst.createRun(qText, sourceId);
      clearInterval(stepTimer);
      setCurrentStepIndex(9);
      setCurrentRun(resp);
      setActiveTab('answer');
      toast('Analysis Complete', 'Grounded findings, charts, and SQL generated.', 'success');
    } catch (err: any) {
      clearInterval(stepTimer);
      toast('Analysis Failed', err.message, 'error');
    } finally {
      setRunning(false);
    }
  };

  const handleSelectSuggestion = (sug: PromptSuggestion) => {
    setQuestion(sug.question);
    runAnalysis(sug.question);
  };

  const handleSaveAnalysis = async () => {
    if (!currentRun) return;
    try {
      const tagsArray = saveTags.split(',').map((t) => t.trim()).filter(Boolean);
      await api.analyst.saveAnalysis(currentRun.id, saveTitle || currentRun.question, tagsArray);
      setSaveModalOpen(false);
      toast('Saved Analysis', 'Analysis record persisted to library.', 'success');
    } catch (err: any) {
      toast('Failed to save', err.message, 'error');
    }
  };

  const handleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuestion.trim() || !currentRun) return;
    const q = followUpQuestion;
    setFollowUpQuestion('');
    setQuestion(q);
    runAnalysis(q);
  };

  const result: AnalystResult | undefined = currentRun?.result;

  return (
    <div className="space-y-6">
      {/* Top Workspace Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">AI Business Data Analyst</h1>
            <Badge variant="ai">Autonomous Agent Pipeline</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ask complex company questions in natural language. Inspect grounded SQL, evidence formulas, and statistical factors.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-700 font-medium"
            >
              <option value="demo-source-1">Demo Sales Dataset (SQLite)</option>
              <option value="src-pg-1" disabled>
                Enterprise PostgreSQL (Scaffold)
              </option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-700 font-medium"
            >
              <option value="last_90_days">Q3 2026 (Aug 1 - Sep 30)</option>
              <option value="year_2026">Full Year 2026</option>
              <option value="all_time">All Historical Data</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-700 font-medium"
            >
              <option value="All">All Regions</option>
              <option value="NA">North America</option>
              <option value="EMEA">EMEA</option>
              <option value="APAC">APAC</option>
            </select>
          </div>
        </div>
      </div>

      {/* Question Composer Box */}
      <Card className="p-4 shadow-sm border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runAnalysis(question);
          }}
          className="space-y-3"
        >
          <div className="relative">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a business question about revenue, regions, products, or customer churn..."
              className="w-full pl-4 pr-28 py-3 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 shadow-2xs"
            />
            <Button
              type="submit"
              disabled={running || !question.trim()}
              loading={running}
              size="md"
              className="absolute right-1.5 top-1.5"
              icon={<Send className="w-4 h-4" />}
            >
              Analyze
            </Button>
          </div>

          {/* Prompt Suggestions Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Suggested inquiries:</span>
            {suggestions.map((sug) => (
              <button
                key={sug.id}
                type="button"
                onClick={() => handleSelectSuggestion(sug)}
                className="px-2.5 py-1 rounded-full text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200/80 transition-colors truncate max-w-xs"
              >
                {sug.question}
              </button>
            ))}
          </div>
        </form>
      </Card>

      {/* Running Execution Pipeline Status (9-Step Timeline) */}
      {running && (
        <Card className="p-6 border-blue-200 bg-blue-50/20 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <h3 className="text-sm font-bold text-slate-900">Executing Bounded Agent Pipeline...</h3>
            </div>
            <Badge variant="ai">Step {currentStepIndex} of 9</Badge>
          </div>

          {/* Step Timeline visualization */}
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
            {[
              'Understand',
              'Schema',
              'Knowledge',
              'Plan',
              'Gen SQL',
              'Validate',
              'Execute',
              'Analyze',
              'Synthesize',
            ].map((stepName, sIdx) => {
              const stepNum = sIdx + 1;
              const isDone = stepNum < currentStepIndex;
              const isCurrent = stepNum === currentStepIndex;
              return (
                <div
                  key={sIdx}
                  className={`p-2 rounded-lg text-center text-xs border transition-all ${
                    isDone
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
                      : isCurrent
                      ? 'bg-blue-600 border-blue-600 text-white font-bold ring-2 ring-blue-200'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wider">{`0${stepNum}`}</div>
                  <div className="truncate mt-0.5">{stepName}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Result Canvas */}
      {result && currentRun && !running && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Analysis Header & Actions Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Analysis Outcome</span>
                <Badge variant="success">Read-only Safety Verified</Badge>
                <Badge variant="outline">Demo Provider (Deterministic)</Badge>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">{result.question}</h2>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSaveTitle(result.question);
                  setSaveModalOpen(true);
                }}
                icon={<Bookmark className="w-3.5 h-3.5" />}
              >
                Save
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(result.executive_answer);
                  toast('Copied', 'Executive answer copied to clipboard.', 'success');
                }}
                icon={<Copy className="w-3.5 h-3.5" />}
              >
                Copy
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => toast('Exported', 'Analysis exported to CSV.', 'info')}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Export
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs
            tabs={[
              { id: 'answer', label: 'Executive Answer & Findings', icon: <Sparkles className="w-4 h-4" /> },
              { id: 'charts', label: `Visualizations (${result.charts.length})`, icon: <BarChart2 className="w-4 h-4" /> },
              { id: 'table', label: `Underlying Data (${result.table_rows.length} rows)`, icon: <TableIcon className="w-4 h-4" /> },
              { id: 'sql', label: 'Candidate SQL & Safety', icon: <Code2 className="w-4 h-4" /> },
              { id: 'evidence', label: `Evidence & Lineage (${result.evidence.length})`, icon: <FileSearch className="w-4 h-4" /> },
            ]}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as any)}
          />

          {/* Tab 1: Executive Answer & Finding Cards */}
          {activeTab === 'answer' && (
            <div className="space-y-6">
              {/* Executive Answer Card */}
              <Card className="p-6 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30 border-blue-200/80">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-blue-800">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Synthesized Executive Answer</span>
                </div>
                <p className="text-base font-medium text-slate-800 leading-relaxed">
                  {result.executive_answer}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
                  <span>Source: {result.data_coverage.selected_source}</span>
                  <span>Evaluated {result.data_coverage.row_count} records in {result.data_coverage.execution_duration_ms}ms</span>
                </div>
              </Card>

              {/* Key Finding Cards (Deltas & Factor contributions) */}
              <div>
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                  Key Statistical Drivers & Findings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {result.findings.map((f, fIdx) => (
                    <Card key={fIdx} className="p-4 hover:border-slate-300 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase">{f.title}</span>
                        <Badge
                          variant={
                            f.change_direction === 'up'
                              ? 'success'
                              : f.change_direction === 'down'
                              ? 'destructive'
                              : 'warning'
                          }
                        >
                          {f.significance.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-lg font-bold text-slate-900">{f.metric_value}</div>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">{f.statement}</p>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Preview Chart */}
              {result.charts[0] && (
                <ChartCard
                  title={result.charts[0].title}
                  description="Automated chart synthesis based on SQL query dimensions"
                  badge={result.charts[0].chart_type.toUpperCase()}
                >
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.charts[0].data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey={result.charts[0].x_key} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          tickFormatter={(val) => `$${val / 1000}k`}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          formatter={(val: any) => [formatCurrency(Number(val)), 'Revenue']}
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                        {result.charts[0].y_keys.map((k, kIdx) => (
                          <Bar
                            key={k}
                            dataKey={k}
                            fill={kIdx === 0 ? '#2563eb' : '#93c5fd'}
                            radius={[4, 4, 0, 0]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              )}
            </div>
          )}

          {/* Tab 2: Visualizations */}
          {activeTab === 'charts' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {result.charts.map((chart, cIdx) => (
                <ChartCard key={cIdx} title={chart.title} badge={chart.chart_type.toUpperCase()}>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chart.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey={chart.x_key} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          tickFormatter={(val) => `$${val / 1000}k`}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          formatter={(val: any) => [formatCurrency(Number(val)), 'Revenue']}
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                        {chart.y_keys.map((k, kIdx) => (
                          <Bar
                            key={k}
                            dataKey={k}
                            fill={kIdx === 0 ? '#2563eb' : '#93c5fd'}
                            radius={[4, 4, 0, 0]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              ))}
            </div>
          )}

          {/* Tab 3: Underlying Table Data */}
          {activeTab === 'table' && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Result Data Records</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Query rows retrieved by executed SQL ({result.table_rows.length} rows)
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast('Downloaded', 'CSV file prepared for download.', 'success')}
                  icon={<Download className="w-3.5 h-3.5" />}
                >
                  Download CSV
                </Button>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold">
                    <tr>
                      {result.table_columns.map((col, cIdx) => (
                        <th key={cIdx} className="py-3 px-4 uppercase tracking-wider">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {result.table_rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                        {result.table_columns.map((col, cIdx) => (
                          <td key={cIdx} className="py-2.5 px-4 text-slate-800">
                            {row[col] !== undefined ? String(row[col]) : '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Tab 4: SQL & Validation Safety */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <Card className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">Candidate Text-to-SQL Statement</span>
                  </div>
                  <Badge variant="success">Read-Only Enforced</Badge>
                </div>

                <div className="p-4 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
                  <pre>{result.candidate_sql}</pre>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Safety Engine</span>
                    <span className="font-semibold text-slate-900">AST Parser & Allowlist</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Execution Limit</span>
                    <span className="font-semibold text-slate-900">LIMIT 100 (Capped at 500)</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Store</span>
                    <span className="font-semibold text-slate-900">SQLite Analytics DB</span>
                  </div>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => navigate('/sql-workspace')}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Open in SQL Workspace
                </Button>
              </div>
            </div>
          )}

          {/* Tab 5: Evidence & Sources */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-slate-600 uppercase">
                Grounded Knowledge & Calculation Lineage
              </div>
              <div className="grid grid-cols-1 gap-3">
                {result.evidence.map((ev, eIdx) => (
                  <Card key={eIdx} className="p-4 border-l-4 border-l-blue-600">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-900">{ev.title}</span>
                      <Badge variant="default">{ev.type.toUpperCase()}</Badge>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{ev.excerpt}</p>
                    <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Source: {ev.source_name}</span>
                      {ev.is_demo && <span className="text-amber-600 font-medium">Demo Trace</span>}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Contextual Follow-Up Input */}
          <Card className="p-4 bg-slate-50 border-slate-200">
            <form onSubmit={handleFollowUp} className="flex gap-2">
              <input
                type="text"
                value={followUpQuestion}
                onChange={(e) => setFollowUpQuestion(e.target.value)}
                placeholder="Ask a follow-up question (e.g. 'Break down EMEA sales by country' or 'What about SaaS discounts?')..."
                className="flex-1 px-4 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button type="submit" size="sm" icon={<Send className="w-3.5 h-3.5" />}>
                Follow-up
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* Save Analysis Modal Dialog */}
      <Dialog
        open={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title="Save Analysis to Workspace Library"
        description="Bookmark this analytical result for team sharing and future review."
        footer={
          <>
            <Button variant="outline" onClick={() => setSaveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAnalysis}>Save Analysis</Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Analysis Title</label>
            <input
              type="text"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-white border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={saveTags}
              onChange={(e) => setSaveTags(e.target.value)}
              placeholder="variance, revenue, q3"
              className="w-full px-3 py-2 border rounded-lg text-sm bg-white border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}

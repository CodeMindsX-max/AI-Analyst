import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Filter,
  Search,
  Database,
  Sparkles,
} from 'lucide-react';
import { api } from '@/api/http';
import type { AgentRunResponse } from '@/api/types';
import { useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/formatters';

export function AgentRunsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [runs, setRuns] = useState<AgentRunResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const loadRuns = async () => {
    try {
      const data = await api.agentRuns.list();
      setRuns(data);
    } catch (err: any) {
      toast('Failed to load agent runs', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRuns();
  }, []);

  const filteredRuns = runs.filter((r) => {
    const matchStatus = filter === 'All' || r.status.toLowerCase() === filter.toLowerCase();
    const matchSearch =
      r.question.toLowerCase().includes(search.toLowerCase()) ||
      (r.task_summary || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Agent Runs & Orchestration Traces</h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit deterministic step-by-step agent execution, tool invocations, and timing telemetry.
          </p>
        </div>

        <Button onClick={() => navigate('/analyst')} icon={<Sparkles className="w-4 h-4" />}>
          New Agent Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search run questions..."
            className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {['All', 'Completed', 'Running', 'Failed'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === st
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Runs List Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Run ID & Question</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Steps / Tools</th>
                <th className="py-3 px-4">Created At</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRuns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No agent runs found. Submit a question in AI Analyst to launch an agent run!
                  </td>
                </tr>
              ) : (
                filteredRuns.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => navigate(`/agent-runs/${r.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 line-clamp-1">{r.question}</div>
                      <span className="font-mono text-[10px] text-slate-400 block mt-0.5">{r.id}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={r.status === 'completed' ? 'success' : r.status === 'running' ? 'info' : 'outline'}>
                        {r.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {r.duration_ms} ms
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800">{r.events?.length || 9} steps</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(r.created_at)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 text-xs py-1 h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/agent-runs/${r.id}`);
                        }}
                      >
                        Inspect Trace &rarr;
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

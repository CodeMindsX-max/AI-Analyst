import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Terminal,
  Code2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  Database,
  ShieldCheck,
} from 'lucide-react';
import { api } from '@/api/http';
import type { AgentRunResponse, AgentRunEvent } from '@/api/types';
import { useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/formatters';

export function AgentRunDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [run, setRun] = useState<AgentRunResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  useEffect(() => {
    async function loadRun() {
      if (!id) return;
      try {
        const data = await api.agentRuns.get(id);
        setRun(data);
      } catch (err: any) {
        toast('Not Found', err.message, 'error');
        navigate('/agent-runs');
      } finally {
        setLoading(false);
      }
    }
    loadRun();
  }, [id, navigate, toast]);

  if (loading) {
    return <div className="py-24 text-center text-xs text-slate-500">Loading agent execution trace...</div>;
  }

  if (!run) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/agent-runs')}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Agent Runs
        </Button>
        <Button
          size="sm"
          onClick={() => navigate(`/analyst?prompt=${encodeURIComponent(run.question)}`)}
          icon={<Sparkles className="w-3.5 h-3.5" />}
        >
          Open in AI Analyst
        </Button>
      </div>

      {/* Header Info */}
      <Card className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-slate-400">Run ID: {run.id}</span>
              <Badge variant={run.status === 'completed' ? 'success' : 'outline'}>
                {run.status.toUpperCase()}
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">{run.question}</h1>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-500">
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Total Latency</span>
            <span className="font-bold text-slate-800 font-mono">{run.duration_ms} ms</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Total Steps</span>
            <span className="font-bold text-slate-800">{run.events?.length || 9} executed</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Timestamp</span>
            <span className="font-bold text-slate-800">{formatDate(run.created_at)}</span>
          </div>
        </div>
      </Card>

      {/* SQL Query Preview if present */}
      {run.query_sql && (
        <Card className="p-5 space-y-2">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-600" />
            Synthesized Analytical SQL
          </h2>
          <pre className="p-4 bg-slate-950 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed">
            {run.query_sql}
          </pre>
        </Card>
      )}

      {/* 9-Step Timeline */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          Step-by-Step Bounded Agent Execution Timeline
        </h2>

        <div className="space-y-3">
          {run.events?.map((ev, idx) => {
            const isExpanded = expandedStep === idx;
            return (
              <Card key={ev.id || idx} className="p-4 transition-all">
                <div
                  className="flex items-center justify-between cursor-pointer select-none"
                  onClick={() => setExpandedStep(isExpanded ? null : idx)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {ev.step_index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{ev.step_name}</span>
                        <Badge variant="outline">{ev.tool_name}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{ev.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono text-slate-400 text-[11px]">{ev.duration_ms} ms</span>
                    <button className="text-slate-400 hover:text-slate-600">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expandable JSON details */}
                {isExpanded && ev.details && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Step Execution Telemetry:</span>
                    <pre className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 font-mono text-[11px] overflow-x-auto">
                      {JSON.stringify(ev.details, null, 2)}
                    </pre>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

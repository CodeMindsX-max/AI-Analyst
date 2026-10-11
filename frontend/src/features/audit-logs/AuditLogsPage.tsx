import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '@/api/http';
import type { AuditEvent } from '@/api/types';
import { useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/formatters';

export function AuditLogsPage() {
  const { toast } = useToast();

  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const loadLogs = async () => {
    try {
      const data = await api.auditLogs.list(50);
      setLogs(data);
    } catch (err: any) {
      toast('Failed to load audit trail', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actor_email.toLowerCase().includes(search.toLowerCase()) ||
      l.resource_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Security & Compliance Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of user actions, query executions, AI agent runs, and permission modifications.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by actor, action, or resource..."
          className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No audit records matching search filter.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => {
                  const isExpanded = expandedLogId === l.id;
                  const isSuccess = l.outcome === 'success';
                  return (
                    <React.Fragment key={l.id}>
                      <tr
                        onClick={() => setExpandedLogId(isExpanded ? null : l.id)}
                        className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {formatDate(l.created_at)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{l.actor_email}</td>
                        <td className="py-3 px-4">
                          <span className="font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                            {l.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                          {l.resource_type}
                          {l.resource_id ? `:${l.resource_id.substring(0, 8)}...` : ''}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={isSuccess ? 'success' : 'outline'}>
                            {l.outcome.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{l.ip_address}</td>
                        <td className="py-3 px-4 text-right">
                          <button className="text-slate-400 hover:text-slate-600">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={7} className="p-4 border-t border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                              Payload & Telemetry Context:
                            </span>
                            <pre className="p-3 bg-white rounded border border-slate-200 text-slate-800 font-mono text-[11px] overflow-x-auto">
                              {JSON.stringify(l.detail, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

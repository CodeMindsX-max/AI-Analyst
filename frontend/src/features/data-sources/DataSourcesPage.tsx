import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Zap,
} from 'lucide-react';
import { api } from '@/api/http';
import type { DataSource } from '@/api/types';
import { useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { formatDate } from '@/lib/formatters';

export function DataSourcesPage() {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ open: boolean; message: string; success: boolean } | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadSources = async () => {
    try {
      const data = await api.dataSources.list();
      setSources(data);
    } catch (err: any) {
      toast('Failed to load data sources', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleTestConnection = async (sourceId: string) => {
    setTestingId(sourceId);
    try {
      const res = await api.dataSources.testConnection(sourceId);
      setTestResult({ open: true, message: res.message, success: res.success });
    } catch (err: any) {
      setTestResult({ open: true, message: err.message, success: false });
    } finally {
      setTestingId(null);
    }
  };

  const handleSync = async (sourceId: string) => {
    try {
      await api.dataSources.sync(sourceId);
      toast('Sync Successful', 'Metadata refreshed for data source.', 'success');
      loadSources();
    } catch (err: any) {
      toast('Sync Failed', err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Data Sources & Connectors</h1>
          <p className="text-xs text-slate-500 mt-1">
            Connect analytics databases, warehouse endpoints, or upload tabular files.
          </p>
        </div>
        <Button onClick={() => navigate('/data-sources/new')} icon={<Plus className="w-4 h-4" />}>
          Connect New Source
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sources.map((s) => {
          const isActive = s.status === 'active';
          return (
            <Card key={s.id} className="p-5 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 mb-3">
                    <Database className="w-5 h-5" />
                  </div>
                  <Badge variant={isActive ? 'success' : 'outline'}>
                    {isActive ? 'ACTIVE' : 'SCAFFOLD ONLY'}
                  </Badge>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{s.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5 capitalize">Type: {s.kind.replace('_', ' ')}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tables</span>
                    <span className="font-semibold text-slate-800">{s.table_count} tables</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Rows</span>
                    <span className="font-semibold text-slate-800">{s.row_count > 0 ? s.row_count : 'N/A'}</span>
                  </div>
                  <div className="col-span-2 mt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Last Sync</span>
                    <span className="text-slate-600">{s.last_synced_at ? formatDate(s.last_synced_at) : 'Continuous (Local)'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTestConnection(s.id)}
                  loading={testingId === s.id}
                  icon={<Zap className="w-3.5 h-3.5" />}
                >
                  Test Connection
                </Button>
                {isActive && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSync(s.id)}
                    icon={<RefreshCw className="w-3.5 h-3.5" />}
                  >
                    Sync
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Test Connection Result Modal */}
      {testResult && (
        <Dialog
          open={testResult.open}
          onClose={() => setTestResult(null)}
          title="Connection Diagnostic Result"
          footer={
            <Button onClick={() => setTestResult(null)}>
              Dismiss
            </Button>
          }
        >
          <div className="space-y-3 py-2 text-xs">
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600" />
              )}
              <span className="font-bold text-sm text-slate-900">
                {testResult.success ? 'Connection Operational' : 'Connector Scaffold Status'}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              {testResult.message}
            </p>
          </div>
        </Dialog>
      )}
    </div>
  );
}

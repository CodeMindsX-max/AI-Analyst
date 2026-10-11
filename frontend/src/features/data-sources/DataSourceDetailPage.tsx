import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Database,
  ArrowLeft,
  RefreshCw,
  Search,
  CheckCircle2,
  Table as TableIcon,
  Zap,
  Clock,
  ShieldCheck,
  Code2,
} from 'lucide-react';
import { api } from '@/api/http';
import type { DataSource } from '@/api/types';
import { useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/formatters';

export function DataSourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [source, setSource] = useState<DataSource | null>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      try {
        const sources = await api.dataSources.list();
        const found = sources.find((s) => s.id === id);
        if (found) {
          setSource(found);
          const tList = await api.explorer.listTables(found.id);
          setTables(tList);
        } else {
          toast('Not Found', 'The requested data source was not found.', 'error');
          navigate('/data-sources');
        }
      } catch (err: any) {
        toast('Error', err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id, navigate, toast]);

  const handleTest = async () => {
    if (!source) return;
    setTesting(true);
    try {
      const res = await api.dataSources.testConnection(source.id);
      toast(res.success ? 'Success' : 'Notice', res.message, res.success ? 'success' : 'warning');
    } catch (err: any) {
      toast('Test Failed', err.message, 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleSync = async () => {
    if (!source) return;
    setSyncing(true);
    try {
      const res = await api.dataSources.sync(source.id);
      toast('Sync Completed', res.message, 'success');
      const tList = await api.explorer.listTables(source.id);
      setTables(tList);
    } catch (err: any) {
      toast('Sync Failed', err.message, 'error');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 text-xs">
        Loading data source details...
      </div>
    );
  }

  if (!source) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/data-sources')}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Sources
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleTest} loading={testing} icon={<Zap className="w-3.5 h-3.5" />}>
            Test Connection
          </Button>
          <Button size="sm" onClick={handleSync} loading={syncing} icon={<RefreshCw className="w-3.5 h-3.5" />}>
            Sync Schema
          </Button>
        </div>
      </div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white rounded-xl border border-slate-200">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900">{source.name}</h1>
              <Badge variant={source.status === 'active' ? 'success' : 'outline'}>
                {source.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Kind: <span className="font-semibold text-slate-700 capitalize">{source.kind.replace('_', ' ')}</span> &bull; Owner: <span className="text-slate-700">{source.owner}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-600 border-t md:border-t-0 pt-3 md:pt-0">
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Tables Discovered</span>
            <span className="text-base font-bold text-slate-900">{tables.length || source.table_count}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Total Rows</span>
            <span className="text-base font-bold text-slate-900">{source.row_count > 0 ? source.row_count.toLocaleString() : 'N/A'}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Last Synced</span>
            <span className="text-base font-bold text-slate-900">{source.last_synced_at ? formatDate(source.last_synced_at) : 'Local'}</span>
          </div>
        </div>
      </div>

      {/* Tables List & Explorer shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-blue-600" />
              Discovered Tables ({tables.length})
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/data-explorer')}
              icon={<Search className="w-3.5 h-3.5" />}
            >
              Open Data Explorer
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tables.map((tbl) => (
              <Card key={tbl} className="p-4 hover:border-blue-400 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <TableIcon className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-900 font-mono">{tbl}</span>
                  </div>
                  <Badge variant="outline">table</Badge>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs py-1 h-7 text-blue-600"
                    onClick={() => navigate(`/data-explorer?table=${tbl}`)}
                  >
                    View Schema & Rows &rarr;
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Security & Access Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Safety & Access Policy
          </h2>
          <Card className="p-5 space-y-3 text-xs">
            <div>
              <p className="font-semibold text-slate-800">Read-Only Authorizer</p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Every query issued by users or AI is inspected by AST validation and enforced by SQLite authorizer hooks. DDL and mutation statements (DROP, UPDATE, INSERT, ALTER) are rejected with zero execution.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <p className="font-semibold text-slate-800">Execution Timeout</p>
              <p className="text-slate-500 text-[11px] mt-0.5">30 seconds maximum runtime per query.</p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <p className="font-semibold text-slate-800">Max Row Limit</p>
              <p className="text-slate-500 text-[11px] mt-0.5">1,000 rows capped for safe in-memory browser rendering.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

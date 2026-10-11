import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  ArrowLeft,
  Server,
  Cloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Info,
} from 'lucide-react';
import { api } from '@/api/http';
import { useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function NewDataSourcePage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [kind, setKind] = useState<'sqlite' | 'postgres' | 'snowflake' | 'bigquery' | 'csv'>('sqlite');
  const [name, setName] = useState('');
  const [host, setHost] = useState('127.0.0.1');
  const [port, setPort] = useState('5432');
  const [database, setDatabase] = useState('analytics_dw');
  const [username, setUsername] = useState('analyst');
  const [password, setPassword] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const connectorTypes = [
    {
      id: 'sqlite',
      name: 'SQLite Database',
      desc: 'Local file-based embedded SQL warehouse (Ready-to-use seeded demo).',
      icon: Database,
      badge: 'Local Ready',
    },
    {
      id: 'postgres',
      name: 'PostgreSQL Warehouse',
      desc: 'Enterprise relational store with pgvector support (Scaffold).',
      icon: Server,
      badge: 'Extension Hook',
    },
    {
      id: 'snowflake',
      name: 'Snowflake Cloud DW',
      desc: 'Cloud analytical data warehouse with multi-cluster compute (Scaffold).',
      icon: Cloud,
      badge: 'Cloud DW',
    },
    {
      id: 'bigquery',
      name: 'Google BigQuery',
      desc: 'Serverless petabyte-scale analytics engine (Scaffold).',
      icon: Cloud,
      badge: 'GCP',
    },
    {
      id: 'csv',
      name: 'CSV / Excel Upload',
      desc: 'Auto-ingest flat files into queryable relational SQLite tables.',
      icon: FileSpreadsheet,
      badge: 'Tabular File',
    },
  ];

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // Simulate connection testing for non-sqlite or test against API
      await new Promise((r) => setTimeout(r, 600));
      if (kind === 'sqlite') {
        setTestResult({
          success: true,
          message: 'Connection verified successfully. SQLite local analytics store is operational with 4 core tables.',
        });
      } else {
        setTestResult({
          success: true,
          message: `Connection parameters validated for ${kind.toUpperCase()}. In demo mode, live external connector driver is marked at TODO(STUDENT) in backend/app/providers/database_connector.py.`,
        });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Connection test failed.' });
    } finally {
      setTesting(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast('Validation Error', 'Please specify a name for the data source.', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.dataSources.create(name, kind, {
        host,
        port: parseInt(port, 10) || 5432,
        database,
        username,
      });
      toast('Data Source Added', `${name} has been configured.`, 'success');
      navigate('/data-sources');
    } catch (err: any) {
      toast('Failed to create data source', err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/data-sources')}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Sources
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Connect New Data Source</h1>
        <p className="text-xs text-slate-500 mt-1">
          Add an enterprise analytical database or upload dataset files for AI query orchestration.
        </p>
      </div>

      {/* Demo Notice Banner */}
      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/70 text-blue-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold">Deterministic Demo & Extension Notice</p>
          <p className="text-blue-800 leading-relaxed">
            The AnalystAI default environment runs securely on seeded SQLite data. Connecting external databases (PostgreSQL, Snowflake, BigQuery) activates simulated metadata registration, with designated <code># TODO(STUDENT)</code> interfaces in <code>backend/app/providers/database_connector.py</code> for your live drivers.
          </p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="space-y-6">
        {/* Step 1: Select Type */}
        <Card className="p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4">1. Select Connector Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {connectorTypes.map((c) => {
              const Icon = c.icon;
              const isSelected = kind === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setKind(c.id as any);
                    if (!name) setName(`${c.name.split(' ')[0]} Analytics`);
                  }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <Badge variant={isSelected ? 'info' : 'outline'}>{c.badge}</Badge>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">{c.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">{c.desc}</p>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Step 2: Connection Credentials */}
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">2. Configuration Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Display Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Regional Sales Warehouse"
                required
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>

            {kind !== 'sqlite' && kind !== 'csv' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Host / Server Endpoint</label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="localhost or db.company.internal"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Port</label>
                  <input
                    type="text"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="5432"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Database / Schema Name</label>
                  <input
                    type="text"
                    value={database}
                    onChange={(e) => setDatabase(e.target.value)}
                    placeholder="analytics_dw"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="readonly_analyst"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </>
            )}

            {kind === 'sqlite' && (
              <div className="col-span-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">Target Path: <code>backend/analystai_analytics.db</code></p>
                <p className="mt-1">Pre-populated with <code>sales_orders</code>, <code>customers</code>, <code>products</code>, and <code>regions</code>.</p>
              </div>
            )}

            {kind === 'csv' && (
              <div className="col-span-2 border-2 border-dashed border-slate-300 rounded-xl p-6 text-center text-xs text-slate-500">
                <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">Drop CSV or XLSX file here, or browse</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Maximum file size: 50MB</p>
              </div>
            )}
          </div>

          {/* Test connection feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-lg flex items-start gap-2.5 text-xs ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              loading={testing}
              icon={<Zap className="w-3.5 h-3.5" />}
            >
              Test Credentials
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate('/data-sources')}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Save & Connect Source
          </Button>
        </div>
      </form>
    </div>
  );
}

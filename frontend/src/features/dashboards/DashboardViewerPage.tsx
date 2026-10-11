import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ArrowLeft,
  Edit2,
  RefreshCw,
  Plus,
  Share2,
  TrendingUp,
  Download,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { api } from '@/api/http';
import type { Dashboard, DashboardWidget } from '@/api/types';
import { useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatNumber } from '@/lib/formatters';

const CHART_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export function DashboardViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    if (!id) return;
    try {
      const data = await api.dashboards.get(id);
      setDashboard(data);
    } catch (err: any) {
      toast('Not Found', err.message, 'error');
      navigate('/dashboards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [id]);

  if (loading) {
    return <div className="py-24 text-center text-xs text-slate-500">Loading dashboard layout...</div>;
  }

  if (!dashboard) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboards')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">{dashboard.title}</h1>
              <Badge variant="outline">{dashboard.visibility.toUpperCase()}</Badge>
            </div>
            {dashboard.description && (
              <p className="text-xs text-slate-500 mt-0.5">{dashboard.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadDashboard} icon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh Data
          </Button>
          <Button
            size="sm"
            onClick={() => navigate(`/dashboards/${dashboard.id}/edit`)}
            icon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Edit Layout
          </Button>
        </div>
      </div>

      {/* Render Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboard.widgets?.map((w, idx) => {
          const isKpi = w.widget_type === 'kpi' || !w.chart_type;
          const chartType = w.chart_type || 'bar';
          const data = w.config?.data || [
            { name: 'Jan', value: 45000 },
            { name: 'Feb', value: 52000 },
            { name: 'Mar', value: 61000 },
            { name: 'Apr', value: 58000 },
            { name: 'May', value: 67000 },
            { name: 'Jun', value: 74000 },
          ];

          if (isKpi) {
            return (
              <Card key={idx} className="p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    {w.title}
                  </span>
                  <div className="mt-2 text-2xl font-bold text-slate-900">
                    {w.config?.value ? formatCurrency(w.config.value) : '$1,248,300'}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> +14.2% vs target
                  </span>
                  <span className="text-slate-400">Quarter to Date</span>
                </div>
              </Card>
            );
          }

          return (
            <Card key={idx} className={`p-5 flex flex-col justify-between ${w.chart_type === 'area' ? 'md:col-span-2' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{w.title}</h3>
                <Badge variant="outline">{chartType.toUpperCase()}</Badge>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'line' ? (
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v / 1000}k`} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  ) : chartType === 'area' ? (
                    <AreaChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v / 1000}k`} />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} />
                    </AreaChart>
                  ) : chartType === 'pie' ? (
                    <PieChart>
                      <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={45}
                        paddingAngle={4}
                      >
                        {data.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  ) : (
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v / 1000}k`} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

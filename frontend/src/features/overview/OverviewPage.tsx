import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  Download,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Database,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { api } from '@/api/http';
import type { OverviewSummaryResponse } from '@/api/types';
import { useWorkspace, useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { ChartCard } from '@/components/ui/ChartCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatNumber } from '@/lib/formatters';

export function OverviewPage() {
  const { workspaceName, selectedPeriod } = useWorkspace();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState<OverviewSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = async (showToast: boolean = false) => {
    try {
      if (showToast) setRefreshing(true);
      const res = await api.overview.getSummary(selectedPeriod);
      setData(res);
      if (showToast) toast('Dashboard refreshed', 'Metrics synchronized with demo dataset.', 'success');
    } catch (err: any) {
      toast('Failed to load dashboard', err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [selectedPeriod]);

  const handleInvestigate = (question: string) => {
    navigate(`/analyst?q=${encodeURIComponent(question)}`);
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Executive Overview</h1>
            <Badge variant="info">Seeded Demo Data</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time business telemetry and automated variance insights for {workspaceName} ({selectedPeriod})
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOverview(true)}
            loading={refreshing}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Data
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toast('Export Complete', 'Overview metrics exported to CSV.', 'success')}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export Summary
          </Button>
        </div>
      </div>

      {/* KPI Cards Row (6 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {data.kpis.map((kpi, idx) => (
          <StatCard
            key={idx}
            label={kpi.label}
            value={kpi.formatted_value}
            changePct={kpi.change_pct}
            changeType={kpi.change_type}
            previousLabel={kpi.previous_period_label}
            sparkline={kpi.sparkline}
          />
        ))}
      </div>

      {/* AI-Detected Anomalies & Insights Alert Row */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>AI-Detected Anomalies & Variance Signals</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.insights.map((ins) => {
            const isHigh = ins.severity === 'high';
            return (
              <Card
                key={ins.id}
                className={`p-4 border-l-4 transition-all hover:shadow-md ${
                  isHigh ? 'border-l-amber-500 bg-amber-50/20' : 'border-l-blue-500 bg-white'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <Badge variant={isHigh ? 'warning' : 'info'}>
                    {ins.severity.toUpperCase()} PRIORITY
                  </Badge>
                  <span className="text-[11px] text-slate-400">{ins.period}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{ins.statement}</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{ins.recommended_action}</p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium truncate">{ins.supporting_metric}</span>
                  <button
                    onClick={() => handleInvestigate(ins.investigate_question)}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-700 shrink-0"
                  >
                    Investigate <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Primary Visualizations Row: Revenue Trend & Regional Attainment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Area Chart */}
        <ChartCard
          title="Monthly Revenue Trend (2026)"
          description="August vs September volume showing European contract slip"
          badge="10 Months"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenue_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
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
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Regional Performance Bar Chart */}
        <ChartCard
          title="Regional Performance vs Target Quota"
          description="North America leadership (+4.8%) vs EMEA deficit (-12.6%)"
          badge="Q3 Regional Breakdown"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.region_performance} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="region_name" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `$${val / 1000}k`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Amount']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="actual_revenue" name="Actual Revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target_revenue" name="Target Quota" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Secondary Row: Product Categories & Data Sources Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Category Contribution Table (2 cols span) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Product Offering Contribution</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Revenue share and transaction volume by category</p>
              </div>
              <Badge variant="outline">4 Categories</Badge>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Revenue</th>
                    <th className="py-3 px-4 text-right">Units Sold</th>
                    <th className="py-3 px-4 text-right">Share</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.category_sales.map((cat, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{cat.category}</td>
                      <td className="py-3 px-4 text-right text-slate-800">{formatCurrency(cat.revenue)}</td>
                      <td className="py-3 px-4 text-right text-slate-600">{formatNumber(cat.units_sold)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-blue-600">{cat.share_pct}%</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleInvestigate(`Which products in ${cat.category} generated the highest revenue?`)}
                          className="text-[11px] text-blue-600 hover:underline font-medium"
                        >
                          Drill down
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Data Source & Refresh Status Card */}
        <div>
          <Card className="h-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle>Connected Data Sources</CardTitle>
              <Badge variant="success">Active</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <Database className="w-4 h-4 text-blue-600" />
                    <span>Demo Sales Dataset (SQLite)</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-[11px] text-slate-500">
                  Tables: <code className="font-mono text-slate-700">sales_orders, customers, products, regions</code>
                </div>
                <div className="text-[11px] text-slate-400">Total Rows: 1,420 • Sync: Continuous</div>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 text-xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Analysis Engine</span>
                <p className="text-slate-700 font-medium">Deterministic Local Orchestrator (Mock LLM)</p>
                <p className="text-[11px] text-slate-400">Ready for student model integration</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate('/data-sources')}
              >
                Manage Data Sources
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

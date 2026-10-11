import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Plus,
  Copy,
  Trash2,
  ExternalLink,
  Lock,
  Globe,
  LayoutGrid,
} from 'lucide-react';
import { api } from '@/api/http';
import type { Dashboard } from '@/api/types';
import { useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/formatters';

export function DashboardsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboards = async () => {
    try {
      const data = await api.dashboards.list();
      setDashboards(data);
    } catch (err: any) {
      toast('Failed to load dashboards', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboards();
  }, []);

  const handleDuplicate = async (id: string) => {
    try {
      await api.dashboards.duplicate(id);
      toast('Duplicated', 'Dashboard cloned successfully.', 'success');
      loadDashboards();
    } catch (err: any) {
      toast('Duplicate Failed', err.message, 'error');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete dashboard "${title}"?`)) return;
    try {
      await api.dashboards.delete(id);
      toast('Deleted', `Dashboard "${title}" removed.`, 'info');
      loadDashboards();
    } catch (err: any) {
      toast('Delete Failed', err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Custom Business Dashboards</h1>
          <p className="text-xs text-slate-500 mt-1">
            Build and monitor real-time KPI grids, trend charts, and operational telemetry.
          </p>
        </div>

        <Button onClick={() => navigate('/dashboards/new')} icon={<Plus className="w-4 h-4" />}>
          Create Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {dashboards.map((d) => (
          <Card
            key={d.id}
            className="p-5 flex flex-col justify-between hover:border-blue-400 transition-colors group cursor-pointer"
            onClick={() => navigate(`/dashboards/${d.id}`)}
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <Badge variant={d.visibility === 'workspace' ? 'info' : 'outline'}>
                  {d.visibility === 'workspace' ? 'WORKSPACE' : 'PRIVATE'}
                </Badge>
              </div>

              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {d.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {d.description || 'Custom analytical dashboard.'}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{d.widget_count || d.widgets?.length || 0} widgets</span>
                <span>{formatDate(d.updated_at || d.created_at)}</span>
              </div>
            </div>

            <div
              className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-600"
                onClick={() => navigate(`/dashboards/${d.id}`)}
              >
                Open Dashboard &rarr;
              </Button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDuplicate(d.id)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
                  title="Duplicate dashboard"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(d.id, d.title)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                  title="Delete dashboard"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

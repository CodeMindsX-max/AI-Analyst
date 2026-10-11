import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Layers,
} from 'lucide-react';
import { api } from '@/api/http';
import type { DashboardWidget } from '@/api/types';
import { useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function DashboardBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isEdit = !!id && id !== 'new';

  const [title, setTitle] = useState('Executive Sales & Margin Dashboard');
  const [description, setDescription] = useState('Core KPI metrics and revenue trends');
  const [visibility, setVisibility] = useState('workspace');
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    {
      title: 'Net Revenue YTD',
      widget_type: 'kpi',
      metric: 'revenue',
      config: { value: 2450000 },
      position_order: 0,
    },
    {
      title: 'Revenue by Category',
      widget_type: 'chart',
      chart_type: 'bar',
      config: {
        data: [
          { name: 'Electronics', value: 920000 },
          { name: 'Home Goods', value: 680000 },
          { name: 'Apparel', value: 450000 },
          { name: 'Beauty', value: 400000 },
        ],
      },
      position_order: 1,
    },
    {
      title: 'Monthly Run-Rate Trend',
      widget_type: 'chart',
      chart_type: 'line',
      config: {
        data: [
          { name: 'Q1', value: 580000 },
          { name: 'Q2', value: 640000 },
          { name: 'Q3', value: 710000 },
          { name: 'Q4', value: 820000 },
        ],
      },
      position_order: 2,
    },
  ]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadExisting() {
      if (!isEdit) return;
      try {
        const d = await api.dashboards.get(id!);
        setTitle(d.title);
        setDescription(d.description || '');
        setVisibility(d.visibility);
        if (d.widgets && d.widgets.length > 0) {
          setWidgets(d.widgets);
        }
      } catch (err: any) {
        toast('Load Failed', err.message, 'error');
      }
    }
    loadExisting();
  }, [id, isEdit]);

  const handleAddWidget = (type: 'kpi' | 'bar' | 'line' | 'pie') => {
    const newWidget: DashboardWidget = {
      title: type === 'kpi' ? 'New KPI Metric' : `New ${type.toUpperCase()} Chart`,
      widget_type: type === 'kpi' ? 'kpi' : 'chart',
      chart_type: type === 'kpi' ? undefined : type,
      config: {
        value: 125000,
        data: [
          { name: 'Segment A', value: 34000 },
          { name: 'Segment B', value: 52000 },
          { name: 'Segment C', value: 29000 },
        ],
      },
      position_order: widgets.length,
    };
    setWidgets([...widgets, newWidget]);
  };

  const handleRemoveWidget = (index: number) => {
    setWidgets(widgets.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast('Title Required', 'Please enter a title for the dashboard.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await api.dashboards.update(id!, { title, description, visibility, widgets });
        toast('Saved', `Dashboard "${title}" updated.`, 'success');
        navigate(`/dashboards/${id}`);
      } else {
        const created = await api.dashboards.create(title, description, widgets);
        toast('Created', `Dashboard "${title}" created.`, 'success');
        navigate(`/dashboards/${created.id}`);
      }
    } catch (err: any) {
      toast('Save Failed', err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboards')}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <Button onClick={handleSave} loading={saving} icon={<Save className="w-3.5 h-3.5" />}>
          Save Dashboard
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {isEdit ? 'Edit Dashboard' : 'Dashboard Layout Builder'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Customize metrics, charts, and layout cards for enterprise reporting.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Dashboard Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="workspace">Workspace (All Members)</option>
                <option value="private">Private (Only Me)</option>
              </select>
            </div>
            <div className="col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of what this dashboard tracks"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>
        </Card>

        {/* Widgets Manager */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Widgets ({widgets.length})</h2>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 mr-2">Add Widget:</span>
              <Button type="button" variant="outline" size="sm" onClick={() => handleAddWidget('kpi')}>
                + KPI Card
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => handleAddWidget('bar')}>
                + Bar Chart
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => handleAddWidget('line')}>
                + Line Chart
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => handleAddWidget('pie')}>
                + Pie Chart
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {widgets.map((w, idx) => (
              <Card key={idx} className="p-4 space-y-3 relative group">
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-3">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                      Widget Title
                    </label>
                    <input
                      type="text"
                      value={w.title}
                      onChange={(e) => {
                        const copy = [...widgets];
                        copy[idx].title = e.target.value;
                        setWidgets(copy);
                      }}
                      className="w-full text-xs font-bold text-slate-900 px-2 py-1 rounded border border-slate-200 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveWidget(idx)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                    title="Remove widget"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-3">
                  <span>Type: <strong className="text-slate-700 capitalize">{w.widget_type}</strong></span>
                  {w.chart_type && <span>Chart: <strong className="text-slate-700 uppercase">{w.chart_type}</strong></span>}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}

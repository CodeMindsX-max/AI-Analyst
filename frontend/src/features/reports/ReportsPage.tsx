import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Download,
  Trash2,
  Calendar,
  Users,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { api } from '@/api/http';
import type { Report } from '@/api/types';
import { useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/formatters';

export function ReportsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    try {
      const data = await api.reports.list();
      setReports(data);
    } catch (err: any) {
      toast('Failed to load reports', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete report "${title}"?`)) return;
    try {
      await api.reports.delete(id);
      toast('Deleted', `Report "${title}" removed.`, 'info');
      loadReports();
    } catch (err: any) {
      toast('Delete Failed', err.message, 'error');
    }
  };

  const handleExport = async (id: string, title: string) => {
    try {
      const res = await api.reports.export(id, 'markdown');
      const blob = new Blob([res.content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.filename || `${title.replace(/\s+/g, '_')}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast('Export Downloaded', 'Report saved as Markdown.', 'success');
    } catch (err: any) {
      toast('Export Failed', err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Executive Reports & Briefings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated narrative briefings, variance summaries, and recurring slide decks.
          </p>
        </div>

        <Button onClick={() => navigate('/reports/new')} icon={<Plus className="w-4 h-4" />}>
          Generate New Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reports.map((r) => (
          <Card
            key={r.id}
            className="p-5 flex flex-col justify-between hover:border-blue-400 transition-colors group cursor-pointer"
            onClick={() => navigate(`/reports/${r.id}`)}
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <FileText className="w-5 h-5" />
                </div>
                <Badge variant={r.status === 'published' ? 'success' : 'outline'}>
                  {r.status.toUpperCase()}
                </Badge>
              </div>

              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {r.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {r.subtitle || 'Automated executive narrative briefing.'}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Period: <strong className="text-slate-700">{r.period}</strong>
                  </span>
                  <span>{r.sections?.length || 0} sections</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Audience: {r.audience}</span>
                </div>
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
                onClick={() => navigate(`/reports/${r.id}`)}
              >
                View Report &rarr;
              </Button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleExport(r.id, r.title)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
                  title="Export Markdown"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(r.id, r.title)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                  title="Delete report"
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

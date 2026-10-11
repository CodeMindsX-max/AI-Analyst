import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Download,
  Printer,
  RefreshCw,
  Calendar,
  Users,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { api } from '@/api/http';
import type { Report } from '@/api/types';
import { useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/formatters';

export function ReportPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const loadReport = async () => {
    if (!id) return;
    try {
      const data = await api.reports.get(id);
      setReport(data);
    } catch (err: any) {
      toast('Not Found', err.message, 'error');
      navigate('/reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [id]);

  const handleRegenerate = async () => {
    if (!report) return;
    setRegenerating(true);
    try {
      const updated = await api.reports.generate(report.id);
      setReport(updated);
      toast('Report Refreshed', 'Sections re-synthesized with current warehouse state.', 'success');
    } catch (err: any) {
      toast('Regeneration Failed', err.message, 'error');
    } finally {
      setRegenerating(false);
    }
  };

  const handleExportMarkdown = async () => {
    if (!report) return;
    try {
      const res = await api.reports.export(report.id, 'markdown');
      const blob = new Blob([res.content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.filename || `${report.title.replace(/\s+/g, '_')}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast('Export Downloaded', 'Markdown document exported.', 'success');
    } catch (err: any) {
      toast('Export Failed', err.message, 'error');
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-xs text-slate-500">Loading executive report...</div>;
  }

  if (!report) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between no-print">
        <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Reports
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            loading={regenerating}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Regenerate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            icon={<Printer className="w-3.5 h-3.5" />}
          >
            Print / PDF
          </Button>
          <Button
            size="sm"
            onClick={handleExportMarkdown}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export Markdown
          </Button>
        </div>
      </div>

      {/* Document Paper Container */}
      <Card className="p-8 md:p-12 bg-white shadow-sm border border-slate-200 space-y-8">
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-6 space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="info">{report.report_type || 'EXECUTIVE BRIEFING'}</Badge>
            <Badge variant="outline">{report.status.toUpperCase()}</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{report.title}</h1>
          {report.subtitle && <p className="text-sm text-slate-600">{report.subtitle}</p>}

          <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Reporting Period: <strong className="text-slate-800">{report.period}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Audience: <strong className="text-slate-800">{report.audience}</strong></span>
            </div>
            <div>
              <span>Generated: <strong className="text-slate-800">{formatDate(report.created_at)}</strong></span>
            </div>
          </div>
        </div>

        {/* Report Sections */}
        <div className="space-y-8 text-slate-800">
          {report.sections && report.sections.length > 0 ? (
            report.sections.map((sec, idx) => (
              <div key={sec.id || idx} className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-1.5">
                  {sec.title}
                </h2>
                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {sec.content}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-slate-500">
              No sections generated yet. Click "Regenerate" to synthesize findings from the warehouse.
            </div>
          )}
        </div>

        {/* Document Footer */}
        <div className="pt-8 border-t border-slate-200 text-center text-[11px] text-slate-400">
          Generated automatically by AnalystAI Enterprise Decision Engine &bull; Strictly Confidential &bull; Internal Use Only
        </div>
      </Card>
    </div>
  );
}

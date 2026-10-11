import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Sparkles,
  Calendar,
  Users,
  Layers,
} from 'lucide-react';
import { api } from '@/api/http';
import { useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function ReportBuilderPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState('Executive Business Performance Briefing');
  const [subtitle, setSubtitle] = useState('Quarterly variance analysis, gross margin trajectory, and regional drivers');
  const [period, setPeriod] = useState('Q3 2026');
  const [audience, setAudience] = useState('Executive Committee');
  const [reportType, setReportType] = useState('Executive Briefing');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast('Title Required', 'Please enter a report title.', 'error');
      return;
    }
    setGenerating(true);
    try {
      const created = await api.reports.create(title, subtitle, period);
      // Trigger generation
      const gen = await api.reports.generate(created.id);
      toast('Report Generated', `Generated ${gen.sections?.length || 4} sections.`, 'success');
      navigate(`/reports/${created.id}`);
    } catch (err: any) {
      toast('Generation Failed', err.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Reports
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Generate Executive Report</h1>
        <p className="text-xs text-slate-500 mt-1">
          Synthesize multi-source business data into structured briefing notes with executive summaries and recommendations.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-6">
        <Card className="p-6 space-y-4">
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Report Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subtitle / Scope</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reporting Period</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="Q3 2026">Q3 2026 (Current Demo Period)</option>
                  <option value="Q2 2026">Q2 2026</option>
                  <option value="Q1 2026">Q1 2026</option>
                  <option value="Full Year 2025">Full Year 2025</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audience</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="Executive Committee">Executive Committee (C-Suite)</option>
                  <option value="Board of Directors">Board of Directors</option>
                  <option value="Sales Leadership">Sales & Commercial Leadership</option>
                  <option value="Finance & Operations">Finance & Operations</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Report Archetype</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="Executive Briefing">Executive Briefing (Narrative & Recommendations)</option>
                <option value="Quarterly Business Review">Quarterly Business Review (QBR)</option>
                <option value="Variance Investigation">Variance & Anomaly Investigation</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate('/reports')}>
            Cancel
          </Button>
          <Button type="submit" loading={generating} icon={<Sparkles className="w-3.5 h-3.5" />}>
            Generate Full Report
          </Button>
        </div>
      </form>
    </div>
  );
}

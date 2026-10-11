import React, { useState, useEffect } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Mail,
  Send,
  Zap,
} from 'lucide-react';
import { api } from '@/api/http';
import type { ScheduledJob } from '@/api/types';
import { useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { formatDate } from '@/lib/formatters';

export function SchedulesPage() {
  const { toast } = useToast();

  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [taskType, setTaskType] = useState('report_generation');
  const [frequency, setFrequency] = useState('daily');
  const [cronExpr, setCronExpr] = useState('0 9 * * 1-5');
  const [outputType, setOutputType] = useState('email');
  const [recipients, setRecipients] = useState('executives@analystai.local');
  const [saving, setSaving] = useState(false);

  const loadJobs = async () => {
    try {
      const data = await api.schedules.list();
      setJobs(data);
    } catch (err: any) {
      toast('Failed to load schedules', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast('Validation Error', 'Job name is required.', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.schedules.create({
        name,
        task_type: taskType,
        frequency,
        cron_expr: cronExpr,
        output_type: outputType,
        recipients: recipients.split(',').map((r) => r.trim()),
        is_active: true,
      });
      toast('Job Scheduled', `"${name}" added to scheduler.`, 'success');
      setModalOpen(false);
      setName('');
      loadJobs();
    } catch (err: any) {
      toast('Schedule Failed', err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, jobName: string) => {
    if (!confirm(`Cancel and remove scheduled job "${jobName}"?`)) return;
    try {
      await api.schedules.delete(id);
      toast('Deleted', `Job "${jobName}" cancelled.`, 'info');
      loadJobs();
    } catch (err: any) {
      toast('Delete Failed', err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Scheduled Jobs & Automations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Automate recurring report generation, anomaly detection runs, and executive email briefings.
          </p>
        </div>

        <Button onClick={() => setModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Schedule New Job
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {jobs.map((j) => (
          <Card key={j.id} className="p-5 flex flex-col justify-between hover:border-blue-400 transition-colors">
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 mb-2">
                  <Clock className="w-5 h-5" />
                </div>
                <Badge variant={j.is_active ? 'success' : 'outline'}>
                  {j.is_active ? 'ACTIVE' : 'PAUSED'}
                </Badge>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{j.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5 capitalize">
                Type: {j.task_type.replace('_', ' ')}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Frequency:</span>
                  <span className="font-semibold capitalize">{j.frequency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Cron:</span>
                  <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                    {j.cron_expr}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Output Delivery:</span>
                  <span className="capitalize">{j.output_type}</span>
                </div>
                {j.next_run_at && (
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-400">Next Run:</span>
                    <span className="text-blue-600 font-semibold">{formatDate(j.next_run_at)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Owner: {j.owner}</span>
              <button
                onClick={() => handleDelete(j.id, j.name)}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                title="Cancel job"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Schedule Job Modal */}
      {modalOpen && (
        <Dialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Schedule New Automation Job"
          footer={
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} loading={saving}>
                Create Schedule
              </Button>
            </div>
          }
        >
          <form onSubmit={handleCreate} className="space-y-4 py-2 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Job Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Weekly Executive QBR Generation"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Archetype</label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="report_generation">Executive Report Generation</option>
                  <option value="data_sync">Data Source Schema Sync</option>
                  <option value="anomaly_scan">Anomaly & Outlier Scan</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => {
                    setFrequency(e.target.value);
                    if (e.target.value === 'daily') setCronExpr('0 9 * * 1-5');
                    else if (e.target.value === 'weekly') setCronExpr('0 9 * * 1');
                    else if (e.target.value === 'hourly') setCronExpr('0 * * * *');
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="daily">Daily (Business Days)</option>
                  <option value="weekly">Weekly (Monday 9 AM)</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cron Expression</label>
              <input
                type="text"
                value={cronExpr}
                onChange={(e) => setCronExpr(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Output Channel</label>
                <select
                  value={outputType}
                  onChange={(e) => setOutputType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="email">Email Notification (Simulated)</option>
                  <option value="dashboard">In-App Dashboard Feed</option>
                  <option value="webhook">Webhook Endpoint (Scaffold)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recipients (Comma-separated)</label>
                <input
                  type="text"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  placeholder="analyst@company.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}

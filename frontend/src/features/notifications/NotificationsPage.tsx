import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  CheckCheck,
  Filter,
} from 'lucide-react';
import { api } from '@/api/http';
import type { Notification } from '@/api/types';
import { useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/formatters';

export function NotificationsPage() {
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const loadNotifications = async () => {
    try {
      const data = await api.notifications.list();
      setNotifications(data);
    } catch (err: any) {
      toast('Failed to load notifications', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      toast('Updated', 'Notification marked as read.', 'info');
    } catch (err: any) {
      toast('Error', err.message, 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast('All Read', 'All notifications marked as read.', 'success');
    } catch (err: any) {
      toast('Error', err.message, 'error');
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'warning') return n.severity === 'warning';
    if (filter === 'error') return n.severity === 'error';
    return true;
  });

  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications & Alerts</h1>
          <p className="text-xs text-slate-500 mt-1">
            System events, agent run completions, anomaly warnings, and data source updates.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleMarkAllRead} icon={<CheckCheck className="w-4 h-4" />}>
          Mark All as Read
        </Button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'unread', label: 'Unread Only' },
          { id: 'warning', label: 'Warnings' },
          { id: 'error', label: 'Errors' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
            No notifications matching the selected filter.
          </div>
        ) : (
          filtered.map((n) => (
            <Card
              key={n.id}
              className={`p-4 flex items-start gap-4 transition-all ${
                n.is_read ? 'bg-white opacity-80' : 'bg-blue-50/20 border-blue-200 shadow-xs'
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                {getSeverityIcon(n.severity)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-slate-900">{n.title}</h3>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {formatDate(n.created_at)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="p-1 text-blue-600 hover:text-blue-800 text-xs font-semibold whitespace-nowrap"
                  title="Mark as read"
                >
                  Mark read
                </button>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

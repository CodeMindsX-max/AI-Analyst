import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Building2,
  ChevronDown,
  User as UserIcon,
  LogOut,
  HelpCircle,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';
import { useAuth, useWorkspace, useToast } from '@/app/providers';
import { api } from '@/api/http';
import type { Notification } from '@/api/types';
import { Badge } from '@/components/ui/Badge';
import { CommandPalette } from './CommandPalette';

export function Topbar() {
  const { user, logout } = useAuth();
  const { workspaceName, selectedPeriod, setSelectedPeriod } = useWorkspace();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Keyboard shortcut for Command Palette (Ctrl+K or Cmd+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch notifications
  useEffect(() => {
    api.notifications
      .list()
      .then((data) => setNotifications(data))
      .catch(() => {});
  }, [location.pathname]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast('Notifications updated', 'All notifications marked as read', 'info');
    } catch {}
  };

  // Human-readable breadcrumbs
  const getBreadcrumbTitle = () => {
    const p = location.pathname;
    if (p.startsWith('/overview')) return 'Executive Overview';
    if (p.startsWith('/analyst')) return 'AI Business Data Analyst';
    if (p.startsWith('/saved-analyses')) return 'Saved Analyses';
    if (p.startsWith('/data-sources')) return 'Data Sources & Connectors';
    if (p.startsWith('/data-explorer')) return 'Data Explorer & Profiling';
    if (p.startsWith('/sql-workspace')) return 'SQL Workspace';
    if (p.startsWith('/knowledge-base')) return 'Knowledge Base & RAG';
    if (p.startsWith('/glossary')) return 'Business Glossary';
    if (p.startsWith('/dashboards')) return 'BI Dashboards';
    if (p.startsWith('/reports')) return 'Executive Reports';
    if (p.startsWith('/schedules')) return 'Scheduled Jobs';
    if (p.startsWith('/agent-runs')) return 'Agent Runs & Audit';
    if (p.startsWith('/notifications')) return 'Notifications';
    if (p.startsWith('/team')) return 'Team & Access Management';
    if (p.startsWith('/audit-logs')) return 'Security Audit Logs';
    if (p.startsWith('/settings')) return 'Workspace Settings';
    return 'AnalystAI';
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
        {/* Left: Workspace selector and breadcrumb */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="truncate max-w-[150px]">{workspaceName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="h-4 w-px bg-slate-200" />

          <nav className="flex items-center gap-2 text-xs font-medium">
            <span className="text-slate-400">Workspace</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-semibold">{getBreadcrumbTitle()}</span>
          </nav>
        </div>

        {/* Center / Search bar trigger */}
        <div className="flex-1 max-w-md mx-6">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300 text-slate-400 text-xs transition-colors"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Search analysis, tables, reports, glossary...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-500 shadow-2xs">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Global actions & profile */}
        <div className="flex items-center gap-3">
          {/* Period selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="Q3 2026">Q3 2026 (Aug-Sep)</option>
            <option value="Q2 2026">Q2 2026</option>
            <option value="Year 2026">Full Year 2026</option>
          </select>

          {/* Notifications button with popover */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
              )}
            </button>

            {/* Notification Popover */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in duration-100">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
                    {unreadCount > 0 && <Badge variant="info">{unreadCount} new</Badge>}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto py-2 space-y-2">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No recent notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-lg border text-xs transition-colors ${
                          n.is_read ? 'bg-white border-slate-100' : 'bg-blue-50/50 border-blue-100 font-medium'
                        }`}
                      >
                        <div className="font-semibold text-slate-900">{n.title}</div>
                        <div className="text-slate-600 text-[11px] mt-0.5">{n.message}</div>
                        {n.link_url && (
                          <Link
                            to={n.link_url}
                            onClick={() => setNotificationsOpen(false)}
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mt-1.5"
                          >
                            Inspect <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 text-center">
                  <Link
                    to="/notifications"
                    onClick={() => setNotificationsOpen(false)}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                  >
                    View all notifications &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-slate-200" />

          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                {user?.full_name ? user.full_name[0] : 'A'}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-semibold text-slate-800 leading-tight">
                  {user?.full_name || 'Demo Lead'}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">{user?.role || 'Admin'}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in duration-100">
                <div className="px-3 py-2 border-b border-slate-100 text-xs">
                  <p className="font-semibold text-slate-900">{user?.full_name}</p>
                  <p className="text-slate-400 text-[11px] truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    Seeded Demo User
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    to="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <span>Workspace Settings</span>
                  </Link>
                  <Link
                    to="/onboarding"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>Run Onboarding Wizard</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </>
  );
}

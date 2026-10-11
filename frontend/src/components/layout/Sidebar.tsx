import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  BookmarkCheck,
  Database,
  Search,
  Code2,
  BookOpen,
  BookA,
  BarChart3,
  FileText,
  Clock,
  Activity,
  Bell,
  Users,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/app/providers';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user } = useAuth();

  const navGroups = [
    {
      label: 'Workspace',
      items: [
        { to: '/overview', label: 'Overview', icon: LayoutDashboard },
        { to: '/analyst', label: 'AI Analyst', icon: Sparkles, badge: 'Core' },
        { to: '/saved-analyses', label: 'Saved Analyses', icon: BookmarkCheck },
      ],
    },
    {
      label: 'Data',
      items: [
        { to: '/data-sources', label: 'Data Sources', icon: Database },
        { to: '/data-explorer', label: 'Data Explorer', icon: Search },
        { to: '/sql-workspace', label: 'SQL Workspace', icon: Code2 },
        { to: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
        { to: '/glossary', label: 'Business Glossary', icon: BookA },
      ],
    },
    {
      label: 'Business Intelligence',
      items: [
        { to: '/dashboards', label: 'Dashboards', icon: BarChart3 },
        { to: '/reports', label: 'Reports', icon: FileText },
        { to: '/schedules', label: 'Scheduled Jobs', icon: Clock },
      ],
    },
    {
      label: 'Operations',
      items: [
        { to: '/agent-runs', label: 'Agent Runs', icon: Activity },
        { to: '/notifications', label: 'Notifications', icon: Bell },
      ],
    },
    {
      label: 'Administration',
      items: [
        { to: '/team', label: 'Team & Access', icon: Users },
        { to: '/audit-logs', label: 'Audit Logs', icon: ShieldCheck },
        { to: '/settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-all duration-300 z-30 select-none shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md font-bold">
              AI
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-base">AnalystAI</span>
              <span className="block text-[10px] text-blue-400 font-medium tracking-wide">ENTERPRISE BI</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md font-bold text-sm">
            AI
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <h4 className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {group.label}
              </h4>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group',
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80',
                      collapsed && 'justify-center px-0'
                    )
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / Demo Mode Badge */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
              <FlaskConical className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium truncate">Demo Mode Active (SQLite)</span>
            </div>
            <div className="flex items-center gap-2 px-2 pt-1 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400 truncate">{user?.email || 'demo@analystai.local'}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Demo Mode Active">
            <FlaskConical className="w-4 h-4 text-amber-400" />
          </div>
        )}
      </div>
    </aside>
  );
}

import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layout Shell
import { AppShell } from '@/components/layout/AppShell';

// Auth Pages
import { LoginPage } from '@/features/auth/LoginPage';
import { SignupPage } from '@/features/auth/SignupPage';
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage';
import { VerifyEmailPage } from '@/features/auth/VerifyEmailPage';
import { TwoFactorPage } from '@/features/auth/TwoFactorPage';

// Onboarding
import { OnboardingWizard } from '@/features/onboarding/OnboardingWizard';

// Main App Features
import { OverviewPage } from '@/features/overview/OverviewPage';
import { AnalystPage } from '@/features/analyst/AnalystPage';
import { SavedAnalysesPage } from '@/features/saved-analyses/SavedAnalysesPage';
import { DataSourcesPage } from '@/features/data-sources/DataSourcesPage';
import { NewDataSourcePage } from '@/features/data-sources/NewDataSourcePage';
import { DataSourceDetailPage } from '@/features/data-sources/DataSourceDetailPage';
import { DataExplorerPage } from '@/features/data-explorer/DataExplorerPage';
import { SqlWorkspacePage } from '@/features/sql-workspace/SqlWorkspacePage';
import { KnowledgeBasePage } from '@/features/knowledge-base/KnowledgeBasePage';
import { KnowledgeDetailPage } from '@/features/knowledge-base/KnowledgeDetailPage';
import { GlossaryPage } from '@/features/glossary/GlossaryPage';
import { DashboardsPage } from '@/features/dashboards/DashboardsPage';
import { DashboardViewerPage } from '@/features/dashboards/DashboardViewerPage';
import { DashboardBuilderPage } from '@/features/dashboards/DashboardBuilderPage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { ReportBuilderPage } from '@/features/reports/ReportBuilderPage';
import { ReportPreviewPage } from '@/features/reports/ReportPreviewPage';
import { SchedulesPage } from '@/features/schedules/SchedulesPage';
import { AgentRunsPage } from '@/features/agent-runs/AgentRunsPage';
import { AgentRunDetailPage } from '@/features/agent-runs/AgentRunDetailPage';
import { NotificationsPage } from '@/features/notifications/NotificationsPage';
import { TeamPage } from '@/features/team/TeamPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { AuditLogsPage } from '@/features/audit-logs/AuditLogsPage';

export const router = createBrowserRouter([
  // Public Auth Routes
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/verify-email', element: <VerifyEmailPage /> },
  { path: '/two-factor', element: <TwoFactorPage /> },

  // Onboarding
  { path: '/onboarding', element: <OnboardingWizard /> },

  // Protected App Shell Routes
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/overview" replace /> },
      { path: 'overview', element: <OverviewPage /> },
      { path: 'analyst', element: <AnalystPage /> },
      { path: 'saved-analyses', element: <SavedAnalysesPage /> },
      { path: 'data-sources', element: <DataSourcesPage /> },
      { path: 'data-sources/new', element: <NewDataSourcePage /> },
      { path: 'data-sources/:id', element: <DataSourceDetailPage /> },
      { path: 'data-explorer', element: <DataExplorerPage /> },
      { path: 'sql-workspace', element: <SqlWorkspacePage /> },
      { path: 'knowledge-base', element: <KnowledgeBasePage /> },
      { path: 'knowledge-base/:id', element: <KnowledgeDetailPage /> },
      { path: 'glossary', element: <GlossaryPage /> },
      { path: 'dashboards', element: <DashboardsPage /> },
      { path: 'dashboards/new', element: <DashboardBuilderPage /> },
      { path: 'dashboards/:id', element: <DashboardViewerPage /> },
      { path: 'dashboards/:id/edit', element: <DashboardBuilderPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'reports/new', element: <ReportBuilderPage /> },
      { path: 'reports/:id', element: <ReportPreviewPage /> },
      { path: 'schedules', element: <SchedulesPage /> },
      { path: 'agent-runs', element: <AgentRunsPage /> },
      { path: 'agent-runs/:id', element: <AgentRunDetailPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'team', element: <TeamPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'audit-logs', element: <AuditLogsPage /> },
      { path: '*', element: <Navigate to="/overview" replace /> },
    ],
  },
]);

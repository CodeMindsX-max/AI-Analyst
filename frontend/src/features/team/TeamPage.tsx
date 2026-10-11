import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { api } from '@/api/http';
import type { TeamMember } from '@/api/types';
import { useToast } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { formatDate } from '@/lib/formatters';

export function TeamPage() {
  const { toast } = useToast();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite modal
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Analyst');
  const [inviting, setInviting] = useState(false);

  const loadMembers = async () => {
    try {
      const data = await api.team.list();
      setMembers(data);
    } catch (err: any) {
      toast('Failed to load team', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) {
      toast('Validation Error', 'Email and name are required.', 'error');
      return;
    }
    setInviting(true);
    try {
      await api.team.invite(email, name, role);
      toast('Invitation Sent', `Invited ${email} as ${role}.`, 'success');
      setInviteOpen(false);
      setEmail('');
      setName('');
      loadMembers();
    } catch (err: any) {
      toast('Invite Failed', err.message, 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      await api.team.updateRole(id, newRole);
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, role: newRole } : m))
      );
      toast('Role Updated', `Updated role to ${newRole}.`, 'info');
    } catch (err: any) {
      toast('Update Failed', err.message, 'error');
    }
  };

  const handleRemove = async (id: string, memberName: string) => {
    if (!confirm(`Remove "${memberName}" from the workspace team?`)) return;
    try {
      await api.team.remove(id);
      toast('Member Removed', `${memberName} removed.`, 'info');
      loadMembers();
    } catch (err: any) {
      toast('Remove Failed', err.message, 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Team & Access Control</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage workspace collaborators, analyst permissions, and enterprise access roles.
          </p>
        </div>

        <Button onClick={() => setInviteOpen(true)} icon={<UserPlus className="w-4 h-4" />}>
          Invite Member
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Member Name & Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{m.name}</div>
                    <span className="text-slate-500 text-[11px] block">{m.email}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.id, e.target.value)}
                      className="px-2 py-1 rounded border border-slate-300 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Analyst">Analyst</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={m.status === 'active' ? 'success' : 'outline'}>
                      {m.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {formatDate(m.created_at)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleRemove(m.id, m.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invite Member Modal */}
      {inviteOpen && (
        <Dialog
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          title="Invite Collaborator to Workspace"
          footer={
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInvite} loading={inviting}>
                Send Invitation
              </Button>
            </div>
          }
        >
          <form onSubmit={handleInvite} className="space-y-4 py-2 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Lee"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan.lee@company.com"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Permission Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="Admin">Admin (Full access, source management, workspace settings)</option>
                <option value="Analyst">Analyst (Query executor, saved analyses, report creator)</option>
                <option value="Viewer">Viewer (Read-only dashboards and report viewer)</option>
              </select>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}

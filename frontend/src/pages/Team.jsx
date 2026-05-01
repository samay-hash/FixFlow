import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { Copy, Send, Users, Clock, BadgeCheck } from 'lucide-react';

const categories = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'science', label: 'Science' },
  { value: 'security', label: 'Security' },
  { value: 'devops', label: 'DevOps' },
  { value: 'operations', label: 'Operations' },
  { value: 'research', label: 'Research' },
  { value: 'other', label: 'Other' },
];

export default function Team() {
  const { company, user } = useSelector((state) => state.auth);
  const [team, setTeam] = useState([]);
  const [invites, setInvites] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteUrl, setInviteUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ email: '', name: '', role: 'engineer', category: company?.category || 'engineering', preferences: '' });

  const companyPreferences = useMemo(() => company?.preferences || [], [company]);

  const load = async () => {
    try {
      const teamRes = await api.get('/auth/team');
      setTeam(teamRes.data.team || []);
      setInvites(teamRes.data.invites || []);

      // Only admins can access unassigned endpoint
      if (user?.role === 'admin') {
        try {
          const unassignedRes = await api.get('/auth/unassigned');
          setUnassigned(unassignedRes.data.unassigned || []);
        } catch {
          setUnassigned([]);
        }
      } else {
        setUnassigned([]);
      }
    } catch {
      toast.error('Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user?.role]);

  const submitInvite = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const payload = {
        ...form,
        preferences: form.preferences.split(',').map(item => item.trim()).filter(Boolean),
      };
      const { data } = await api.post('/auth/invite', payload);
      setInviteUrl(data.inviteUrl);
      toast.success('Invite created');
      setForm(prev => ({ ...prev, email: '', name: '', preferences: '' }));
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create invite');
    } finally {
      setSending(false);
    }
  };

  const copyInvite = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    toast.success('Invite link copied');
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="page-header flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase px-2 py-0.5" style={{ background: '#0050FF', border: '2px solid #0A0A0A', color: 'white' }}>
                // ORGANIZATION
              </span>
            </div>
            <h1 className="page-title">Team & Invites</h1>
            <p className="page-subtitle">Invite engineers into {company?.name || 'your workspace'} and track membership</p>
          </div>
          <div className="p-4" style={{ background: '#EAE4D9', border: '3px solid #0A0A0A', boxShadow: '4px 4px 0 #0A0A0A' }}>
            <p className="text-xs font-bold uppercase" style={{ color: '#666' }}>Workspace Category</p>
            <p className="text-lg font-black capitalize" style={{ color: '#0A0A0A' }}>{company?.category || 'engineering'}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {companyPreferences.length > 0 ? companyPreferences.map(item => (
                <span key={item} className="text-xs px-2 py-0.5" style={{ background: '#C8FF00', border: '1px solid #0A0A0A' }}>{item}</span>
              )) : <span className="text-xs text-slate-500">No preferences set</span>}
            </div>
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Send size={16} />Create Invite</h3>
              <form onSubmit={submitInvite} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Email</label>
                    <input className="input" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="engineer@company.com" />
                  </div>
                  <div>
                    <label className="label">Name</label>
                    <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jordan Lee" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Role</label>
                    <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                      <option value="engineer">Engineer</option>
                      <option value="viewer">Viewer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Category</label>
                    <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      {categories.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Preferences / Focus Areas</label>
                  <textarea className="input min-h-24" value={form.preferences} onChange={e => setForm({ ...form, preferences: e.target.value })} placeholder="uptime monitoring, backend reliability, scientific workflows" />
                </div>
                <button type="submit" disabled={sending} className="btn-primary">
                  {sending ? 'Sending...' : 'Create Invite'}
                </button>
              </form>

              {inviteUrl && (
                <div className="mt-4 p-3" style={{ background: '#0A0A0A', color: 'white', border: '2px solid #C8FF00' }}>
                  <p className="text-xs uppercase font-bold mb-2">Latest invite link</p>
                  <div className="flex items-center gap-2">
                    <input className="input flex-1" readOnly value={inviteUrl} />
                    <button onClick={copyInvite} className="btn-ghost btn-sm"><Copy size={14} />Copy</button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="card">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Users size={16} />Current Members</h3>
                <div className="space-y-3">
                  {loading ? (
                    <p className="text-sm text-slate-400">Loading members...</p>
                  ) : team.length === 0 ? (
                    <p className="text-sm text-slate-400">No members yet.</p>
                  ) : team.map(member => (
                    <div key={member._id} className="flex items-center justify-between p-3 rounded border border-slate-700 bg-dark-800">
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{member.name}</p>
                        <p className="text-xs text-slate-400">{member.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase font-bold text-slate-300">{member.role}</p>
                        <p className="text-xs text-slate-500">{member.preferences?.join(', ') || 'No preferences'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><BadgeCheck size={16} />Unassigned Engineers</h3>
                <div className="space-y-3">
                  {loading ? (
                    <p className="text-sm text-slate-400">Loading unassigned users...</p>
                  ) : unassigned.length === 0 ? (
                    <p className="text-sm text-slate-400">No unassigned users.</p>
                  ) : unassigned.map(u => (
                    <div key={u._id} className="p-3 rounded border border-slate-700 bg-dark-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-100">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                        <div className="text-xs text-slate-400">{u.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><BadgeCheck size={16} />Pending Invites</h3>
                <div className="space-y-3">
                  {invites.length === 0 ? (
                    <p className="text-sm text-slate-400">No pending invites.</p>
                  ) : invites.map(invite => (
                    <div key={invite._id} className="p-3 rounded border border-slate-700 bg-dark-800">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-100">{invite.email}</p>
                          <p className="text-xs text-slate-400">{invite.role} · {invite.category}</p>
                        </div>
                        <div className="text-right text-xs text-slate-500 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(invite.expiresAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {user?.role !== 'admin' && (
          <div className="card">
            <p className="text-sm text-slate-300">You are part of {company?.name || 'this organization'}. Invite management is available to admins only.</p>
          </div>
        )}
      </main>
    </div>
  );
}
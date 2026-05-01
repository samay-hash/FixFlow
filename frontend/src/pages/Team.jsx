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
              <span className="text-xs font-bold uppercase px-2 py-0.5" style={{ background: 'var(--blue)', border: '2px solid var(--black)', color: 'white' }}>
                // ORGANIZATION
              </span>
            </div>
            <h1 className="page-title">Team & Invites</h1>
            <p className="page-subtitle">Invite engineers into {company?.name || 'your workspace'} and track membership</p>
          </div>
          <div className="p-4" style={{ background: 'var(--cream-2)', border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--black)' }}>
            <p className="text-xs font-bold uppercase" style={{ color: '#666' }}>Workspace Category</p>
            <p className="text-lg font-black capitalize" style={{ color: 'var(--black)' }}>{company?.category || 'engineering'}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {companyPreferences.length > 0 ? companyPreferences.map(item => (
                <span key={item} className="text-xs px-2 py-0.5" style={{ background: 'var(--accent)', border: '1px solid var(--black)' }}>{item}</span>
              )) : <span className="text-xs text-slate-500">No preferences set</span>}
            </div>
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-black uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--black)' }}><Send size={16} />Create Invite</h3>
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
                <div className="mt-4 p-3" style={{ background: 'var(--black)', color: 'white', border: '2px solid var(--accent)' }}>
                  <p className="text-xs uppercase font-black mb-2 tracking-wide text-[var(--cream)]">Latest invite link</p>
                  <div className="flex items-center gap-2">
                    <input className="input flex-1 !text-black" readOnly value={inviteUrl} />
                    <button type="button" onClick={copyInvite} className="btn-sm btn" style={{ background: 'var(--lime)', color: 'var(--black)' }}><Copy size={14} />Copy</button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="card">
                <h3 className="font-black uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--black)' }}><Users size={16} />Current Members</h3>
                <div className="space-y-3">
                  {loading ? (
                    <p className="text-sm font-bold" style={{ color: '#666' }}>Loading members...</p>
                  ) : team.length === 0 ? (
                    <p className="text-sm font-bold" style={{ color: '#666' }}>No members yet.</p>
                  ) : team.map(member => (
                    <div key={member._id} className="flex items-center justify-between p-3" style={{ background: 'white', border: '2px solid var(--black)', boxShadow: '3px 3px 0 var(--black)' }}>
                      <div>
                        <p className="text-sm font-black" style={{ color: 'var(--black)' }}>{member.name}</p>
                        <p className="text-xs font-bold" style={{ color: '#666' }}>{member.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase font-black tracking-wider" style={{ color: 'var(--blue)' }}>{member.role}</p>
                        <p className="text-[10px] font-bold uppercase mt-0.5" style={{ color: '#888' }}>{member.preferences?.join(', ') || 'No preferences'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="font-black uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--black)' }}><BadgeCheck size={16} />Unassigned Engineers</h3>
                <div className="space-y-3">
                  {loading ? (
                    <p className="text-sm font-bold" style={{ color: '#666' }}>Loading unassigned users...</p>
                  ) : unassigned.length === 0 ? (
                    <p className="text-sm font-bold" style={{ color: '#666' }}>No unassigned users.</p>
                  ) : unassigned.map(u => (
                    <div key={u._id} className="flex items-center justify-between p-3" style={{ background: 'white', border: '2px solid var(--black)', boxShadow: '3px 3px 0 var(--black)' }}>
                      <div>
                        <p className="text-sm font-black" style={{ color: 'var(--black)' }}>{u.name}</p>
                        <p className="text-xs font-bold" style={{ color: '#666' }}>{u.email}</p>
                      </div>
                      <div className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--blue)' }}>{u.role}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="font-black uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--black)' }}><BadgeCheck size={16} />Pending Invites</h3>
                <div className="space-y-3">
                  {invites.length === 0 ? (
                    <p className="text-sm font-bold" style={{ color: '#666' }}>No pending invites.</p>
                  ) : invites.map(invite => (
                    <div key={invite._id} className="flex items-center justify-between gap-3 p-3" style={{ background: 'white', border: '2px solid var(--black)', boxShadow: '3px 3px 0 var(--black)' }}>
                      <div>
                        <p className="text-sm font-black" style={{ color: 'var(--black)' }}>{invite.email}</p>
                        <p className="text-xs font-bold uppercase tracking-wider mt-0.5" style={{ color: 'var(--blue)' }}>{invite.role} · {invite.category}</p>
                      </div>
                      <div className="text-right text-xs font-bold flex items-center gap-1" style={{ color: '#888' }}>
                        <Clock size={12} />
                        {new Date(invite.expiresAt).toLocaleDateString()}
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
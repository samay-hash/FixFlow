import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Building, CheckCircle2, Clock, Copy, Loader2, Send, Settings, Shield, UserCheck, Users, type LucideIcon } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { AppPageHeader } from '../components/dashboard/AppPageHeader';
import { DashboardPanel } from '../components/dashboard/DashboardPanel';
import { useAppSelector } from '../store/hooks';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const TeamPage = () => {
  const { company, user } = useAppSelector((state) => state.auth);
  const [team, setTeam] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [unassigned, setUnassigned] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteUrl, setInviteUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    email: '',
    name: '',
    role: 'engineer',
    category: company?.category || 'engineering',
    preferences: '',
  });

  const isAdmin = user?.role === 'admin';

  const loadData = async () => {
    try {
      const teamRes = await apiClient.get('/auth/team');
      setTeam(teamRes.data.team || []);
      setInvites(teamRes.data.invites || []);

      if (isAdmin) {
        try {
          const unassignedRes = await apiClient.get('/auth/unassigned');
          setUnassigned(unassignedRes.data.unassigned || []);
        } catch {
          setUnassigned([]);
        }
      }
    } catch {
      toast.error('Failed to load organizational hierarchy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [isAdmin]);

  const handleInvite = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    try {
      const payload = {
        ...form,
        preferences: form.preferences.split(',').map((item) => item.trim()).filter(Boolean),
      };
      const { data } = await apiClient.post('/auth/invite', payload);
      setInviteUrl(data.inviteUrl);
      toast.success('Invitation link generated');
      setForm((prev) => ({ ...prev, email: '', name: '', preferences: '' }));
      void loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate invitation');
    } finally {
      setSending(false);
    }
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <AppPageHeader
        eyebrow="Organization"
        title="Team command"
        description={`Manage responders and invite specialized engineers to ${company?.name || 'your workspace'}.`}
        icon={Users}
        action={
          <div className="inline-flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-left shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <Building className="h-5 w-5 text-orange-700" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Workspace</p>
              <p className="text-[13px] font-black text-[#07111f]">{company?.name}</p>
            </div>
          </div>
        }
      />

      {isAdmin ? (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
          <DashboardPanel title="Generate invite" description="Create a secure command link without changing the invite payload.">
            <form onSubmit={handleInvite} className="space-y-4 p-5">
              <Field label="Work Email">
                <input
                  required
                  type="email"
                  className="dashboard-input"
                  placeholder="engineer@company.ai"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
              </Field>
              <Field label="Full Name">
                <input
                  required
                  className="dashboard-input"
                  placeholder="Jordan Lee"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Role">
                  <select className="dashboard-input appearance-none" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                    <option value="engineer">Engineer</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </Field>
                <Field label="Specialty">
                  <select className="dashboard-input appearance-none" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                    <option value="engineering">Engineering</option>
                    <option value="science">Science</option>
                    <option value="security">Security</option>
                    <option value="devops">DevOps</option>
                    <option value="operations">Operations</option>
                    <option value="research">Research</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
              </div>
              <Field label="Focus Areas (Tags)">
                <textarea
                  className="dashboard-input min-h-[96px] resize-none py-4 leading-6"
                  placeholder="latency, sql-optimization, k8s"
                  value={form.preferences}
                  onChange={(event) => setForm({ ...form, preferences: event.target.value })}
                />
              </Field>
              <button type="submit" disabled={sending} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#ff4f0a]/85 px-5 text-[13px] font-black text-white shadow-[0_10px_20px_rgba(194,65,12,0.12)] disabled:opacity-60">
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Generate Secure Link
              </button>
            </form>

            {inviteUrl && (
              <div className="border-t border-slate-100 p-5">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Invite Access Link</p>
                <div className="flex gap-2 rounded-2xl border border-slate-800 bg-[#07111f] p-2">
                  <input readOnly value={inviteUrl} className="min-w-0 flex-1 bg-transparent px-2 font-mono text-[11px] font-bold text-emerald-300 outline-none" />
                  <button onClick={copyInvite} className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#07111f]" aria-label="Copy invite link">
                    {copied ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            )}
          </DashboardPanel>

          <div className="space-y-5">
            <DashboardPanel title="Active responders" description="Current team members attached to this workspace.">
              <div className="grid grid-cols-1 gap-3 p-5 lg:grid-cols-2">
                {loading ? (
                  <LoadingLine label="Synchronizing team..." />
                ) : team.length === 0 ? (
                  <EmptyLine label="No active responders found." />
                ) : team.map((member) => (
                  <article key={member.id} className="group flex min-h-[86px] items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-orange-100 hover:bg-orange-50/20">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-[14px] font-black text-slate-500 transition group-hover:bg-orange-100 group-hover:text-orange-800">
                        {member.name?.[0] || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-black text-[#07111f]">{member.name}</p>
                        <p className="mt-1 truncate text-[11px] font-bold text-slate-400">{member.email}</p>
                        <p className="mt-1.5 truncate text-[10px] font-black uppercase tracking-[0.1em] text-orange-600/80">
                          {member.category || 'engineering'}
                          {member.preferences?.length > 0 && (
                            <span className="ml-2 lowercase text-slate-400">· {member.preferences.join(', ')}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{member.role}</span>
                  </article>
                ))}
              </div>
            </DashboardPanel>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <DashboardPanel title="Pending invites" description="Generated invites that have not been accepted yet.">
                <CompactList
                  items={invites}
                  empty="No active invitations."
                  icon={UserCheck}
                  render={(invite) => (
                    <>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-black text-[#07111f]">{invite.email}</p>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{invite.role} / {invite.category}</p>
                      </div>
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400">
                        <Clock size={12} />
                        {new Date(invite.expiresAt).toLocaleDateString()}
                      </span>
                    </>
                  )}
                />
              </DashboardPanel>

              <DashboardPanel title="External pool" description="Unassigned users available for workspace review.">
                <CompactList
                  items={unassigned}
                  empty="No unassigned agents detected."
                  icon={Settings}
                  render={(candidate) => (
                    <>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-black text-[#07111f]">{candidate.name}</p>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{candidate.email || 'Candidate'}</p>
                      </div>
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-orange-700">Candidate</span>
                    </>
                  )}
                />
              </DashboardPanel>
            </div>
          </div>
        </div>
      ) : (
        <DashboardPanel>
          <div className="mx-auto max-w-2xl px-6 py-16 text-center">
            <Shield className="mx-auto mb-4 h-12 w-12 text-slate-200" />
            <h3 className="text-[21px] font-black tracking-[-0.04em] text-[#07111f]">Command restricted</h3>
            <p className="mt-2 text-[13px] font-semibold leading-6 text-slate-500">
              You are currently a member of <strong>{company?.name}</strong>. Invitation and team management privileges are reserved for administrators.
            </p>
          </div>
        </DashboardPanel>
      )}
    </Layout>
  );
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function LoadingLine({ label }: { label: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center text-[13px] font-black text-slate-400 lg:col-span-2">{label}</div>;
}

function EmptyLine({ label }: { label: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-5 text-center text-[13px] font-semibold text-slate-500 lg:col-span-2">{label}</div>;
}

function CompactList({ items, empty, icon: Icon, render }: { items: any[]; empty: string; icon: LucideIcon; render: (item: any) => ReactNode }) {
  return (
    <div className="space-y-3 p-5">
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-5 text-[13px] font-semibold text-slate-500">{empty}</p>
      ) : items.map((item) => (
        <article key={item.id} className="flex min-h-[72px] items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
            <Icon size={16} />
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
            {render(item)}
          </div>
        </article>
      ))}
    </div>
  );
}

export default TeamPage;

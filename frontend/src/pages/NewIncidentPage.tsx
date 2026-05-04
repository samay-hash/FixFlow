import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronDown, Globe, Loader2, Save, ShieldAlert } from 'lucide-react';
import { clsx } from 'clsx';
import Layout from '../components/layout/Layout';
import { AppPageHeader } from '../components/dashboard/AppPageHeader';
import { DashboardPanel } from '../components/dashboard/DashboardPanel';
import { useIncidents } from '../hooks/useIncidents';
import { useAppSelector } from '../store/hooks';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const categories = [
  { value: 'backend', label: 'Backend' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'database', label: 'Database' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'network', label: 'Network' },
  { value: 'security', label: 'Security' },
  { value: 'other', label: 'Other' },
];

const NewIncidentPage = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { createIncident } = useIncidents();

  const [sites, setSites] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 'high',
    siteId: '',
    assignedTo: [] as string[],
    category: 'other',
  });

  const canCreate = user?.role === 'admin' || user?.role === 'engineer';

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [sitesRes, teamRes] = await Promise.all([
          apiClient.get('/sites'),
          apiClient.get('/auth/team'),
        ]);
        setSites(sitesRes.data.sites || []);
        setTeam(teamRes.data.team || []);
      } catch {
        toast.error('Failed to load system metadata');
      } finally {
        setLoadingMeta(false);
      }
    };
    void loadMeta();
  }, []);

  const toggleAssignee = (userId: string) => {
    setForm((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter((id) => id !== userId)
        : [...prev.assignedTo, userId],
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const incident = await createIncident(form);
      navigate(`/incidents/${incident.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <AppPageHeader
        eyebrow="Manual response"
        title="Declare incident"
        description="Open a focused war room with the same fields, routing, and responder assignment flow as before."
        icon={ShieldAlert}
        action={
          <Link to="/incidents" className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-black text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5">
            <ArrowLeft size={17} />
            Incidents
          </Link>
        }
      />

      {!canCreate ? (
        <DashboardPanel>
          <div className="px-6 py-16 text-center">
            <ShieldAlert size={44} className="mx-auto mb-4 text-slate-200" />
            <p className="text-[17px] font-black text-[#07111f]">Manual declaration restricted</p>
            <p className="mx-auto mt-2 max-w-xl text-[13px] font-semibold leading-6 text-slate-500">
              Your current role can view incidents, but only admins and engineers can declare a new manual incident.
            </p>
          </div>
        </DashboardPanel>
      ) : loadingMeta ? (
        <DashboardPanel>
          <div className="px-6 py-16 text-center">
            <Loader2 className="mx-auto mb-4 h-9 w-9 animate-spin text-orange-700" />
            <p className="text-[14px] font-black text-slate-500">Preparing incident console...</p>
          </div>
        </DashboardPanel>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-5">
            <DashboardPanel title="Incident core" description="Describe what responders need to know first.">
              <div className="space-y-5 p-5">
                <Field label="Incident Title">
                  <input
                    required
                    className="dashboard-input text-base"
                    placeholder="e.g. API response latency exceeding 500ms"
                    value={form.title}
                    onChange={(event) => setForm({ ...form, title: event.target.value })}
                  />
                </Field>

                <Field label="Symptoms & Description">
                  <textarea
                    className="dashboard-input min-h-[160px] resize-none py-4 leading-6"
                    placeholder="Provide context for responders..."
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                  />
                </Field>
              </div>
            </DashboardPanel>

            <DashboardPanel title="Assign responders" description="Select the people who should be attached to the initial incident room.">
              <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2">
                {team.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-5 text-[13px] font-semibold text-slate-500 md:col-span-2">
                    No team members found for assignment.
                  </p>
                ) : team.map((member) => {
                  const isChecked = form.assignedTo.includes(member.id);

                  return (
                    <label
                      key={member.id}
                      className={clsx(
                        'flex min-h-[88px] cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 transition hover:-translate-y-0.5',
                        isChecked
                          ? 'border-orange-100 bg-orange-50 shadow-[0_10px_20px_rgba(194,65,12,0.06)]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className={clsx('flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-[13px] font-black', isChecked ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-500')}>
                          {member.name?.[0] || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-black text-[#07111f]">{member.name}</p>
                          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{member.role}</p>
                        </div>
                      </div>
                      <span className={clsx('flex h-6 w-6 shrink-0 items-center justify-center rounded-full border', isChecked ? 'border-orange-200 bg-orange-100 text-orange-800' : 'border-slate-200 bg-white text-transparent')}>
                        <CheckCircle2 size={15} />
                      </span>
                      <input type="checkbox" className="sr-only" checked={isChecked} onChange={() => toggleAssignee(member.id)} />
                    </label>
                  );
                })}
              </div>
            </DashboardPanel>
          </div>

          <aside className="space-y-5">
            <DashboardPanel title="Routing metadata" description="Severity, category, and affected monitor are unchanged.">
              <div className="space-y-5 p-5">
                <SelectField label="Severity Level" value={form.severity} onChange={(value) => setForm({ ...form, severity: value })}>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </SelectField>

                <SelectField label="Category" value={form.category} onChange={(value) => setForm({ ...form, category: value })}>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </SelectField>

                <SelectField label="Affected Site" value={form.siteId} onChange={(value) => setForm({ ...form, siteId: value })}>
                  <option value="">No linked site</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </SelectField>
              </div>
            </DashboardPanel>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#ff4f0a]/85 px-6 text-[14px] font-black text-white shadow-[0_10px_20px_rgba(194,65,12,0.12)] transition hover:bg-[#ff4f0a]/95 disabled:opacity-60"
            >
              {submitting ? <Loader2 size={19} className="animate-spin" /> : <Save size={19} />}
              Initialize War Room
            </button>

            <div className="rounded-[24px] border border-orange-100 bg-orange-50/70 p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-orange-700">
                <Globe size={18} />
              </div>
              <p className="text-[12px] font-bold leading-6 text-slate-600">
                Initializing a war room will trigger the AI Watchdog and notify all assigned responders.
              </p>
            </div>
          </aside>
        </form>
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

function SelectField({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <Field label={label}>
      <div className="relative">
        <select className="dashboard-input appearance-none pr-10 capitalize" value={value} onChange={(event) => onChange(event.target.value)}>
          {children}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>
    </Field>
  );
}

export default NewIncidentPage;

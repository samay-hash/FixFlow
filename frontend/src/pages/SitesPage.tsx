import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { format } from 'date-fns';
import { ChevronDown, Clock, Copy, ExternalLink, Globe, Link as LinkIcon, Plus, RefreshCw, Trash2, Wifi, WifiOff, X } from 'lucide-react';
import { clsx } from 'clsx';
import Layout from '../components/layout/Layout';
import { AppPageHeader } from '../components/dashboard/AppPageHeader';
import { DashboardPanel } from '../components/dashboard/DashboardPanel';
import StatusBadge from '../components/ui/StatusBadge';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addSite as addSiteAction, removeSite as removeSiteAction, setLoading, setSites } from '../store/slices/siteSlice';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const SitesPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { sites, loading } = useAppSelector((state) => state.sites);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', url: '', checkInterval: 5 });
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'engineer';

  const loadSites = async () => {
    dispatch(setLoading(true));
    try {
      const { data } = await apiClient.get('/sites');
      dispatch(setSites(data.sites));
    } catch (err) {
      toast.error('Failed to load monitored sites');
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    void loadSites();
  }, []);

  const handleAddSite = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await apiClient.post('/sites', formData);
      dispatch(addSiteAction(data.site));
      setShowForm(false);
      setFormData({ name: '', url: '', checkInterval: 5 });
      toast.success(`${data.site.name} is now being monitored`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add site');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSite = async (id: string, name: string) => {
    if (!window.confirm(`Stop monitoring ${name}? This will not delete past incidents.`)) return;
    try {
      await apiClient.delete(`/sites/${id}`);
      dispatch(removeSiteAction(id));
      toast.success('Site removed from monitoring');
    } catch (err) {
      toast.error('Failed to remove site');
    }
  };

  const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
  const webhookUrl = `${backendBase}/api/webhooks/github/${user?.companyId}`;

  return (
    <Layout>
      <AppPageHeader
        eyebrow="Monitoring"
        title="Monitored sites"
        description="Global health checks and performance monitoring for production services."
        icon={Globe}
        action={
          <>
            <button onClick={loadSites} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-black text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5">
              <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            {isAdmin && (
              <button onClick={() => setShowForm(!showForm)} className={clsx('inline-flex min-h-12 items-center gap-2 rounded-2xl px-5 py-3 text-[13px] font-black text-white shadow-[0_10px_20px_rgba(15,23,42,0.08)] transition', showForm ? 'bg-rose-600' : 'bg-[#ff4f0a]/85 hover:bg-[#ff4f0a]/95')}>
                {showForm ? <X size={17} /> : <Plus size={17} />}
                {showForm ? 'Cancel' : 'Add Site'}
              </button>
            )}
          </>
        }
      />

      {showForm && (
        <DashboardPanel title="Add production endpoint" description="Start a health check for a service, dashboard, API, or public status endpoint.">
          <form onSubmit={handleAddSite} className="grid gap-4 p-5 md:grid-cols-4">
            <Field label="Display Name">
              <input required className="dashboard-input" placeholder="Core API" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} />
            </Field>
            <Field label="Full URL" className="md:col-span-2">
              <input required type="url" className="dashboard-input" placeholder="https://api.example.com/health" value={formData.url} onChange={(event) => setFormData({ ...formData, url: event.target.value })} />
            </Field>
            <Field label="Check Every">
              <div className="relative">
                <select className="dashboard-input appearance-none" value={formData.checkInterval} onChange={(event) => setFormData({ ...formData, checkInterval: Number(event.target.value) })}>
                  <option value={1}>1 Minute</option>
                  <option value={5}>5 Minutes</option>
                  <option value={15}>15 Minutes</option>
                  <option value={60}>1 Hour</option>
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </Field>
            <div className="md:col-span-4 flex justify-end">
              <button disabled={submitting} type="submit" className="inline-flex min-h-12 items-center rounded-2xl bg-[#ff4f0a]/85 px-6 text-[13px] font-black text-white shadow-[0_10px_20px_rgba(194,65,12,0.12)] disabled:opacity-60">
                {submitting ? 'Adding...' : 'Start Monitoring'}
              </button>
            </div>
          </form>
        </DashboardPanel>
      )}

      {loading && sites.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}
        </div>
      ) : sites.length === 0 ? (
        <DashboardPanel>
          <div className="px-6 py-16 text-center">
            <Globe size={46} className="mx-auto mb-4 text-slate-200" />
            <p className="text-[16px] font-black text-[#07111f]">No active monitors</p>
            <p className="mt-2 text-[13px] font-semibold text-slate-500">Add your first site to begin automated health checks.</p>
            {isAdmin && <button onClick={() => setShowForm(true)} className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#ff4f0a]/85 px-5 text-[13px] font-black text-white"><Plus size={17} /> Add Your First Site</button>}
          </div>
        </DashboardPanel>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sites.map((site) => (
            <article key={site.id} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-slate-300">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className={clsx('flex h-11 w-11 items-center justify-center rounded-2xl', site.status === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')}>
                    {site.status === 'up' ? <Wifi size={20} /> : <WifiOff size={20} />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-black text-[#07111f]">{site.name}</h3>
                    <a href={site.url} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1 truncate text-[11px] font-bold text-orange-700 hover:underline">
                      <ExternalLink size={11} /> {site.url}
                    </a>
                  </div>
                </div>
                <StatusBadge status={site.status} type="site_status" />
              </div>

              <div className="my-4 grid grid-cols-3 gap-2">
                {[
                  { label: 'Uptime', value: `${site.uptimePercent || 100}%` },
                  { label: 'Latency', value: `${site.responseTime || 0}ms` },
                  { label: 'Freq.', value: `${site.checkInterval}m` },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-slate-200 bg-orange-50/20 p-3 text-center">
                    <p className="text-[13px] font-black text-[#07111f]">{metric.value}</p>
                    <p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">{metric.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                  <Clock size={12} />
                  Checked: {site.lastChecked ? format(new Date(site.lastChecked), 'HH:mm:ss') : 'Never'}
                </span>
                {isAdmin && <button onClick={() => handleDeleteSite(site.id, site.name)} className="rounded-xl p-2 text-rose-300 opacity-100 transition hover:bg-rose-50 hover:text-rose-600 xl:opacity-0 xl:group-hover:opacity-100" aria-label={`Stop monitoring ${site.name}`}><Trash2 size={16} /></button>}
              </div>
            </article>
          ))}
        </div>
      )}

      {isAdmin && (
        <section className="relative overflow-hidden rounded-[30px] bg-[#07111f] p-6 text-white shadow-[0_28px_80px_rgba(7,17,31,0.22)]">
          <LinkIcon size={140} className="pointer-events-none absolute -right-4 -top-5 rotate-12 text-white/5" />
          <div className="relative max-w-3xl">
            <h3 className="text-[24px] font-black tracking-[-0.04em]">GitHub webhook pipeline</h3>
            <p className="mt-2 text-[13px] font-semibold leading-6 text-slate-300">Automatically trigger incident response from repository failures and deployment hooks.</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <code className="flex-1 truncate rounded-2xl border border-white/10 bg-black/24 p-3 text-[11px] font-semibold text-emerald-300">{webhookUrl}</code>
              <button onClick={() => { navigator.clipboard.writeText(webhookUrl); toast.success('Webhook URL copied!'); }} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-[13px] font-black text-[#07111f]">
                <Copy size={16} /> Copy Endpoint
              </button>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</span>
      {children}
    </label>
  );
}

export default SitesPage;

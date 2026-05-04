import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, CheckCircle2, Filter, Loader2, Plus, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import Layout from '../components/layout/Layout';
import { AppPageHeader } from '../components/dashboard/AppPageHeader';
import { DashboardPanel } from '../components/dashboard/DashboardPanel';
import StatusBadge from '../components/ui/StatusBadge';
import { useIncidents } from '../hooks/useIncidents';
import { useAppSelector } from '../store/hooks';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const statusOptions = ['open', 'in_progress', 'resolved'];
const severityOptions = ['critical', 'high', 'medium', 'low'];

const IncidentsPage = () => {
  const { incidents, fetchIncidents, loading } = useIncidents();
  const { user } = useAppSelector((state) => state.auth);
  const [filters, setFilters] = useState({ status: '', severity: '' });
  const [chaosLoading, setChaosLoading] = useState(false);

  useEffect(() => {
    fetchIncidents(filters);
  }, [fetchIncidents, filters]);

  const handleStressTest = async () => {
    if (!window.confirm('This will trigger a simulated system-wide failure. Continue?')) return;
    setChaosLoading(true);
    try {
      await apiClient.post('/incidents/stress-test');
      toast.success('Chaos mode activated. System alerts incoming.');
      fetchIncidents(filters);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to trigger stress test');
    } finally {
      setChaosLoading(false);
    }
  };

  return (
    <Layout>
      <AppPageHeader
        eyebrow="Incident command"
        title="Incident queue"
        description="Track, filter, and resolve system outages and service disruptions from one operational view."
        icon={Zap}
        action={
          <>
            {user?.role === 'admin' && (
              <button onClick={handleStressTest} disabled={chaosLoading} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-[13px] font-black text-amber-700 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 disabled:opacity-60">
                {chaosLoading ? <Loader2 size={17} className="animate-spin" /> : <Zap size={17} />}
                Chaos Test
              </button>
            )}
            <Link to="/incidents/new" className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#ff4f0a]/85 px-5 py-3 text-[13px] font-black text-white shadow-[0_10px_20px_rgba(194,65,12,0.12)] transition hover:bg-[#ff4f0a]/95">
              <Plus size={17} />
              Report Incident
            </Link>
          </>
        }
      />

      <DashboardPanel>
        <div className="flex flex-wrap items-center gap-4 p-4">
          <div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
            <Filter size={15} />
            Filters
          </div>
          <FilterGroup label="Status" options={statusOptions} value={filters.status} allLabel="All Status" onChange={(status) => setFilters((prev) => ({ ...prev, status }))} />
          <FilterGroup label="Severity" options={severityOptions} value={filters.severity} allLabel="All Severity" onChange={(severity) => setFilters((prev) => ({ ...prev, severity }))} />
        </div>
      </DashboardPanel>

      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />)
        ) : incidents.length === 0 ? (
          <DashboardPanel>
            <div className="px-6 py-16 text-center">
              <CheckCircle2 size={46} className="mx-auto mb-4 text-emerald-500" />
              <p className="text-[16px] font-black text-[#07111f]">No incidents found</p>
              <p className="mt-2 text-[13px] font-semibold text-slate-500">System status is nominal. Great job.</p>
            </div>
          </DashboardPanel>
        ) : (
          incidents.map((incident) => (
            <Link key={incident.id} to={`/incidents/${incident.id}`} className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-slate-300">
              <div className="grid gap-4 p-5 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                <HealthScore score={incident.healthScore ?? 100} />
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <StatusBadge status={incident.severity} type="incident_severity" />
                    <StatusBadge status={incident.status} type="incident_status" />
                    {incident.source === 'auto' && <span className="rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-[10px] font-black uppercase text-violet-700">Auto</span>}
                  </div>
                  <h3 className="truncate text-[16px] font-black text-[#07111f] group-hover:text-orange-700">{incident.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-4 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
                    <span>ID: {incident.id.slice(-6)}</span>
                    <span>Started: {format(new Date(incident.createdAt), 'MMM dd, HH:mm')}</span>
                    {incident.resolvedAt && <span className="text-emerald-600">Resolved: {format(new Date(incident.resolvedAt), 'MMM dd, HH:mm')}</span>}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-5 lg:justify-end">
                  <ResponderStack responders={incident.assignedTo as any[]} />
                  <ChevronRight size={20} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-orange-700" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </Layout>
  );
};

function FilterGroup({ label, options, value, allLabel, onChange }: { label: string; options: string[]; value: string; allLabel: string; onChange: (value: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</span>
      {[{ label: allLabel, value: '' }, ...options.map((option) => ({ label: option.replace('_', ' '), value: option }))].map((option) => (
        <button key={option.label} onClick={() => onChange(option.value)} className={clsx('rounded-full border px-3 py-1.5 text-[11px] font-black capitalize transition', value === option.value ? 'border-transparent bg-[#07111f] text-white' : 'border-slate-200 bg-white text-slate-500 hover:bg-orange-50/60 hover:text-[#07111f]')}>
          {option.label}
        </button>
      ))}
    </div>
  );
}

function HealthScore({ score }: { score: number }) {
  const color = score >= 70 ? '#16a34a' : score >= 40 ? '#ca8a04' : '#e11d48';
  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
      <svg className="h-10 w-10 -rotate-90">
        <circle cx="20" cy="20" r="16" stroke="#f1f5f9" strokeWidth="3.5" fill="none" />
        <circle
          cx="20"
          cy="20"
          r="16"
          stroke={color}
          strokeWidth="3.5"
          fill="none"
          strokeDasharray={`${(score / 100) * 100.5} 100.5`}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute text-[11px] font-black text-[#07111f]">{score}</span>
    </div>
  );
}

function ResponderStack({ responders }: { responders: any[] }) {
  if (responders.length === 0) {
    return <span className="text-[12px] font-bold italic text-slate-400">Unassigned</span>;
  }

  return (
    <div className="flex -space-x-2">
      {responders.slice(0, 3).map((responder, index) => (
        <div key={index} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#07111f] text-[10px] font-black text-white">
          {responder.name?.[0]}
        </div>
      ))}
    </div>
  );
}

export default IncidentsPage;

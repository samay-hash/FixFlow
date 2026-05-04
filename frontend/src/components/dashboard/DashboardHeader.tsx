import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, Plus, ShieldAlert } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';

interface DashboardHeaderProps {
  companyName?: string;
  openIncidents: number;
  downSites: number;
  downSiteNames?: string[];
}

export function DashboardHeader({ companyName, openIncidents, downSites, downSiteNames = [] }: DashboardHeaderProps) {
  const { user } = useAppSelector((state) => state.auth);
  const [clock, setClock] = useState(() => new Date().toLocaleTimeString());
  const needsAttention = openIncidents > 0 || downSites > 0;

  // Live clock — ticks every second, just like FixFlow
  useEffect(() => {
    const id = setInterval(() => setClock(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(id);
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Critical banner — mirrors FixFlow's downSite alert */}
      {downSites > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3.5 shadow-[0_4px_14px_rgba(244,63,94,0.1)]">
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
          </span>
          <AlertTriangle size={16} className="flex-shrink-0 text-rose-600" />
          <p className="flex-1 text-[13px] font-black text-rose-700">
            🚨 {downSites} site{downSites > 1 ? 's are' : ' is'} currently DOWN
            {downSiteNames.length > 0 && (
              <span className="ml-1 font-semibold underline decoration-rose-400">{downSiteNames.join(', ')}</span>
            )}
          </p>
          <Link
            to="/incidents"
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-[12px] font-black text-rose-700 transition hover:bg-rose-50"
          >
            View Incidents <ArrowRight size={12} />
          </Link>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.045)] ring-1 ring-white">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-700">
                <ShieldAlert size={18} />
              </span>
              <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                {companyName || 'Production command'}
              </span>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-[11px] font-black text-slate-400">
                <Clock size={11} />
                {clock}
              </span>
            </div>
            <h1 className="text-[32px] font-black leading-tight tracking-[-0.05em] text-[#07111f]">
              {greeting}{firstName ? `, ${firstName}` : ''} 👋
            </h1>
            <p className="mt-1 max-w-2xl text-[14px] font-semibold leading-6 text-slate-500">
              Infrastructure overview — monitor health, open incidents, and response ownership.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <SignalPill
              label="State"
              value={needsAttention ? 'Action needed' : 'Healthy'}
              tone={needsAttention ? 'warning' : 'success'}
            />
            <Link
              to="/incidents/new"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#ff4f0a]/85 px-4 text-[13px] font-black text-white shadow-[0_10px_20px_rgba(194,65,12,0.12)] transition hover:bg-[#ff4f0a]/95 focus:outline-none focus:ring-4 focus:ring-orange-100"
            >
              <Plus size={16} />
              Report Incident
            </Link>
            <Link
              to="/incidents"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-black text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-orange-100"
            >
              Review queue
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

interface SignalPillProps {
  label: string;
  value: string;
  tone: 'success' | 'warning';
}

function SignalPill({ label, value, tone }: SignalPillProps) {
  const toneClass = tone === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700';

  return (
    <div className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4">
      <CheckCircle2 size={15} className={tone === 'success' ? 'text-emerald-600' : 'text-orange-700'} />
      <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">{label}</span>
      <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${toneClass}`}>{value}</span>
    </div>
  );
}

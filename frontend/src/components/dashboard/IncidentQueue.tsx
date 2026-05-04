import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Incident } from '../../types';
import StatusBadge from '../ui/StatusBadge';
import { DashboardPanel } from './DashboardPanel';

interface IncidentQueueProps {
  incidents: Incident[];
}

export function IncidentQueue({ incidents }: IncidentQueueProps) {
  return (
    <DashboardPanel
      title="Active incident queue"
      description="Newest open work first, with severity and response state kept visible."
      action={
        <Link to="/incidents" className="inline-flex items-center gap-2 text-[13px] font-black text-orange-700 transition hover:translate-x-0.5">
          View all <ArrowRight size={14} />
        </Link>
      }
      className="overflow-hidden"
    >
      {incidents.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={27} />
          </div>
          <p className="text-[15px] font-black text-[#07111f]">All systems operational.</p>
          <p className="mt-2 text-[13px] font-semibold text-slate-500">No active incidents are waiting for response.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {incidents.map((incident) => (
            <IncidentRow key={incident.id} incident={incident} />
          ))}
        </div>
      )}
    </DashboardPanel>
  );
}

function IncidentRow({ incident }: { incident: Incident }) {
  const severityClass = {
    critical: 'bg-rose-500',
    high: 'bg-orange-400',
    medium: 'bg-amber-400',
    low: 'bg-slate-300',
  }[incident.severity];

  return (
    <Link
      to={`/incidents/${incident.id}`}
      className="group grid gap-4 px-5 py-4 transition hover:bg-orange-50/20 sm:grid-cols-[1fr_auto] sm:items-center"
    >
      <div className="flex min-w-0 gap-4">
        <span className={`mt-1 h-12 w-1.5 flex-shrink-0 rounded-full ${severityClass}`} />
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
              <ShieldAlert size={14} />
            </span>
            <h3 className="truncate text-[15px] font-black text-[#07111f] group-hover:text-orange-700">{incident.title}</h3>
          </div>
          <p className="text-[12px] font-semibold text-slate-500">
            Opened {formatDistanceToNow(new Date(incident.createdAt))} ago
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        <StatusBadge status={incident.severity} type="incident_severity" />
        <StatusBadge status={incident.status} type="incident_status" />
      </div>
    </Link>
  );
}

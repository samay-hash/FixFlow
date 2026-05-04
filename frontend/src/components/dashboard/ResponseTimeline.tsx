import { Link } from 'react-router-dom';
import { ArrowRight, Bell, FileText, RadioTower, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Incident, TimelineEvent } from '../../types';
import { DashboardPanel } from './DashboardPanel';

interface ResponseTimelineProps {
  incidents: Incident[];
}

// Collect the most recent real timeline events across all incidents
interface FlatEvent {
  incidentId: string;
  incidentTitle: string;
  event: TimelineEvent;
}

function getRecentActivity(incidents: Incident[]): FlatEvent[] {
  const flat: FlatEvent[] = [];
  // Guard: incidents may be undefined/null before the async fetch resolves
  for (const incident of incidents ?? []) {
    for (const ev of incident.timeline ?? []) {
      flat.push({ incidentId: incident.id, incidentTitle: incident.title, event: ev });
    }
  }
  // Sort newest first
  flat.sort((a, b) => new Date(b.event.timestamp).getTime() - new Date(a.event.timestamp).getTime());
  return flat.slice(0, 5);
}

const typeStyle: Record<string, { icon: typeof RadioTower; tone: string; dot: string }> = {
  system:        { icon: RadioTower, tone: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-400' },
  observation:   { icon: Bell,       tone: 'bg-orange-50 text-orange-700',   dot: 'bg-orange-400' },
  remediation:   { icon: Sparkles,   tone: 'bg-violet-50 text-violet-600',   dot: 'bg-violet-400' },
  status_change: { icon: FileText,   tone: 'bg-blue-50 text-blue-600',       dot: 'bg-blue-400' },
};
const fallbackStyle = { icon: Bell, tone: 'bg-slate-50 text-slate-500', dot: 'bg-slate-400' };

// ── Static fallback cards shown when there are no real events yet ──────────
const staticSteps = [
  { title: 'Monitor checks', description: 'Services sampled every minute', icon: RadioTower, tone: 'bg-emerald-50 text-emerald-600' },
  { title: 'Alert routes',   description: 'Responder channels stay ready',  icon: Bell,       tone: 'bg-orange-50 text-orange-700' },
  { title: 'Context checks', description: 'Log patterns and context prepared', icon: Sparkles,   tone: 'bg-violet-50 text-violet-600' },
  { title: 'Postmortem',     description: 'Learnings captured after resolve', icon: FileText,  tone: 'bg-blue-50 text-blue-600' },
];

export function ResponseTimeline({ incidents }: ResponseTimelineProps) {
  const events = getRecentActivity(incidents);
  const hasEvents = events.length > 0;

  return (
    <DashboardPanel
      title="Recent activity"
      description={
        hasEvents
          ? 'Latest incident timeline updates across all open and in-progress work.'
          : 'The operating loop your team follows during incidents.'
      }
      action={
        hasEvents ? (
          <Link
            to="/incidents"
            className="inline-flex items-center gap-2 text-[13px] font-black text-orange-700 transition hover:translate-x-0.5"
          >
            All incidents <ArrowRight size={14} />
          </Link>
        ) : undefined
      }
    >
      {hasEvents ? (
        // ── Dynamic: real timeline events ────────────────────────────────
        <div className="divide-y divide-slate-100">
          {events.map((item, idx) => {
            const style = typeStyle[item.event.type] ?? fallbackStyle;
            const Icon = style.icon;
            return (
              <Link
                key={idx}
                to={`/incidents/${item.incidentId}`}
                className="group flex gap-4 px-5 py-4 transition hover:bg-orange-50/20"
              >
                <span className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${style.tone}`}>
                  <Icon size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-black text-[#07111f] group-hover:text-orange-700">
                    {item.incidentTitle}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[12px] font-semibold text-slate-500">
                    {item.event.message}
                  </p>
                </div>
                <span className="flex-shrink-0 text-[11px] font-black text-slate-400 tabular-nums">
                  {formatDistanceToNow(new Date(item.event.timestamp), { addSuffix: true })}
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        // ── Static fallback: operating loop cards ─────────────────────────
        <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
          {staticSteps.map(({ title, description, icon: Icon, tone }) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.045)]">
              <span className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
                <Icon size={18} />
              </span>
              <p className="text-[13px] font-black text-[#07111f]">{title}</p>
              <p className="mt-1 text-[12px] font-semibold leading-5 text-slate-500">{description}</p>
            </div>
          ))}
        </div>
      )}
    </DashboardPanel>
  );
}

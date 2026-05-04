import { Link } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';
import type { Website } from '../../types';
import StatusBadge from '../ui/StatusBadge';
import { DashboardPanel } from './DashboardPanel';

interface SiteHealthPanelProps {
  sites: Website[];
}

export function SiteHealthPanel({ sites }: SiteHealthPanelProps) {
  return (
    <DashboardPanel
      title="Site health"
      description="Current monitor state, latency and uptime."
      action={
        <Link to="/monitoring" className="inline-flex items-center gap-2 text-[13px] font-black text-orange-700 transition hover:translate-x-0.5">
          Manage <ArrowRight size={14} />
        </Link>
      }
      className="overflow-hidden"
    >
      {sites.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Activity size={27} />
          </div>
          <p className="text-[15px] font-black text-[#07111f]">No sites monitored yet.</p>
          <p className="mt-2 text-[13px] font-semibold text-slate-500">
            Add your first monitor to see service health here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {sites.map((site) => (
            <div
              key={site.id}
              className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 transition hover:bg-orange-50/20"
            >
              <div className="min-w-0">
                <p className="truncate text-[14px] font-black text-[#07111f]">{site.name}</p>
                <p className="mt-1 truncate text-[12px] font-semibold text-slate-500">{site.url}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <StatusBadge status={site.status} type="site_status" />
                <p className="mt-1 text-[11px] font-black text-slate-400 tabular-nums">
                  {site.responseTime ?? 0}ms
                </p>
                <p className="text-[11px] font-semibold text-slate-400 tabular-nums">
                  {(site.uptimePercent ?? 100).toFixed(2)}% up
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardPanel>
  );
}

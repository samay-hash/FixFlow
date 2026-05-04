import { Skull, Bomb, TriangleAlert, Info } from 'lucide-react';
import type { LogSummary } from '../../types';
import { DashboardPanel } from './DashboardPanel';

interface LogSummaryPanelProps {
  summary: LogSummary;
}

const rows = [
  { key: 'fatal', label: 'Fatal', icon: Skull, bar: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50' },
  { key: 'error', label: 'Errors', icon: Bomb, bar: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' },
  { key: 'warning', label: 'Warnings', icon: TriangleAlert, bar: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50' },
  { key: 'info', label: 'Info', icon: Info, bar: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' },
] as const;

export function LogSummaryPanel({ summary }: LogSummaryPanelProps) {
  const total = Math.max(1, Object.values(summary).reduce((sum, value) => sum + value, 0));

  return (
    <DashboardPanel title="24h log summary" description="Grouped application log volume from active agents.">
      <div className="space-y-4 p-5">
        {rows.map(({ key, label, icon: Icon, bar, text, bg }) => {
          const value = summary[key] ?? 0;
          const width = `${Math.max(3, Math.min(100, (value / total) * 100))}%`;

          return (
            <div key={key}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-xl border border-transparent ${bg} ${text.replace('text', 'text-opacity-70 text')}`}>
                    <Icon size={15} />
                  </span>
                  <span className="text-[13px] font-black text-[#07111f]">{label}</span>
                </div>
                <span className={`text-[13px] font-black ${text}`}>{value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${bar}`} style={{ width }} />
              </div>
            </div>
          );
        })}
      </div>
    </DashboardPanel>
  );
}

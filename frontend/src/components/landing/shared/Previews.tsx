import { AlertTriangle, Sparkles } from 'lucide-react';
import { SparkLine, SmallBars } from './UIAtoms';

interface AlertLogosProps {
  compact?: boolean;
}

export function AlertLogos({ compact = false }: AlertLogosProps) {
  const base = compact ? 'h-9 w-9 rounded-xl' : 'h-10 w-10 rounded-xl';
  return (
    <div className="flex items-center gap-2">
      <span className={`${base} flex items-center justify-center bg-white border border-slate-100 shadow-sm`}>
        <img src="/logos/slack.svg" alt="Slack" className="h-5 w-5 object-contain" />
      </span>
      <span className={`${base} flex items-center justify-center bg-white border border-slate-100 shadow-sm`}>
        <img src="/logos/gmail.svg" alt="Email" className="h-5 w-5 object-contain" />
      </span>
      <span className={`${base} flex items-center justify-center bg-white border border-slate-100 shadow-sm`}>
        <img src="/logos/pagerduty.svg" alt="PagerDuty" className="h-5 w-5 object-contain" />
      </span>
      {!compact && <span className={`${base} flex items-center justify-center border border-slate-200 bg-white text-[11px] font-bold text-slate-500`}>+2</span>}
    </div>
  );
}

interface TrendPreviewProps {
  color?: string;
}

export function TrendPreview({ color = '#22c55e' }: TrendPreviewProps) {
  return (
    <div className="ml-auto w-36 rounded-2xl bg-white p-3 shadow-sm">
      <SparkLine className="h-14 w-full" color={color} strokeWidth={3} />
    </div>
  );
}

export function IncidentPreview() {
  return (
    <div className="ml-auto flex w-44 items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
        <AlertTriangle size={24} />
      </span>
      <div className="flex-1 space-y-2">
        <span className="block h-2 w-24 rounded-full bg-slate-200" />
        <span className="block h-2 w-16 rounded-full bg-slate-200" />
      </div>
    </div>
  );
}

export function UptimePreview() {
  return (
    <div className="ml-auto flex w-40 items-end gap-3 rounded-2xl bg-white p-3 shadow-sm">
      <SmallBars />
      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-600">99.99%</span>
    </div>
  );
}

export function DeployPreview() {
  return (
    <div className="ml-auto w-52 rounded-2xl border border-slate-100 bg-white p-3 text-[10px] shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-full bg-blue-50 px-2 py-0.5 font-black text-blue-600">main</span>
        <span className="font-bold text-slate-500">a1b2c3d</span>
        <img src="/logos/github.svg" alt="GitHub" className="h-4 w-4 ml-auto" />
      </div>
      <p className="font-semibold text-slate-500">Deployed 10:16 AM - by joe</p>
    </div>
  );
}

export function SummaryPreview() {
  return (
    <div className="ml-auto flex w-44 items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      <div className="flex-1 space-y-2">
        <span className="block h-2 w-24 rounded-full bg-slate-200" />
        <span className="block h-2 w-20 rounded-full bg-slate-200" />
        <span className="block h-2 w-28 rounded-full bg-slate-100" />
      </div>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
        <Sparkles size={19} />
      </span>
    </div>
  );
}

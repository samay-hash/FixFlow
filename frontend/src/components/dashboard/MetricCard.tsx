import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  helper?: string;
  icon: LucideIcon;
  tone?: 'orange' | 'green' | 'blue' | 'rose' | 'slate';
}

const toneStyles = {
  orange: 'bg-orange-50 text-orange-700',
  green: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
  rose: 'bg-rose-50 text-rose-600',
  slate: 'bg-slate-50 text-slate-600',
};

export function MetricCard({ label, value, helper, icon: Icon, tone = 'slate' }: MetricCardProps) {
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.045)] ring-1 ring-white transition duration-200 hover:-translate-y-0.5 hover:border-slate-300">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-black text-slate-500">{label}</p>
          <p className="mt-4 text-[34px] font-black leading-none tracking-[-0.045em] text-[#07111f]">{value}</p>
          {helper && <p className="mt-4 text-[12px] font-bold text-slate-500">{helper}</p>}
        </div>
        <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${toneStyles[tone]}`}>
          <Icon size={21} strokeWidth={2.35} />
        </span>
      </div>
    </article>
  );
}

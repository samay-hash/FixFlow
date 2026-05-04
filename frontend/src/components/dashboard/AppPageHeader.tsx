import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface AppPageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  action?: ReactNode;
}

export function AppPageHeader({ eyebrow, title, description, icon: Icon, action }: AppPageHeaderProps) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.045)] ring-1 ring-white lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-700">
          <Icon size={21} strokeWidth={2.35} />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{eyebrow}</p>
          <h1 className="mt-1 text-[28px] font-black leading-tight tracking-[-0.04em] text-[#07111f]">{title}</h1>
          <p className="mt-1 max-w-2xl text-[14px] font-semibold leading-6 text-slate-500">{description}</p>
        </div>
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-3">{action}</div>}
    </section>
  );
}

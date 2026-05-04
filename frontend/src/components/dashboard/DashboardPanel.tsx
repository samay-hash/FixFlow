import type { ReactNode } from 'react';

interface DashboardPanelProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DashboardPanel({ title, description, action, children, className = '' }: DashboardPanelProps) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.045)] ring-1 ring-white ${className}`}>
      {(title || description || action) && (
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && <h2 className="text-[17px] font-black tracking-[-0.025em] text-[#07111f]">{title}</h2>}
            {description && <p className="mt-1 max-w-2xl text-[13px] font-semibold leading-5 text-slate-500">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

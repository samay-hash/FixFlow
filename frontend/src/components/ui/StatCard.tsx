import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
}

const colorMap = {
  primary: 'text-orange-700 bg-orange-50',
  success: 'text-emerald-600 bg-emerald-50',
  warning: 'text-amber-600 bg-amber-50',
  error: 'text-rose-600 bg-rose-50',
  neutral: 'text-slate-600 bg-slate-50',
};

const StatCard = ({ title, value, icon: Icon, trend, color = 'neutral' }: StatCardProps) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between">
        <div className={clsx('flex h-12 w-12 items-center justify-center rounded-2xl', colorMap[color])}>
          <Icon size={21} />
        </div>
        {trend && (
          <span className={clsx('rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em]', trend.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>
            {trend.isPositive ? '+' : ''}{trend.value}
          </span>
        )}
      </div>
      <p className="mt-5 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{title}</p>
      <h3 className="mt-1 text-[30px] font-black tracking-[-0.05em] text-[#07111f]">{value}</h3>
    </article>
  );
};

export default StatCard;

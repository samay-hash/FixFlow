import React from 'react';

export function SparkLine({ color = '#22c55e', className = '', strokeWidth = 2 }) {
  return (
    <svg viewBox="0 0 120 42" className={className} fill="none" aria-hidden="true">
      <path d="M2 31 C 14 34, 19 21, 29 25 S 45 31, 54 21 S 70 28, 78 17 S 96 17, 118 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SmallBars({ status = 'up' }) {
  const bars = [8, 14, 11, 19, 15, 23, 18, 26, 21, 30];
  const color = status === 'degraded' ? 'bg-orange-400' : 'bg-emerald-500';

  return (
    <div className="flex h-9 items-end gap-[3px]" aria-hidden="true">
      {bars.map((height, index) => (
        <span key={index} className={`w-1 rounded-full ${color}`} style={{ height }} />
      ))}
    </div>
  );
}

export function AvatarGroup({ size = 'sm' }) {
  const dims = size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-8 w-8 text-[11px]';
  return (
    <div className="flex items-center">
      {['MC', 'AP', 'LM'].map((label, index) => (
        <span
          key={label}
          className={`${dims} -ml-1 first:ml-0 flex items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-orange-100 to-slate-200 font-black text-slate-700 shadow-sm`}
          style={{ zIndex: 5 - index }}
        >
          {label.slice(0, 1)}
        </span>
      ))}
      <span className={`${dims} -ml-1 flex items-center justify-center rounded-full border-2 border-white bg-slate-50 font-bold text-slate-500 shadow-sm`}>+3</span>
    </div>
  );
}

export function StatusDot({ color = 'bg-emerald-500' }) {
  return <span className={`inline-flex h-2 w-2 rounded-full ${color}`} />;
}

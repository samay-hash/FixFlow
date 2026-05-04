import React from 'react';
import { clsx } from 'clsx';

interface StatusBadgeProps {
  status: string;
  type: 'incident_status' | 'incident_severity' | 'site_status';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  const getStyles = () => {
    const s = status.toLowerCase();
    
    // Incident Status
    if (type === 'incident_status') {
      if (s === 'open') return 'bg-rose-100 text-rose-700 border-rose-200';
      if (s === 'acknowledged') return 'bg-amber-100 text-amber-700 border-amber-200';
      if (s === 'in_progress') return 'bg-blue-100 text-blue-700 border-blue-200';
      if (s === 'resolved') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }

    // Incident Severity
    if (type === 'incident_severity') {
      if (s === 'critical') return 'bg-red-600 text-white border-red-700 shadow-sm';
      if (s === 'high') return 'bg-orange-100 text-orange-700 border-orange-200';
      if (s === 'medium') return 'bg-amber-100 text-amber-700 border-amber-200';
      if (s === 'low') return 'bg-slate-100 text-slate-600 border-slate-200';
    }

    // Site Status
    if (type === 'site_status') {
      if (s === 'up') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      if (s === 'down') return 'bg-rose-100 text-rose-700 border-rose-200';
      if (s === 'degraded') return 'bg-amber-100 text-amber-700 border-amber-200';
      if (s === 'maintenance') return 'bg-slate-100 text-slate-600 border-slate-200';
    }

    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <span className={clsx(
      'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all',
      getStyles()
    )}>
      {status.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;

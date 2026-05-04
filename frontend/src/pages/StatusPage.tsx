import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/client';
import { Shield, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import clsx from 'clsx';

interface Site {
  _id: string;
  name: string;
  status: 'up' | 'down' | 'degraded' | 'unknown';
  uptimePercent: number;
}

interface Incident {
  _id: string;
  title: string;
  severity: string;
  createdAt: string;
}

interface StatusData {
  company: {
    name: string;
  };
  sites: Site[];
  activeIncidents: Incident[];
}

const StatusIndicator: React.FC<{ status: Site['status'] }> = ({ status }) => {
  const map = { 
    up: { label: 'Operational', cls: 'text-emerald-400', dot: 'bg-emerald-500' }, 
    down: { label: 'Major Outage', cls: 'text-red-400', dot: 'bg-red-500' }, 
    degraded: { label: 'Degraded Performance', cls: 'text-yellow-400', dot: 'bg-yellow-500' }, 
    unknown: { label: 'Unknown', cls: 'text-slate-400', dot: 'bg-slate-500' } 
  };
  const cfg = map[status] || map.unknown;
  return (
    <div className="flex items-center gap-2">
      <span className={clsx('w-2.5 h-2.5 rounded-full', cfg.dot)} />
      <span className={clsx('text-sm font-medium', cfg.cls)}>{cfg.label}</span>
    </div>
  );
};

const StatusPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get(`/sites/public/${slug}`);
        setData(res.data);
        setLastUpdated(new Date());
      } catch { 
        setError('Company not found'); 
      } finally { 
        setLoading(false); 
      }
    };
    
    if (slug) {
      load();
    }
    
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [slug]);

  const allOperational = data?.sites?.every(s => s.status === 'up');
  const hasActiveIncidents = data?.activeIncidents && data.activeIncidents.length > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-300 selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <div className="border-b border-slate-800/60 bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-base leading-none mb-1">{data?.company?.name || (loading ? '...' : 'Status Page')}</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Service Status</p>
            </div>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800/40">
            <Clock size={12} /> Updated {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-32">
             <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{error}</h2>
            <p className="text-slate-500 text-sm">Please check the URL or contact support.</p>
          </div>
        ) : (
          <>
            {/* Overall Status Banner */}
            <div className={clsx(
              'rounded-3xl p-10 text-center mb-12 border transition-all duration-500', 
              allOperational && !hasActiveIncidents 
                ? 'bg-emerald-500/[0.03] border-emerald-500/20 shadow-lg shadow-emerald-500/5' 
                : 'bg-red-500/[0.03] border-red-500/20 shadow-lg shadow-red-500/5'
            )}>
              {allOperational && !hasActiveIncidents ? (
                <>
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                    <CheckCircle2 size={32} className="text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight mb-2">All Systems Operational</h2>
                  <p className="text-slate-500 text-sm font-medium">No incidents detected. Everything is running normally.</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                    <AlertTriangle size={32} className="text-red-400" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight mb-2">Service Disruption Detected</h2>
                  <p className="text-slate-500 text-sm font-medium">
                    {hasActiveIncidents 
                      ? `${data?.activeIncidents.length} active incident(s) currently being addressed` 
                      : 'Some services are experiencing performance issues'
                    }
                  </p>
                </>
              )}
            </div>

            {/* Active Incidents */}
            {hasActiveIncidents && (
              <div className="mb-12">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 pl-1">Active Incidents</h3>
                <div className="space-y-4">
                  {data?.activeIncidents.map(inc => (
                    <div key={inc._id} className="p-6 bg-red-500/[0.02] border border-red-500/20 rounded-2xl group hover:bg-red-500/[0.04] transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500 text-white shadow-sm">
                          {inc.severity}
                        </span>
                        <h4 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">{inc.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Started {new Date(inc.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service Status */}
            <div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 pl-1">Service Status</h3>
              <div className="grid gap-3">
                {data?.sites?.map(site => (
                  <div key={site._id} className="flex items-center justify-between p-5 bg-white/[0.02] border border-slate-800/40 rounded-2xl hover:bg-white/[0.04] hover:border-slate-700/60 transition-all duration-300">
                    <div>
                      <p className="text-sm font-bold text-white mb-1">{site.name}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500/60 rounded-full" 
                            style={{ width: `${site.uptimePercent}%` }} 
                          />
                        </div>
                        <span className="text-[10px] font-black text-slate-500">{site.uptimePercent}% uptime</span>
                      </div>
                    </div>
                    <StatusIndicator status={site.status} />
                  </div>
                ))}
                {data?.sites?.length === 0 && (
                  <div className="text-center py-12 bg-white/[0.01] border border-dashed border-slate-800/60 rounded-3xl">
                    <p className="text-slate-600 text-sm font-medium">No services configured for monitoring.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-20 pt-8 border-t border-slate-900 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                 <Shield size={14} className="text-indigo-500" />
                 <span className="text-xs font-black text-slate-500 tracking-tight">FixFlow <span className="text-indigo-500">Status</span></span>
              </div>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                Real-time incident monitoring & response
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StatusPage;

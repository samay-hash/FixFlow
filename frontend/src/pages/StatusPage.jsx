import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { Shield, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import clsx from 'clsx';

const StatusIndicator = ({ status }) => {
  const map = { up: { label: 'Operational', cls: 'text-emerald-400', dot: 'bg-emerald-500' }, down: { label: 'Major Outage', cls: 'text-red-400', dot: 'bg-red-500' }, degraded: { label: 'Degraded Performance', cls: 'text-yellow-400', dot: 'bg-yellow-500' }, unknown: { label: 'Unknown', cls: 'text-slate-400', dot: 'bg-slate-500' } };
  const cfg = map[status] || map.unknown;
  return (
    <div className="flex items-center gap-2">
      <span className={clsx('w-2.5 h-2.5 rounded-full', cfg.dot)} />
      <span className={clsx('text-sm font-medium', cfg.cls)}>{cfg.label}</span>
    </div>
  );
};

export default function StatusPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/sites/public/${slug}`);
        setData(res.data);
      } catch { setError('Company not found'); }
      finally { setLoading(false); }
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [slug]);

  const allOperational = data?.sites?.every(s => s.status === 'up');
  const hasActiveIncidents = data?.activeIncidents?.length > 0;

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
      {/* Header */}
      <div className="border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg">{data?.company?.name || (loading ? '...' : 'Status Page')}</h1>
            <p className="text-xs text-slate-500">System Status</p>
          </div>
          <div className="ml-auto text-xs text-slate-500 flex items-center gap-1">
            <Clock size={12} />Updated {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading status...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">{error}</div>
        ) : (
          <>
            {/* Overall Status Banner */}
            <div className={clsx('rounded-2xl p-8 text-center mb-10', allOperational && !hasActiveIncidents ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30')}>
              {allOperational && !hasActiveIncidents ? (
                <>
                  <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-emerald-400">All Systems Operational</h2>
                  <p className="text-slate-400 text-sm mt-1">No incidents detected. Everything is running normally.</p>
                </>
              ) : (
                <>
                  <AlertTriangle size={40} className="text-red-400 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-red-400">Service Disruption Detected</h2>
                  <p className="text-slate-400 text-sm mt-1">{hasActiveIncidents ? `${data.activeIncidents.length} active incident(s)` : 'Some services are experiencing issues'}</p>
                </>
              )}
            </div>

            {/* Active Incidents */}
            {hasActiveIncidents && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Active Incidents</h3>
                <div className="space-y-3">
                  {data.activeIncidents.map(inc => (
                    <div key={inc._id} className="p-4 bg-red-500/5 border border-red-500/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge badge-critical">{inc.severity}</span>
                        <h4 className="text-sm font-semibold text-white">{inc.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500">Started {new Date(inc.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service Status */}
            <div>
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Services</h3>
              <div className="space-y-2">
                {data.sites?.map(site => (
                  <div key={site._id} className="flex items-center justify-between p-4 bg-dark-700/60 border border-slate-700/40 rounded-xl hover:border-slate-600/60 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white">{site.name}</p>
                      <p className="text-xs text-slate-500">{site.uptimePercent}% uptime (30 days)</p>
                    </div>
                    <StatusIndicator status={site.status} />
                  </div>
                ))}
                {data.sites?.length === 0 && <p className="text-slate-500 text-sm text-center py-6">No services configured.</p>}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-12 text-xs text-slate-600">
              Powered by <span className="text-blue-500">SIMRS</span> — Smart Incident Monitoring & Response System
            </div>
          </>
        )}
      </div>
    </div>
  );
}

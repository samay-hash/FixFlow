import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { Plus, AlertTriangle, Filter, Flame, ChevronRight, Zap } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

const SeverityBadge = ({ s }) => {
  const map = { critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };
  return <span className={map[s] || 'badge'}>{s}</span>;
};

const HealthScore = ({ score }) => {
  const color = score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400';
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative w-8 h-8">
        <svg className="w-8 h-8 -rotate-90">
          <circle cx="16" cy="16" r="12" stroke="#1e293b" strokeWidth="3" fill="none" />
          <circle cx="16" cy="16" r="12" stroke={score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'}
            strokeWidth="3" fill="none" strokeDasharray={`${(score / 100) * 75.4} 75.4`} strokeLinecap="round" />
        </svg>
        <span className={clsx('absolute inset-0 flex items-center justify-center text-xs font-bold', color)}>{score}</span>
      </div>
    </div>
  );
};

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', severity: '' });
  const [chaosLoading, setChaosLoading] = useState(false);
  const { user } = useSelector(s => s.auth);
  // Also listen to Redux for real-time additions
  const { list: realtimeList } = useSelector(s => s.incidents);

  const load = async () => {
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.severity) params.severity = filter.severity;
      const { data } = await api.get('/incidents', { params });
      setIncidents(data.incidents);
    } catch { toast.error('Failed to load incidents'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  // Merge real-time additions from Redux
  useEffect(() => {
    if (realtimeList.length > 0) setIncidents(realtimeList);
  }, [realtimeList]);

  const handleChaos = async () => {
    setChaosLoading(true);
    try {
      await api.post('/incidents/debug/chaos');
      toast.success('🔥 Chaos Mode Activated!');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Chaos failed'); }
    finally { setChaosLoading(false); }
  };

  const sorted = [...incidents].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="page-header flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="page-title">Incident Management</h1>
            <p className="page-subtitle">{incidents.filter(i => i.status !== 'resolved').length} active • {incidents.length} total</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {/* Chaos Mode Button - Demo showstopper */}
            {user?.role === 'admin' && (
              <button onClick={handleChaos} disabled={chaosLoading}
                className="btn bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-500/30 animate-pulse-slow">
                <Flame size={16} />
                {chaosLoading ? 'Triggering...' : '🔥 Trigger Chaos'}
              </button>
            )}
            <Link to="/incidents/new" className="btn-primary"><Plus size={16} />New Incident</Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2 text-slate-400"><Filter size={14} /><span className="text-sm">Filter:</span></div>
          {['', 'open', 'in_progress', 'resolved'].map(s => (
            <button key={s} onClick={() => setFilter(f => ({ ...f, status: s }))}
              className={clsx('btn-sm btn', filter.status === s ? 'btn-primary' : 'btn-ghost')}>
              {s || 'All'} {s === '' && `(${incidents.length})`}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            {['', 'critical', 'high', 'medium', 'low'].map(s => (
              <button key={s} onClick={() => setFilter(f => ({ ...f, severity: s }))}
                className={clsx('btn-sm btn', filter.severity === s ? 'btn-primary' : 'btn-ghost capitalize')}>
                {s || 'Any'}
              </button>
            ))}
          </div>
        </div>

        {/* Incident List */}
        {loading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="card h-20 animate-pulse" />)}</div>
        ) : sorted.length === 0 ? (
          <div className="card text-center py-16">
            <AlertTriangle size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-white font-semibold">No incidents found</p>
            <p className="text-slate-400 text-sm mt-1">All systems operational ✅</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-3">
              {sorted.map((inc, i) => (
                <motion.div key={inc._id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}>
                  <Link to={`/incidents/${inc._id}`}
                    className={clsx('card-hover flex items-center gap-4 group', inc.status !== 'resolved' && inc.severity === 'critical' && 'border-red-500/40')}>

                    {/* Health Score */}
                    <HealthScore score={inc.healthScore ?? 100} />

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <SeverityBadge s={inc.severity} />
                        <span className={clsx('text-xs font-medium', inc.status === 'resolved' ? 'text-emerald-400' : inc.status === 'in_progress' ? 'text-yellow-400' : 'text-red-400')}>
                          {inc.status.replace('_', ' ')}
                        </span>
                        {inc.source === 'auto' && <span className="badge bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs"><Zap size={9} />auto</span>}
                      </div>
                      <h3 className="font-semibold text-white text-sm group-hover:text-blue-300 transition-colors truncate">{inc.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        {inc.siteId && <span className="text-xs text-slate-500">{inc.siteId.name}</span>}
                        <span className="text-xs text-slate-500">{new Date(inc.createdAt).toLocaleString()}</span>
                        {inc.assignedTo?.length > 0 && (
                          <span className="text-xs text-slate-500">{inc.assignedTo.length} assigned</span>
                        )}
                        {inc.timeline?.length > 0 && (
                          <span className="text-xs text-slate-500">{inc.timeline.length} updates</span>
                        )}
                      </div>
                    </div>

                    <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}

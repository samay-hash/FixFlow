import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { Plus, AlertTriangle, Filter, Flame, ChevronRight, Zap, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../components/ConfirmModal';

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

const SeverityBadge = ({ s }) => {
  const map = { critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };
  return <span className={map[s] || 'badge'}>{s}</span>;
};

const HealthScore = ({ score }) => {
  const color = score >= 70 ? 'var(--accent)' : score >= 40 ? 'var(--yellow)' : 'var(--pink)';
  return (
    <div className="relative w-9 h-9 flex-shrink-0">
      <svg className="w-9 h-9 -rotate-90">
        <circle cx="18" cy="18" r="13" stroke="#ccc" strokeWidth="3" fill="none" />
        <circle cx="18" cy="18" r="13" stroke={color} strokeWidth="3" fill="none"
          strokeDasharray={`${(score / 100) * 81.7} 81.7`} strokeLinecap="butt" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-black" style={{ color: 'var(--black)' }}>
        {score}
      </span>
    </div>
  );
};

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState({ status: '', severity: '' });
  const [chaosLoading, setChaosLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, type: null }); // type: 'single' | 'all'
  const { user } = useSelector(s => s.auth);
  const { list: realtimeList } = useSelector(s => s.incidents);

  const load = async () => {
    try {
      const params = {};
      if (filter.status)   params.status   = filter.status;
      if (filter.severity) params.severity  = filter.severity;
      const { data } = await api.get('/incidents', { params });
      setIncidents(data.incidents);
    } catch { toast.error('Failed to load incidents'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);
  useEffect(() => { if (realtimeList.length > 0) setIncidents(realtimeList); }, [realtimeList]);

  const handleStressTest = async () => {
    setChaosLoading(true);
    try {
      await api.post('/incidents/stress-test');
      toast.success('⚡ Stress Test Initiated! Sending requests...');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Stress test failed'); }
    finally { setChaosLoading(false); }
  };

  const deleteIncident = async (id) => {
    try {
      await api.delete(`/incidents/${id}`);
      setIncidents(prev => prev.filter(i => i._id !== id));
      toast.success('Incident deleted');
    } catch { toast.error('Failed to delete incident'); }
  };

  const deleteAllIncidents = async () => {
    try {
      await api.delete('/incidents');
      setIncidents([]);
      toast.success('All incidents deleted');
    } catch { toast.error('Failed to delete incidents'); }
  };

  const handleConfirmAction = () => {
    if (confirmModal.type === 'single') deleteIncident(confirmModal.id);
    else if (confirmModal.type === 'all') deleteAllIncidents();
  };

  const sorted = [...incidents].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  const activeCount  = incidents.filter(i => i.status !== 'resolved').length;
  const totalCount   = incidents.length;

  const statusFilters   = ['', 'open', 'in_progress', 'resolved'];
  const severityFilters = ['', 'critical', 'high', 'medium', 'low'];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 page-enter">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="page-header flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase px-2 py-0.5"
                style={{ background: 'var(--pink)', border: '2px solid var(--black)', color: 'white' }}>
                // INCIDENTS
              </span>
            </div>
            <h1 className="page-title">Incident Management</h1>
            <p className="page-subtitle">{activeCount} active • {totalCount} total</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {user?.role === 'admin' && incidents.length > 0 && (
              <button onClick={() => setConfirmModal({ isOpen: true, type: 'all', id: null })} className="btn-sm flex items-center gap-2 px-4" style={{ background: 'var(--pink)', color: 'white', border: '2px solid var(--black)', boxShadow: '3px 3px 0 var(--black)' }}>
                <Trash2 size={16} /> Delete All
              </button>
            )}
            {user?.role === 'admin' && (
              <button onClick={handleStressTest} disabled={chaosLoading} className="btn-danger flex items-center gap-2 px-4" style={{ background: 'var(--yellow)', color: 'var(--black)' }}>
                <Zap size={16} />
                {chaosLoading ? 'Running...' : '⚡ Run Stress Test'}
              </button>
            )}
            <Link to="/incidents/new" className="btn-primary">
              <Plus size={16} />New Incident
            </Link>
          </div>
        </div>

        {/* ── Filters ─────────────────────────────────────── */}
        <div className="flex gap-2 mb-6 flex-wrap items-center">
          <div className="flex items-center gap-1.5" style={{ color: '#666' }}>
            <Filter size={13} />
            <span className="text-xs font-bold uppercase">Status:</span>
          </div>
          {statusFilters.map(s => (
            <button key={s}
              onClick={() => setFilter(f => ({ ...f, status: s }))}
              className={clsx('btn-sm btn', filter.status === s ? 'btn-primary' : 'btn-ghost')}>
              {s || 'All'}{s === '' && ` (${totalCount})`}
            </button>
          ))}
          <div className="ml-auto flex gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase flex items-center" style={{ color: '#666' }}>Severity:</span>
            {severityFilters.map(s => (
              <button key={s}
                onClick={() => setFilter(f => ({ ...f, severity: s }))}
                className={clsx('btn-sm btn capitalize', filter.severity === s ? 'btn-primary' : 'btn-ghost')}>
                {s || 'Any'}
              </button>
            ))}
          </div>
        </div>

        {/* ── List ────────────────────────────────────────── */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-20 animate-pulse"
                style={{ background: 'var(--cream-2)', border: '3px solid var(--black)' }} />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-16 text-center"
            style={{ background: 'var(--cream-2)', border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--black)' }}>
            <AlertTriangle size={40} className="mx-auto mb-3" style={{ color: '#888' }} />
            <p className="font-black text-lg uppercase" style={{ color: 'var(--black)' }}>No incidents found</p>
            <p className="text-sm font-medium mt-1" style={{ color: '#666' }}>All systems operational ✅</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-3">
              {sorted.map((inc, i) => (
                <motion.div key={inc._id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}>
                  <Link to={`/incidents/${inc._id}`}
                    className="flex items-center gap-4 p-4 transition-all group"
                    style={{
                      background: inc.severity === 'critical' && inc.status !== 'resolved' ? '#FFF0F4' : 'white',
                      border: `3px solid ${inc.severity === 'critical' && inc.status !== 'resolved' ? 'var(--pink)' : 'var(--black)'}`,
                      boxShadow: '3px 3px 0 var(--black)',
                      display: 'flex',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '5px 5px 0 var(--black)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0 var(--black)'; }}
                  >
                    <HealthScore score={inc.healthScore ?? 100} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <SeverityBadge s={inc.severity} />
                        <span className="text-xs font-bold uppercase" style={{
                          color: inc.status === 'resolved' ? '#0A8A00' : inc.status === 'in_progress' ? '#8A5A00' : 'var(--pink)',
                        }}>
                          {inc.status.replace('_', ' ')}
                        </span>
                        {inc.source === 'auto' && (
                          <span className="badge" style={{ background: '#EDE0FF', color: '#5500CC', borderColor: '#5500CC' }}>
                            <Zap size={9} />auto
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm truncate" style={{ color: 'var(--black)' }}>{inc.title}</h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {inc.siteId && <span className="text-xs" style={{ color: '#888' }}>{inc.siteId.name}</span>}
                        <span className="text-xs" style={{ color: '#888' }}>{new Date(inc.createdAt).toLocaleString()}</span>
                        {inc.assignedTo?.length > 0 && (
                          <span className="text-xs" style={{ color: '#888' }}>{inc.assignedTo.length} assigned</span>
                        )}
                        {inc.timeline?.length > 0 && (
                          <span className="text-xs" style={{ color: '#888' }}>{inc.timeline.length} updates</span>
                        )}
                      </div>
                    </div>

                      <div className="flex items-center gap-2">
                        {user?.role === 'admin' && (
                          <button 
                            onClick={(e) => { e.preventDefault(); setConfirmModal({ isOpen: true, type: 'single', id: inc._id }); }}
                            className="p-2 transition-opacity opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded"
                            title="Delete Incident"
                            style={{ color: 'var(--pink)' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        <ChevronRight size={16} style={{ color: '#aaa', flexShrink: 0 }} />
                      </div>
                    </Link>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        <ConfirmModal 
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, id: null, type: null })}
          onConfirm={handleConfirmAction}
          title={confirmModal.type === 'all' ? "Delete All Incidents" : "Delete Incident"}
          message={confirmModal.type === 'all' 
            ? "Are you sure you want to delete ALL incidents? This will wipe your incident history entirely." 
            : "Are you sure you want to delete this incident permanently?"}
          confirmText="Delete"
        />
      </main>
    </div>
  );
}

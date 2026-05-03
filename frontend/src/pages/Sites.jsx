import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { Plus, Globe, Trash2, RefreshCw, ExternalLink, Wifi, WifiOff, Clock } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../components/ConfirmModal';

const StatusBadge = ({ s }) => {
  const map = { up: 'status-up', down: 'status-down', degraded: 'status-degraded', unknown: 'status-unknown' };
  const icons = { up: '✅', down: '🔴', degraded: '🟡', unknown: '⚪' };
  return <span className={map[s]}>{icons[s]} {s}</span>;
};

export default function Sites() {
  const [sites, setSites]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ name: '', url: '', checkInterval: 5 });
  const [adding, setAdding]     = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, name: '' });
  const { user } = useSelector(s => s.auth);
  const isAdmin  = user?.role === 'admin' || user?.role === 'engineer';

  const load = async () => {
    try {
      const { data } = await api.get('/sites');
      setSites(data.sites);
    } catch { toast.error('Failed to load sites'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const { data } = await api.post('/sites', form);
      setSites(prev => [data.site, ...prev]);
      setForm({ name: '', url: '', checkInterval: 5 });
      setShowForm(false);
      toast.success(`✅ ${data.site.name} added to monitoring`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add site'); }
    finally { setAdding(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/sites/${confirmModal.id}`);
      setSites(prev => prev.filter(s => s._id !== confirmModal.id));
      toast.success('Site removed');
    } catch { toast.error('Failed to delete site'); }
  };

  const runStressTest = async (siteId) => {
    toast.loading('Initiating Stress Test...', { id: 'stress' });
    try {
      await api.post('/incidents/stress-test', { siteId });
      toast.success('Stress Test started! Blasting 500 requests.', { id: 'stress' });
    } catch { 
      toast.error('Failed to start test', { id: 'stress' }); 
    }
  };

  const upSites   = sites.filter(s => s.status === 'up').length;
  const downSites = sites.filter(s => s.status === 'down').length;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 page-enter">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="page-header flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase px-2 py-0.5"
                style={{ background: 'var(--blue)', border: '2px solid var(--black)', color: 'white' }}>
                // MONITORING
              </span>
            </div>
            <h1 className="page-title">Monitored Sites</h1>
            <p className="page-subtitle">
              {sites.length} sites • {upSites} up{downSites > 0 ? ` • ${downSites} DOWN` : ''}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={load} className="btn-ghost btn-sm"><RefreshCw size={14} />Refresh</button>
            {isAdmin && (
              <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                <Plus size={16} />Add Site
              </button>
            )}
          </div>
        </div>

        {/* ── Add Form ────────────────────────────────────── */}
        {showForm && (
          <div className="mb-6 p-5 animate-fade-in"
            style={{ background: 'var(--cream-2)', border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--blue)' }}>
            <h3 className="font-black text-sm uppercase tracking-wide mb-4" style={{ color: 'var(--black)' }}>
              Add New Site to Monitor
            </h3>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Site Name</label>
                <input className="input" placeholder="My API Server" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">URL</label>
                <input className="input" placeholder="https://api.myapp.com" value={form.url}
                  onChange={e => setForm({ ...form, url: e.target.value })} required />
              </div>
              <div>
                <label className="label">Check Every (minutes)</label>
                <select className="input" value={form.checkInterval}
                  onChange={e => setForm({ ...form, checkInterval: Number(e.target.value) })}>
                  {[1, 2, 5, 10, 15, 30].map(v => <option key={v} value={v}>{v} min</option>)}
                </select>
              </div>
              <div className="md:col-span-3 flex gap-3">
                <button type="submit" disabled={adding} className="btn-primary">
                  {adding ? 'Adding...' : 'Add Site'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* ── Sites Grid ──────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-44 animate-pulse"
                style={{ background: 'var(--cream-2)', border: '3px solid var(--black)' }} />
            ))}
          </div>
        ) : sites.length === 0 ? (
          <div className="p-16 text-center"
            style={{ background: 'var(--cream-2)', border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--black)' }}>
            <Globe size={48} className="mx-auto mb-4" style={{ color: '#888' }} />
            <h3 className="font-black text-lg uppercase mb-2" style={{ color: 'var(--black)' }}>No sites yet</h3>
            <p className="text-sm font-medium mb-4" style={{ color: '#666' }}>Add your first website to start monitoring</p>
            {isAdmin && (
              <button onClick={() => setShowForm(true)} className="btn-primary mx-auto">
                <Plus size={16} />Add Site
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sites.map(site => (
              <div key={site._id}
                className="p-5 relative group"
                style={{
                  background: site.status === 'down' ? '#FFF0F4' : 'var(--cream-2)',
                  border: `3px solid ${site.status === 'down' ? 'var(--pink)' : 'var(--black)'}`,
                  boxShadow: '4px 4px 0 var(--black)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '6px 6px 0 var(--black)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0 var(--black)'; }}
              >
                {site.status === 'down' && (
                  <div className="absolute top-3 right-3"><span className="pulse-dot-red" /></div>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {site.status === 'down'
                      ? <WifiOff size={18} style={{ color: 'var(--pink)' }} />
                      : <Wifi size={18} style={{ color: '#0A8A00' }} />}
                    <h3 className="font-black text-sm" style={{ color: 'var(--black)' }}>{site.name}</h3>
                  </div>
                  <StatusBadge s={site.status} />
                </div>

                <a href={site.url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-medium mb-4 truncate"
                  style={{ color: 'var(--blue)' }}>
                  <ExternalLink size={10} />{site.url}
                </a>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: 'Uptime', value: `${site.uptimePercent}%` },
                    { label: 'Response', value: `${site.responseTime || '—'}ms` },
                    { label: 'Interval', value: `${site.checkInterval}m` },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center p-2"
                      style={{ background: 'var(--cream-2)', border: '2px solid var(--black)' }}>
                      <p className="text-sm font-black" style={{ color: 'var(--black)' }}>{value}</p>
                      <p className="text-xs font-medium" style={{ color: '#888' }}>{label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs" style={{ color: '#888' }}>
                    <Clock size={10} />
                    {site.lastChecked ? new Date(site.lastChecked).toLocaleTimeString() : 'Not checked yet'}
                  </div>
                  <div className="flex gap-2 items-center">
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => runStressTest(site._id)}
                        className="btn-sm font-black uppercase tracking-wider transition-opacity opacity-0 group-hover:opacity-100"
                        style={{ background: '#C8FF00', color: 'var(--black)', border: '2px solid var(--black)', padding: '2px 8px', fontSize: '10px' }}
                      >
                        ⚡ Test
                      </button>
                    )}
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => setConfirmModal({ isOpen: true, id: site._id, name: site.name })}
                        className="transition-opacity opacity-0 group-hover:opacity-100"
                        style={{ color: 'var(--pink)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Webhooks & Integrations ──────────────────────── */}
        {!loading && isAdmin && (
          <div className="mt-8 p-6" style={{ background: 'var(--black)', border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--black)' }}>
            <div className="flex items-start gap-4 flex-wrap">
              <div className="p-3 flex-shrink-0" style={{ background: '#1E1E1E', border: '2px solid #333', boxShadow: '2px 2px 0 #FF8C42' }}>
                <Globe size={24} color="#FF8C42" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-lg uppercase mb-2" style={{ color: '#FF8C42', letterSpacing: '0.1em' }}>GitHub Webhook Integration</h3>
                <p className="text-sm mb-4 max-w-2xl" style={{ color: '#888' }}>
                  Connect your GitHub repositories to FixFlow. Automatically generate an Incident War Room whenever a deployment fails or a GitHub Actions workflow crashes.
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <input 
                    readOnly 
                    className="input flex-1 max-w-lg font-mono text-xs" 
                    style={{ background: '#0A0A0A', color: '#00FF41', border: '2px solid #333' }}
                    value={`${window.location.origin.replace('5173', '5001')}/api/webhooks/github/${user?.companyId}`} 
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin.replace('5173', '5001')}/api/webhooks/github/${user?.companyId}`);
                      toast.success('Webhook URL copied!');
                    }} 
                    className="btn-primary btn-sm flex items-center gap-2"
                  >
                    <ExternalLink size={14} /> Copy URL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <ConfirmModal 
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, id: null, name: '' })}
          onConfirm={handleDelete}
          title="Delete Monitored Site"
          message={`Are you sure you want to stop monitoring "${confirmModal.name}" and delete it? This cannot be undone.`}
          confirmText="Delete"
        />
      </main>
    </div>
  );
}

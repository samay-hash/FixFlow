import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { Plus, Globe, Trash2, RefreshCw, ExternalLink, Wifi, WifiOff, Clock } from 'lucide-react';
import clsx from 'clsx';

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

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}" from monitoring?`)) return;
    try {
      await api.delete(`/sites/${id}`);
      setSites(prev => prev.filter(s => s._id !== id));
      toast.success('Site removed');
    } catch { toast.error('Failed to delete site'); }
  };

  const upSites   = sites.filter(s => s.status === 'up').length;
  const downSites = sites.filter(s => s.status === 'down').length;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="page-header flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase px-2 py-0.5"
                style={{ background: '#0050FF', border: '2px solid #0A0A0A', color: 'white' }}>
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
            style={{ background: '#EAE4D9', border: '3px solid #0A0A0A', boxShadow: '4px 4px 0 #0050FF' }}>
            <h3 className="font-black text-sm uppercase tracking-wide mb-4" style={{ color: '#0A0A0A' }}>
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
                style={{ background: '#EAE4D9', border: '3px solid #0A0A0A' }} />
            ))}
          </div>
        ) : sites.length === 0 ? (
          <div className="p-16 text-center"
            style={{ background: '#EAE4D9', border: '3px solid #0A0A0A', boxShadow: '4px 4px 0 #0A0A0A' }}>
            <Globe size={48} className="mx-auto mb-4" style={{ color: '#888' }} />
            <h3 className="font-black text-lg uppercase mb-2" style={{ color: '#0A0A0A' }}>No sites yet</h3>
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
                  background: site.status === 'down' ? '#FFF0F4' : '#EAE4D9',
                  border: `3px solid ${site.status === 'down' ? '#FF2D78' : '#0A0A0A'}`,
                  boxShadow: '4px 4px 0 #0A0A0A',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '6px 6px 0 #0A0A0A'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0 #0A0A0A'; }}
              >
                {site.status === 'down' && (
                  <div className="absolute top-3 right-3"><span className="pulse-dot-red" /></div>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {site.status === 'down'
                      ? <WifiOff size={18} style={{ color: '#FF2D78' }} />
                      : <Wifi size={18} style={{ color: '#0A8A00' }} />}
                    <h3 className="font-black text-sm" style={{ color: '#0A0A0A' }}>{site.name}</h3>
                  </div>
                  <StatusBadge s={site.status} />
                </div>

                <a href={site.url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-medium mb-4 truncate"
                  style={{ color: '#0050FF' }}>
                  <ExternalLink size={10} />{site.url}
                </a>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: 'Uptime', value: `${site.uptimePercent}%` },
                    { label: 'Response', value: `${site.responseTime || '—'}ms` },
                    { label: 'Interval', value: `${site.checkInterval}m` },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center p-2"
                      style={{ background: 'white', border: '2px solid #0A0A0A' }}>
                      <p className="text-sm font-black" style={{ color: '#0A0A0A' }}>{value}</p>
                      <p className="text-xs font-medium" style={{ color: '#888' }}>{label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs" style={{ color: '#888' }}>
                    <Clock size={10} />
                    {site.lastChecked ? new Date(site.lastChecked).toLocaleTimeString() : 'Not checked yet'}
                  </div>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(site._id, site.name)}
                      className="transition-opacity opacity-0 group-hover:opacity-100"
                      style={{ color: '#FF2D78' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

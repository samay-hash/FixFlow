import { useEffect, useState } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import { Activity, Search, RefreshCw, AlertCircle, Info, AlertTriangle, Skull } from 'lucide-react';
import clsx from 'clsx';

const LEVEL_CONFIG = {
  fatal:   { icon: Skull,         color: 'var(--pink)', bg: 'var(--pink)', label: 'FATAL'   },
  error:   { icon: AlertCircle,   color: '#FF6B00', bg: '#FF6B00', label: 'ERROR'   },
  warning: { icon: AlertTriangle, color: '#8A5A00', bg: 'var(--yellow)', label: 'WARN'    },
  info:    { icon: Info,          color: 'var(--blue)', bg: '#D0E0FF', label: 'INFO'    },
};

export default function Logs() {
  const [logs, setLogs]           = useState([]);
  const [summary, setSummary]     = useState({ info: 0, warning: 0, error: 0, fatal: 0 });
  const [filter, setFilter]       = useState('');
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.level = filter;
      const [logRes, sumRes] = await Promise.all([
        api.get('/logs', { params: { ...params, limit: 200 } }),
        api.get('/logs/summary'),
      ]);
      setLogs(logRes.data.logs);
      setSummary(sumRes.data.summary);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const displayed = logs.filter(l =>
    !search ||
    l.message.toLowerCase().includes(search.toLowerCase()) ||
    l.source?.toLowerCase().includes(search.toLowerCase())
  );

  const totalErrors = (summary.error || 0) + (summary.fatal || 0);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="page-header flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase px-2 py-0.5"
                style={{ background: 'var(--black)', border: '2px solid var(--black)', color: 'var(--accent)' }}>
                // EXPLORER
              </span>
            </div>
            <h1 className="page-title">Log Explorer</h1>
            <p className="page-subtitle">{displayed.length} entries • {totalErrors} errors in 24h</p>
          </div>
          <button onClick={load} className="btn-ghost btn-sm"><RefreshCw size={14} />Refresh</button>
        </div>

        {/* ── Summary Cards ────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {Object.entries(LEVEL_CONFIG).map(([level, cfg]) => {
            const Icon = cfg.icon;
            const isActive = filter === level;
            return (
              <button key={level}
                onClick={() => setFilter(filter === level ? '' : level)}
                className="p-4 text-left transition-all"
                style={{
                  background: isActive ? cfg.bg : 'var(--cream-2)',
                  border: `3px solid var(--black)`,
                  boxShadow: isActive ? '4px 4px 0 var(--black)' : '3px 3px 0 var(--black)',
                  transform: isActive ? 'translate(-1px,-1px)' : 'none',
                }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon size={12} style={{ color: isActive ? 'var(--black)' : cfg.color }} />
                  <span className="text-xs font-black uppercase tracking-wider"
                    style={{ color: isActive ? 'var(--black)' : cfg.color }}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-3xl font-black" style={{ color: 'var(--black)' }}>{summary[level] || 0}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: '#666' }}>last 24h</p>
              </button>
            );
          })}
        </div>

        {/* ── Search ──────────────────────────────────────── */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#888' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search log messages or source..."
            className="input pl-9" />
        </div>

        {/* ── Log Table ───────────────────────────────────── */}
        <div style={{ border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--black)', overflow: 'hidden' }}>
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Activity size={24} style={{ color: 'var(--blue)' }} className="animate-spin" />
              </div>
            ) : displayed.length === 0 ? (
              <div className="text-center py-16">
                <Activity size={32} className="mx-auto mb-3" style={{ color: '#888' }} />
                <p className="text-sm font-bold" style={{ color: 'var(--black)' }}>No logs found</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead style={{ position: 'sticky', top: 0, background: 'var(--black)', borderBottom: '3px solid var(--black)' }}>
                  <tr>
                    {['Level', 'Timestamp', 'Source', 'Message'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider"
                        style={{ color: 'var(--accent)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((log, i) => {
                    const cfg = LEVEL_CONFIG[log.level] || LEVEL_CONFIG.info;
                    const Icon = cfg.icon;
                    return (
                      <tr key={log._id}
                        style={{
                          background: i % 2 === 0 ? 'var(--cream-2)' : 'white',
                          borderBottom: '1px solid #ccc',
                        }}
                      >
                        <td className="px-4 py-2.5">
                          <span className="inline-flex items-center gap-1 text-xs font-black px-2 py-0.5"
                            style={{ background: cfg.bg, color: log.level === 'warning' ? '#8A5A00' : 'white', border: '1.5px solid var(--black)' }}>
                            <Icon size={9} />{cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-xs font-mono" style={{ color: '#666' }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs font-black px-1.5 py-0.5"
                            style={{ background: 'var(--black)', color: 'var(--accent)', fontFamily: 'monospace' }}>
                            {log.source || 'system'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-xs font-mono" style={{ color: 'var(--black)' }}>
                          {log.message}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

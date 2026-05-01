import { useEffect, useState } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import { Activity, Search, RefreshCw, AlertCircle, Info, AlertTriangle, Skull } from 'lucide-react';
import clsx from 'clsx';

const LEVEL_CONFIG = {
  fatal:   { icon: Skull,         color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',    label: 'FATAL'   },
  error:   { icon: AlertCircle,   color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', label: 'ERROR'  },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', label: 'WARN'  },
  info:    { icon: Info,          color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/30',    label: 'INFO'   },
};

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({ info: 0, warning: 0, error: 0, fatal: 0 });
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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

  const displayed = logs.filter(l => !search || l.message.toLowerCase().includes(search.toLowerCase()) || l.source?.toLowerCase().includes(search.toLowerCase()));

  const totalErrors = (summary.error || 0) + (summary.fatal || 0);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Log Explorer</h1>
            <p className="page-subtitle">{displayed.length} log entries • {totalErrors} errors in 24h</p>
          </div>
          <button onClick={load} className="btn-ghost btn-sm"><RefreshCw size={14} />Refresh</button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {Object.entries(LEVEL_CONFIG).map(([level, cfg]) => {
            const Icon = cfg.icon;
            return (
              <button key={level} onClick={() => setFilter(filter === level ? '' : level)}
                className={clsx('card text-left transition-all hover:scale-105', filter === level && 'border-white/30')}>
                <div className={clsx('inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-bold mb-2', cfg.bg, cfg.color)}>
                  <Icon size={10} />{cfg.label}
                </div>
                <p className={clsx('text-2xl font-bold', cfg.color)}>{summary[level] || 0}</p>
                <p className="text-xs text-slate-500 mt-0.5">last 24h</p>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search log messages or source..." className="input pl-9" />
        </div>

        {/* Log Table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-auto max-h-[60vh]">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Activity size={24} className="text-blue-400 animate-spin" />
              </div>
            ) : displayed.length === 0 ? (
              <div className="text-center py-16">
                <Activity size={32} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No logs found</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-dark-800 border-b border-slate-700">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs text-slate-400 font-medium w-24">Level</th>
                    <th className="text-left px-4 py-3 text-xs text-slate-400 font-medium w-40">Timestamp</th>
                    <th className="text-left px-4 py-3 text-xs text-slate-400 font-medium w-28">Source</th>
                    <th className="text-left px-4 py-3 text-xs text-slate-400 font-medium">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((log, i) => {
                    const cfg = LEVEL_CONFIG[log.level] || LEVEL_CONFIG.info;
                    const Icon = cfg.icon;
                    return (
                      <tr key={log._id} className={clsx('border-b border-slate-800 hover:bg-dark-800/50 transition-colors', i % 2 === 0 && 'bg-dark-700/20')}>
                        <td className="px-4 py-2.5">
                          <span className={clsx('inline-flex items-center gap-1 text-xs font-mono font-bold', cfg.color)}>
                            <Icon size={10} />{cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-slate-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs text-slate-400 bg-slate-700/40 px-1.5 py-0.5 rounded font-mono">{log.source || 'system'}</span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-300 font-mono text-xs">{log.message}</td>
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

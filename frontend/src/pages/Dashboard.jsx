import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setIncidents, setStats } from '../store/incidentSlice';
import api from '../api/axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Globe, Activity, CheckCircle2, Clock, Zap, TrendingUp, ArrowRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import clsx from 'clsx';

const SeverityBadge = ({ s }) => {
  const map = { critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };
  return <span className={map[s] || 'badge'}>{s}</span>;
};

const StatusDot = ({ s }) => {
  const colors = { up: 'bg-emerald-500', down: 'bg-red-500', degraded: 'bg-yellow-500', unknown: 'bg-slate-500' };
  return <span className={clsx('inline-block w-2.5 h-2.5 rounded-full', colors[s] || 'bg-slate-500')} />;
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const { stats, list: incidents } = useSelector(state => state.incidents);
  const { user } = useSelector(state => state.auth);
  const [sites, setSites] = useState([]);
  const [logSummary, setLogSummary] = useState({ info: 0, warning: 0, error: 0, fatal: 0 });
  const [loading, setLoading] = useState(true);
  const [uptimeData, setUptimeData] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [incRes, statsRes, siteRes, logRes] = await Promise.all([
          api.get('/incidents?limit=5'),
          api.get('/incidents/stats'),
          api.get('/sites'),
          api.get('/logs/summary'),
        ]);
        dispatch(setIncidents(incRes.data.incidents));
        dispatch(setStats(statsRes.data.stats));
        setSites(siteRes.data.sites);
        setLogSummary(logRes.data.summary);

        // Build mock uptime sparkline from sites
        const data = Array.from({ length: 12 }, (_, i) => ({
          time: `${i * 2}h ago`,
          uptime: 95 + Math.random() * 5,
        }));
        setUptimeData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dispatch]);

  const statCards = [
    { label: 'Active Incidents', value: stats.open, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    { label: 'In Progress', value: stats.inProgress, icon: Activity, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { label: 'Sites Monitored', value: sites.length, icon: Globe, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Resolved Today', value: stats.resolved, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  ];

  const avgMttrMin = Math.round(stats.avgMttrSeconds / 60);
  const downSites = sites.filter(s => s.status === 'down');

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="page-subtitle">Here's what's happening across your infrastructure</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Last updated</p>
            <p className="text-sm font-mono text-slate-300">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Critical Alert Banner */}
        {downSites.length > 0 && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/40 rounded-xl flex items-center gap-3 animate-fade-in">
            <span className="pulse-dot-red" />
            <p className="text-red-300 font-medium text-sm flex-1">
              🚨 {downSites.length} site{downSites.length > 1 ? 's are' : ' is'} currently DOWN:{' '}
              <span className="font-bold">{downSites.map(s => s.name).join(', ')}</span>
            </p>
            <Link to="/incidents" className="btn-danger btn-sm">View Incidents →</Link>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`card border ${bg} transition-all hover:scale-105`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 font-medium">{label}</span>
                <div className={`p-2 rounded-lg ${bg}`}><Icon size={16} className={color} /></div>
              </div>
              <p className={`text-3xl font-bold ${color}`}>{loading ? '...' : value}</p>
            </div>
          ))}
        </div>

        {/* MTTR + Uptime Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Uptime Chart */}
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white text-sm">Uptime Trend</h3>
                <p className="text-xs text-slate-400">Last 24 hours</p>
              </div>
              <span className="badge-low">Avg: {sites.length > 0 ? (sites.reduce((a, s) => a + s.uptimePercent, 0) / sites.length).toFixed(1) : 100}%</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={uptimeData}>
                <defs>
                  <linearGradient id="uptimeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[90, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="uptime" stroke="#10b981" strokeWidth={2} fill="url(#uptimeGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* MTTR & Log Summary */}
          <div className="space-y-4">
            <div className="card text-center">
              <Clock size={20} className="text-blue-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{avgMttrMin || '—'}<span className="text-sm text-slate-400 ml-1">min</span></p>
              <p className="text-xs text-slate-400 mt-1">Avg. Time to Resolve</p>
            </div>
            <div className="card">
              <p className="text-xs font-semibold text-slate-400 mb-3">24h Log Summary</p>
              <div className="space-y-2">
                {[['fatal', '#ef4444'], ['error', '#f97316'], ['warning', '#f59e0b'], ['info', '#3b82f6']].map(([l, c]) => (
                  <div key={l} className="flex items-center justify-between">
                    <span className="text-xs capitalize text-slate-400">{l}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-dark-900 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, (logSummary[l] / (Object.values(logSummary).reduce((a, b) => a + b, 1))) * 100)}%`, background: c }} />
                      </div>
                      <span className="text-xs font-mono text-slate-300 w-6 text-right">{logSummary[l]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Incidents + Site Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Incidents */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white text-sm">Recent Incidents</h3>
              <Link to="/incidents" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">View all <ArrowRight size={12} /></Link>
            </div>
            {incidents.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400">All clear! No incidents.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {incidents.slice(0, 5).map(inc => (
                  <Link key={inc._id} to={`/incidents/${inc._id}`} className="flex items-center gap-3 p-3 rounded-lg bg-dark-800/60 hover:bg-dark-800 transition-colors border border-slate-700/30 hover:border-slate-600/50 group">
                    <SeverityBadge s={inc.severity} />
                    <p className="text-sm text-slate-300 group-hover:text-white flex-1 truncate">{inc.title}</p>
                    <span className={clsx('text-xs', inc.status === 'resolved' ? 'text-emerald-400' : inc.status === 'in_progress' ? 'text-yellow-400' : 'text-red-400')}>
                      {inc.status.replace('_', ' ')}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Site Status */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white text-sm">Site Status</h3>
              <Link to="/sites" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">Manage <ArrowRight size={12} /></Link>
            </div>
            {sites.length === 0 ? (
              <div className="text-center py-8">
                <Globe size={32} className="text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No sites added yet.</p>
                <Link to="/sites" className="btn-primary btn-sm mt-3 inline-flex">Add your first site</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {sites.slice(0, 6).map(site => (
                  <div key={site._id} className="flex items-center gap-3 p-3 rounded-lg bg-dark-800/60 border border-slate-700/30">
                    <StatusDot s={site.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 truncate">{site.name}</p>
                      <p className="text-xs text-slate-500 truncate">{site.url}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-mono text-slate-400">{site.responseTime}ms</p>
                      <p className="text-xs text-slate-500">{site.uptimePercent}% up</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

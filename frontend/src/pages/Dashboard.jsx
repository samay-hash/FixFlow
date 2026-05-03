import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setIncidents, setStats } from '../store/incidentSlice';
import api from '../api/axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Globe, Activity, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import clsx from 'clsx';

const SeverityBadge = ({ s }) => {
  const map = { critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };
  return <span className={map[s] || 'badge'}>{s}</span>;
};

const StatusDot = ({ s }) => {
  const map = { up: 'var(--accent)', down: 'var(--pink)', degraded: 'var(--yellow)', unknown: '#ccc' };
  return (
    <span className="inline-block w-3 h-3 flex-shrink-0"
      style={{ background: map[s] || '#ccc', border: '2px solid var(--black)' }} />
  );
};

const StatCard = ({ label, value, icon: Icon, loading, accent }) => (
  <div
    className="p-5 relative overflow-hidden"
    style={{ background: 'var(--cream-2)', border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--black)' }}
  >
    <div
      className="absolute top-0 right-0 w-12 h-12 flex items-center justify-center"
      style={{ background: accent, borderLeft: '3px solid var(--black)', borderBottom: '3px solid var(--black)' }}
    >
      <Icon size={16} color="var(--black)" />
    </div>
    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#666' }}>{label}</p>
    <p className="text-4xl font-black" style={{ color: 'var(--black)' }}>
      {loading ? '—' : value ?? 0}
    </p>
  </div>
);

export default function Dashboard() {
  const dispatch = useDispatch();
  const { stats, list: incidents } = useSelector(state => state.incidents);
  const { user } = useSelector(state => state.auth);
  const [sites, setSites]         = useState([]);
  const [logSummary, setLogSummary] = useState({ info: 0, warning: 0, error: 0, fatal: 0 });
  const [loading, setLoading]     = useState(true);
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
        setUptimeData(Array.from({ length: 12 }, (_, i) => ({
          time: `${i * 2}h`,
          uptime: 95 + Math.random() * 5,
        })));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [dispatch]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const downSites = sites.filter(s => s.status === 'down');
  const avgMttrMin = Math.round(stats.avgMttrSeconds / 60);

  const statCards = [
    { label: 'Active Incidents', value: stats.open,       icon: AlertTriangle,  accent: 'var(--pink)' },
    { label: 'In Progress',      value: stats.inProgress,  icon: Activity,       accent: 'var(--yellow)' },
    { label: 'Sites Monitored',  value: sites.length,      icon: Globe,          accent: 'var(--blue)' },
    { label: 'Resolved Today',   value: stats.resolved,    icon: CheckCircle2,   accent: 'var(--accent)' },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 page-enter">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="page-header flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span
                className="text-xs font-bold uppercase px-2 py-0.5"
                style={{ background: 'var(--accent)', border: '2px solid var(--black)' }}
              >
                // LIVE DASHBOARD
              </span>
            </div>
            <h1 className="page-title">
              {greeting}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="page-subtitle">Infrastructure overview • {new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* ── Critical Banner ─────────────────────────────── */}
        {downSites.length > 0 && (
          <div
            className="mb-6 p-4 flex items-center gap-3 animate-fade-in"
            style={{ background: 'var(--pink)', border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--black)' }}
          >
            <span className="pulse-dot-red" />
            <p className="font-bold text-white text-sm flex-1">
              🚨 {downSites.length} site{downSites.length > 1 ? 's are' : ' is'} currently DOWN:{' '}
              <span className="underline">{downSites.map(s => s.name).join(', ')}</span>
            </p>
            <Link to="/incidents" className="btn-ghost btn-sm" style={{ background: 'var(--cream-2)', color: 'var(--pink)' }}>
              View Incidents →
            </Link>
          </div>
        )}

        {/* ── Stat Cards ──────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(card => (
            <StatCard key={card.label} {...card} loading={loading} />
          ))}
        </div>

        {/* ── Uptime Chart + MTTR ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Uptime Chart */}
          <div className="lg:col-span-2 p-5"
            style={{ background: 'var(--cream-2)', border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--black)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide" style={{ color: 'var(--black)' }}>Uptime Trend</h3>
                <p className="text-xs font-medium" style={{ color: '#666' }}>Last 24 hours</p>
              </div>
              <span className="badge-low">
                Avg: {sites.length > 0 ? (sites.reduce((a, s) => a + s.uptimePercent, 0) / sites.length).toFixed(1) : 100}%
              </span>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={uptimeData}>
                <defs>
                  <linearGradient id="uptimeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[90, 100]} tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--black)', border: '2px solid var(--accent)', borderRadius: 0, fontSize: 12, color: '#fff' }}
                />
                <Area type="monotone" dataKey="uptime" stroke="var(--black)" strokeWidth={2} fill="url(#uptimeGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* MTTR + Log Summary */}
          <div className="space-y-4">
            <div className="p-5 text-center"
              style={{ background: 'var(--cream-2)', border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--black)' }}>
              <Clock size={20} className="mx-auto mb-2" style={{ color: 'var(--blue)' }} />
              <p className="text-4xl font-black" style={{ color: 'var(--black)' }}>
                {avgMttrMin || '—'}
                <span className="text-base font-medium ml-1" style={{ color: '#666' }}>min</span>
              </p>
              <p className="text-xs font-bold uppercase tracking-wide mt-1" style={{ color: '#888' }}>Avg. Time to Resolve</p>
            </div>

            <div className="p-5"
              style={{ background: 'var(--cream-2)', border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--black)' }}>
              <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: 'var(--black)' }}>24H Log Summary</p>
              <div className="space-y-2.5">
                {[
                  ['fatal',   'var(--pink)'],
                  ['error',   '#FF6B00'],
                  ['warning', 'var(--yellow)'],
                  ['info',    'var(--blue)'],
                ].map(([l, c]) => {
                  const total = Object.values(logSummary).reduce((a, b) => a + b, 1);
                  return (
                    <div key={l} className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase w-14" style={{ color: 'var(--black)' }}>{l}</span>
                      <div className="flex-1 h-2" style={{ background: '#ccc', border: '1px solid var(--black)' }}>
                        <div className="h-full" style={{
                          width: `${Math.min(100, (logSummary[l] / total) * 100)}%`,
                          background: c,
                        }} />
                      </div>
                      <span className="text-xs font-black w-5 text-right" style={{ color: 'var(--black)' }}>
                        {logSummary[l]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent Incidents + Site Status ──────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Incidents */}
          <div className="p-5"
            style={{ background: 'var(--cream-2)', border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--black)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-wide" style={{ color: 'var(--black)' }}>Recent Incidents</h3>
              <Link to="/incidents"
                className="text-xs font-bold uppercase flex items-center gap-1"
                style={{ color: 'var(--blue)' }}>
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {incidents.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle2 size={32} className="mx-auto mb-2" style={{ color: 'var(--accent)' }} />
                <p className="text-sm font-bold" style={{ color: 'var(--black)' }}>All clear! No incidents.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {incidents.slice(0, 5).map(inc => (
                  <Link key={inc._id} to={`/incidents/${inc._id}`}
                    className="flex items-center gap-3 p-3 transition-all group"
                    style={{ background: 'var(--cream-2)', border: '2px solid var(--black)', boxShadow: '2px 2px 0 var(--black)' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '4px 4px 0 var(--black)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--black)'; }}
                  >
                    <SeverityBadge s={inc.severity} />
                    <p className="text-sm font-semibold flex-1 truncate" style={{ color: 'var(--black)' }}>{inc.title}</p>
                    <span className="text-xs font-bold uppercase" style={{
                      color: inc.status === 'resolved' ? '#0A8A00' : inc.status === 'in_progress' ? '#8A6A00' : 'var(--pink)',
                    }}>
                      {inc.status.replace('_', ' ')}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Site Status */}
          <div className="p-5"
            style={{ background: 'var(--cream-2)', border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--black)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-wide" style={{ color: 'var(--black)' }}>Site Status</h3>
              <Link to="/sites" className="text-xs font-bold uppercase flex items-center gap-1" style={{ color: 'var(--blue)' }}>
                Manage <ArrowRight size={12} />
              </Link>
            </div>

            {sites.length === 0 ? (
              <div className="text-center py-10">
                <Globe size={32} className="mx-auto mb-2" style={{ color: '#888' }} />
                <p className="text-sm font-bold" style={{ color: 'var(--black)' }}>No sites added yet.</p>
                <Link to="/sites" className="btn-primary btn-sm mt-3 inline-flex">Add your first site</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {sites.slice(0, 6).map(site => (
                  <div key={site._id}
                    className="flex items-center gap-3 p-3"
                    style={{ background: 'var(--cream-2)', border: '2px solid var(--black)' }}
                  >
                    <StatusDot s={site.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: 'var(--black)' }}>{site.name}</p>
                      <p className="text-xs truncate" style={{ color: '#888' }}>{site.url}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-mono font-bold" style={{ color: 'var(--black)' }}>{site.responseTime}ms</p>
                      <p className="text-xs" style={{ color: '#666' }}>{site.uptimePercent}% up</p>
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

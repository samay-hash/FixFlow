import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import {
  LayoutDashboard, Globe, AlertTriangle, FileText,
  Activity, LogOut, Shield, Users
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { path: '/dashboard',   label: 'Dashboard',       icon: LayoutDashboard },
  { path: '/sites',       label: 'Sites',            icon: Globe },
  { path: '/incidents',   label: 'Incidents',        icon: AlertTriangle },
  { path: '/logs',        label: 'Log Explorer',     icon: Activity },
  { path: '/postmortems', label: 'Postmortems',      icon: FileText },
];

export default function Sidebar() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { user, company } = useSelector(state => state.auth);
  const { stats }         = useSelector(state => state.incidents);

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  return (
    <aside
      className="w-64 min-h-screen flex flex-col fixed left-0 top-0 z-40"
      style={{ background: '#EAE4D9', borderRight: '3px solid #0A0A0A' }}
    >
      {/* ── Logo ────────────────────────────────────────────── */}
      <div className="p-5" style={{ borderBottom: '3px solid #0A0A0A' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 flex items-center justify-center font-black text-white text-sm"
            style={{ background: '#0A0A0A', boxShadow: '2px 2px 0 #C8FF00' }}
          >
            <Shield size={18} />
          </div>
          <div>
            <h1 className="text-sm font-extrabold uppercase tracking-widest" style={{ color: '#0A0A0A' }}>
              FixFlow
            </h1>
            <p className="text-xs font-medium truncate max-w-[130px]" style={{ color: '#666' }}>
              {company?.name || '...'}
            </p>
          </div>
        </div>

        {/* Live badge */}
        {stats.open > 0 && (
          <div
            className="mt-3 flex items-center gap-2 px-2.5 py-1.5"
            style={{ background: '#FF2D78', border: '2px solid #0A0A0A', boxShadow: '2px 2px 0 #0A0A0A' }}
          >
            <span className="pulse-dot-red" />
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              {stats.open} INCIDENT{stats.open > 1 ? 'S' : ''} OPEN
            </span>
          </div>
        )}
      </div>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="flex-1 p-3 space-y-1 mt-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = location.pathname.startsWith(path);
          return (
            <Link key={path} to={path} className={clsx(active ? 'nav-item-active' : 'nav-item')}>
              <Icon size={15} />
              <span className="flex-1">{label}</span>
              {path === '/incidents' && stats.open > 0 && (
                <span
                  className="text-xs font-black w-5 h-5 flex items-center justify-center"
                  style={{ background: '#FF2D78', color: 'white', border: '2px solid #0A0A0A' }}
                >
                  {stats.open}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Admin ───────────────────────────────────────────── */}
      {user?.role === 'admin' && (
        <div className="px-3 mb-2">
          <Link to="/team" className="nav-item" style={{ color: '#0050FF' }}>
            <Users size={15} />
            <span>Admin · Team</span>
          </Link>
        </div>
      )}

      {/* ── User ────────────────────────────────────────────── */}
      <div className="p-3" style={{ borderTop: '3px solid #0A0A0A' }}>
        <div className="flex items-center gap-3 p-2">
          <div
            className="w-9 h-9 flex items-center justify-center text-sm font-black flex-shrink-0"
            style={{ background: '#C8FF00', border: '2px solid #0A0A0A', color: '#0A0A0A', boxShadow: '2px 2px 0 #0A0A0A' }}
          >
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate" style={{ color: '#0A0A0A' }}>{user?.name}</p>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#888' }}>{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="transition-colors hover:opacity-70"
            style={{ color: '#FF2D78' }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}

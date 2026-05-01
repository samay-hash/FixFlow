import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import {
  LayoutDashboard, Globe, AlertTriangle, FileText,
  Activity, LogOut, Shield, Bell, ChevronRight, Users
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/sites', label: 'Monitored Sites', icon: Globe },
  { path: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { path: '/logs', label: 'Log Explorer', icon: Activity },
  { path: '/postmortems', label: 'Postmortems', icon: FileText },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, company } = useSelector(state => state.auth);
  const { stats } = useSelector(state => state.incidents);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-dark-800 border-r border-slate-700/50 flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">SIMRS</h1>
            <p className="text-xs text-slate-500 truncate max-w-[140px]">{company?.name || 'Loading...'}</p>
          </div>
        </div>
      </div>

      {/* Active Incidents Alert */}
      {stats.open > 0 && (
        <div className="mx-3 mt-3 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
          <span className="pulse-dot-red" />
          <span className="text-xs text-red-400 font-medium">{stats.open} Active Incident{stats.open > 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 mt-2">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = location.pathname.startsWith(path);
          return (
            <Link key={path} to={path} className={clsx(active ? 'nav-item-active' : 'nav-item')}>
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              {path === '/incidents' && stats.open > 0 && (
                <span className="text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {stats.open}
                </span>
              )}
              {active && <ChevronRight size={14} className="opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Admin Panel Link */}
      {user?.role === 'admin' && (
        <div className="px-3 mb-2">
          <Link to="/team" className="nav-item text-amber-400 hover:text-amber-300">
            <Users size={16} />
            <span>Admin: Team</span>
          </Link>
        </div>
      )}

      {/* User Profile */}
      <div className="p-3 border-t border-slate-700/50">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-700/30 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
          <button onClick={handleLogout} title="Logout" className="text-slate-500 hover:text-red-400 transition-colors">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}

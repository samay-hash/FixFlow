import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Bell, ChevronDown, Clock, Globe, History, LayoutDashboard, LogOut, Search, ShieldAlert, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../hooks/useAuth';
import { useAppSelector } from '../../store/hooks';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Incidents', icon: ShieldAlert, path: '/incidents' },
  { name: 'Monitoring', icon: Activity, path: '/monitoring' },
  { name: 'Logs', icon: History, path: '/logs' },
  { name: 'Postmortems', icon: Globe, path: '/postmortems' },
  { name: 'Team', icon: Users, path: '/team' },
];

const Navbar: React.FC = () => {
  const { logout } = useAuth();
  const { company } = useAppSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 shadow-[0_1px_0_rgba(15,23,42,0.02)] backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="hidden min-w-0 flex-1 items-center gap-4 md:flex">
          <div className="hidden min-w-[150px] lg:block">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Command center</p>
            <p className="mt-0.5 truncate text-[14px] font-black text-[#07111f]">{company?.name || 'Production'}</p>
          </div>
          <div className="relative hidden w-full max-w-md md:block">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search incidents, logs, or documentation..."
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-[14px] font-semibold text-[#07111f] outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
          />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2 md:hidden">
          <span className="truncate text-[14px] font-black text-[#07111f]">{company?.name || 'Production'}</span>
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-black text-slate-600 transition hover:bg-slate-50 lg:inline-flex">
            All Monitors
            <ChevronDown size={17} />
          </button>
          <button className="hidden min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-black text-slate-600 transition hover:bg-slate-50 lg:inline-flex">
            <Clock size={18} />
            Last 24 hours
            <ChevronDown size={17} />
          </button>
          <div className="hidden min-h-11 items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/90 px-3 md:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="max-w-[150px] truncate text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700">
              {company?.name || 'Production'}
            </span>
          </div>
          <button className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-[#07111f]" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500" />
          </button>
          <button
            onClick={logout}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-black text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      <nav className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-[12px] font-black transition',
                isActive ? 'border-orange-100 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-500'
              )
            }
          >
            <item.icon size={15} />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

export default Navbar;

import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Activity, Globe, History, LayoutDashboard, Settings, ShieldAlert, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppSelector } from '../../store/hooks';

const navItems = [
  { name: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Incidents', icon: ShieldAlert, path: '/incidents' },
  { name: 'Monitoring', icon: Activity, path: '/monitoring' },
  { name: 'Log Explorer', icon: History, path: '/logs' },
  { name: 'Postmortems', icon: Globe, path: '/postmortems' },
  { name: 'Team', icon: Users, path: '/team' },
];

const Sidebar: React.FC = () => {
  const { user, company } = useAppSelector((state) => state.auth);

  return (
    <aside className="hidden w-[280px] shrink-0 border-r border-slate-200/60 bg-slate-50/40 backdrop-blur-xl lg:flex lg:flex-col">
      <div className="border-b border-slate-200/50 px-5 py-6">
        <Link to="/dashboard" className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#07111f] shadow-[0_16px_32px_rgba(7,17,31,0.2)] ring-1 ring-white/10">
            <img src="/logo.png" alt="FixFlow" className="h-7 w-7 object-contain" />
          </span>
          <span>
            <span className="block text-[17px] font-black tracking-[-0.04em] text-[#07111f]">FixFlow</span>
            <span className="block max-w-[150px] truncate text-[11px] font-black uppercase tracking-[0.1em] text-slate-400">{company?.name || 'Live Environment'}</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Operations</p>
        <div className="space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'group relative flex min-h-[46px] items-center gap-3 rounded-[14px] px-3 text-[13.5px] font-black transition-all duration-300',
                isActive
                  ? 'bg-[#07111f] text-white shadow-[0_12px_24px_-8px_rgba(7,17,31,0.25)]'
                  : 'text-slate-500 hover:bg-white hover:text-[#07111f] hover:shadow-sm'
              )
            }
          >
            <item.icon className="h-5 w-5" strokeWidth={2.5} />
            {item.name}
          </NavLink>
        ))}
        </div>
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700">Live workspace</span>
          </div>
          <p className="mt-2 text-[12px] font-semibold leading-5 text-emerald-800/80">Monitoring and incident routing are active.</p>
        </div>
        <button className="mb-3 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-[13px] font-black text-slate-500 transition hover:bg-slate-50 hover:text-[#07111f]">
          <Settings size={19} />
          Settings
        </button>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#07111f] text-[13px] font-black text-white">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-black text-[#07111f]">{user?.name || 'User'}</p>
            <p className="truncate text-[11px] font-bold capitalize text-slate-500">{user?.role || 'member'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

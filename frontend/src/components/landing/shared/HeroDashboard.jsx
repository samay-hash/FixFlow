import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Home, PlusCircle, ClipboardList, Users, Route, Settings, ChevronDown, Clock, AlertTriangle, Send, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { ACCENT } from '../constants';
import { SparkLine } from './UIAtoms';

export function HeroDashboard() {
  const statCards = [
    { label: 'Monitored Services', value: '12', delta: '+ 2 vs yesterday', tone: 'text-emerald-600' },
    { label: 'Incidents', value: '1', delta: '1 vs yesterday', tone: 'text-red-500', warning: true },
    { label: 'Avg. Response Time', value: '124 ms', delta: '+ 18%', tone: 'text-emerald-600', graph: true },
    { label: 'Uptime', value: '99.99%', delta: '+ 0.12%', tone: 'text-emerald-600' },
  ];

  const services = [
    ['api.mypop.co', 'Up', '100%', '#22c55e'],
    ['dashboard.mypop.co', 'Down', '21.4%', '#ff1d3d'],
    ['docs.mypop.co', 'Degraded', '98.1%', '#fb923c'],
    ['www.mypop.co', 'Up', '100%', '#22c55e'],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 34, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 mx-auto w-full max-w-[980px]"
    >
      <div className="absolute -bottom-12 left-1/2 h-[92px] w-[108%] -translate-x-1/2 rounded-[999px] border border-orange-200/70 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.96)_0%,rgba(255,147,83,0.35)_36%,rgba(255,79,10,0.08)_60%,transparent_72%)] blur-[1px]" />
      <div className="absolute -bottom-20 left-1/2 h-[92px] w-[88%] -translate-x-1/2 rounded-[999px] bg-orange-300/20 blur-3xl" />

      <div className="relative overflow-hidden rounded-[26px] border border-slate-200/90 bg-white/94 p-4 text-left shadow-[0_34px_90px_rgba(80,55,40,0.18)] backdrop-blur-xl sm:p-5">
        <div className="grid min-h-[382px] grid-cols-[50px_1fr] gap-4 md:grid-cols-[62px_1fr]">
          <aside className="flex flex-col items-center gap-4 border-r border-slate-100 pr-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#07111f] text-white">
              <Shield size={17} color={ACCENT} />
            </div>
            {[
              { icon: Home, active: true },
              { icon: PlusCircle },
              { icon: ClipboardList },
              { icon: Users },
              { icon: Route },
              { icon: Settings },
            ].map(({ icon: Icon, active }) => (
              <span
                key={Icon.displayName || Icon.name}
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? 'bg-orange-50 text-orange-500 shadow-sm' : 'text-slate-500'}`}
              >
                <Icon size={17} strokeWidth={2.2} />
              </span>
            ))}
          </aside>

          <div className="min-w-0">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-[18px] font-extrabold tracking-[-0.02em] text-[#07111f]">Overview</h3>
              <div className="flex gap-2">
                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 shadow-sm">
                  All Monitors <ChevronDown size={13} />
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 shadow-sm">
                  <Clock size={13} /> Last 24 hours <ChevronDown size={13} />
                </button>
              </div>
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-4">
              {statCards.map((card) => (
                <div key={card.label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                  <p className="mb-2 text-[10px] font-bold text-slate-500">{card.label}</p>
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <p className="text-[22px] font-black tracking-[-0.03em] text-[#07111f]">{card.value}</p>
                      <p className={`mt-1 text-[10px] font-bold ${card.warning ? 'text-red-500' : card.tone}`}>{card.warning ? '1 vs yesterday' : card.delta}</p>
                    </div>
                    {card.graph && <SparkLine className="h-9 w-20" />}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.05fr_1fr_0.78fr]">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                <h4 className="mb-4 text-[13px] font-extrabold text-[#07111f]">Monitored Services</h4>
                <div className="mb-2 grid grid-cols-[1.3fr_0.65fr_0.55fr_0.8fr] text-[9px] font-bold text-slate-400">
                  <span>Service</span>
                  <span>Status</span>
                  <span>Uptime</span>
                  <span>Trend</span>
                </div>
                <div className="space-y-3">
                  {services.map(([service, status, uptime, color]) => (
                    <div key={service} className="grid grid-cols-[1.3fr_0.65fr_0.55fr_0.8fr] items-center text-[10px]">
                      <span className="flex min-w-0 items-center gap-2 font-semibold text-slate-700">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                        <span className="truncate">{service}</span>
                      </span>
                      <span className={`font-bold ${status === 'Down' ? 'text-red-500' : status === 'Degraded' ? 'text-orange-500' : 'text-emerald-600'}`}>+ {status}</span>
                      <span className="font-semibold text-slate-500">{uptime}</span>
                      <SparkLine className="h-5 w-11" color={status === 'Down' ? '#ff1d3d' : status === 'Degraded' ? '#fb923c' : '#22c55e'} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                <h4 className="mb-4 text-[13px] font-extrabold text-[#07111f]">Incident Timeline</h4>
                {[
                  { icon: AlertTriangle, title: 'Incident triggered', desc: 'dashboard.mypop.co returned 500', time: '10:21 AM', color: 'text-red-500', bg: 'bg-red-50' },
                  { icon: Send, title: 'Alert sent to @incidents', desc: 'Slack notification', time: '10:21 AM', color: 'text-violet-500', bg: 'bg-violet-50' },
                  { icon: Sparkles, title: 'AI diagnosis started', desc: 'Analyzing logs and metrics', time: '10:22 AM', color: 'text-blue-500', bg: 'bg-blue-50' },
                  { icon: ShieldCheck, title: 'Investigation in progress', desc: 'Auto-collecting relevant data', time: '10:23 AM', color: 'text-slate-500', bg: 'bg-slate-50' },
                ].map((item) => (
                  <div key={item.title} className="mb-4 grid grid-cols-[28px_1fr_auto] gap-3 last:mb-0">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full ${item.bg} ${item.color}`}>
                      <item.icon size={14} />
                    </span>
                    <span>
                      <span className="block text-[11px] font-extrabold text-[#07111f]">{item.title}</span>
                      <span className="block text-[10px] font-semibold text-slate-500">{item.desc}</span>
                    </span>
                    <span className="text-[9px] font-bold text-slate-500">{item.time}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                <div className="mb-5 flex items-center gap-2">
                  <h4 className="text-[13px] font-extrabold text-[#07111f]">AI Analysis</h4>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-500">Beta</span>
                </div>
                <p className="mb-2 text-[12px] font-extrabold text-[#07111f]">Root cause identified</p>
                <p className="mb-5 text-[11px] font-medium leading-relaxed text-slate-500">
                  Database connection timeout on user-service causing 500 errors.
                </p>
                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-extrabold text-slate-700 shadow-sm">
                  View full analysis <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

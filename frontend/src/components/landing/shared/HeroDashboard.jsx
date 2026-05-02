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
      className="relative z-10 mx-auto w-full max-w-[920px] 2xl:max-w-[940px]"
    >
      <img
        src="/hero/ring.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[82px] left-1/2 z-0 hidden w-[1160px] max-w-none -translate-x-1/2 select-none opacity-100 2xl:block"
      />
      <div className="pointer-events-none absolute -bottom-[46px] left-1/2 z-[1] hidden h-[76px] w-[101%] -translate-x-1/2 rounded-[999px] border-t border-orange-100/90 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.72)_0%,rgba(255,207,176,0.34)_42%,rgba(255,95,32,0.11)_66%,transparent_78%)] shadow-[0_22px_72px_rgba(255,119,64,0.24)] 2xl:block" />
      <div className="pointer-events-none absolute -bottom-[74px] left-1/2 z-0 h-28 w-[88%] -translate-x-1/2 rounded-[999px] bg-orange-300/24 blur-3xl" />

      <div className="relative z-20 overflow-hidden rounded-[24px] border border-slate-200/90 bg-white/95 p-4 text-left shadow-[0_34px_90px_rgba(68,49,35,0.16)] backdrop-blur-xl sm:p-5 2xl:p-6">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.9)_52%,rgba(255,247,239,0.78)_100%)]" />
        <div className="relative grid min-h-[430px] grid-cols-[54px_1fr] gap-5 md:grid-cols-[64px_1fr] 2xl:min-h-[462px] 2xl:gap-6">
          <aside className="flex flex-col items-center gap-4 border-r border-slate-100/90 pr-4">
            <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-[13px] bg-[#07111f] text-white shadow-[0_10px_22px_rgba(7,17,31,0.14)]">
              <Shield size={18} color={ACCENT} />
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
                className={`flex h-9 w-9 items-center justify-center rounded-[13px] transition ${active ? 'bg-orange-50 text-orange-500 shadow-[0_8px_18px_rgba(255,95,32,0.1)]' : 'text-slate-500/90'}`}
              >
                <Icon size={17} strokeWidth={2.25} />
              </span>
            ))}
          </aside>

          <div className="min-w-0">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-[19px] font-extrabold tracking-[-0.025em] text-[#07111f]">Overview</h3>
              <div className="flex gap-2.5">
                <button className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-4 py-2 text-[11px] font-extrabold text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.045)]">
                  All Monitors <ChevronDown size={13} />
                </button>
                <button className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-4 py-2 text-[11px] font-extrabold text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.045)]">
                  <Clock size={13} /> Last 24 hours <ChevronDown size={13} />
                </button>
              </div>
            </div>

            <div className="mb-5 grid gap-3.5 md:grid-cols-4">
              {statCards.map((card) => (
                <div key={card.label} className="min-h-[118px] rounded-2xl border border-slate-200/80 bg-white/95 p-[18px] shadow-[0_14px_34px_rgba(15,23,42,0.045)]">
                  <p className="mb-3 text-[10px] font-extrabold text-slate-500">{card.label}</p>
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="whitespace-nowrap text-[25px] font-black tracking-[-0.035em] text-[#07111f]">{card.value}</p>
                      <p className={`mt-2 text-[10px] font-extrabold ${card.warning ? 'text-red-500' : card.tone}`}>{card.warning ? '1 vs yesterday' : card.delta}</p>
                    </div>
                    {card.graph && <SparkLine className="h-9 w-20" />}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-[18px] lg:grid-cols-[1.06fr_1.04fr_0.86fr]">
              <div className="min-h-[238px] rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.045)]">
                <h4 className="mb-5 text-[13px] font-extrabold text-[#07111f]">Monitored Services</h4>
                <div className="mb-3 grid grid-cols-[1.35fr_0.62fr_0.54fr_0.72fr] text-[9px] font-extrabold text-slate-400">
                  <span>Service</span>
                  <span>Status</span>
                  <span>Uptime</span>
                  <span>Trend</span>
                </div>
                <div className="space-y-3">
                  {services.map(([service, status, uptime, color]) => (
                    <div key={service} className="grid grid-cols-[1.35fr_0.62fr_0.54fr_0.72fr] items-center text-[10px]">
                      <span className="flex min-w-0 items-center gap-2 font-bold text-slate-700">
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

              <div className="min-h-[238px] rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.045)]">
                <h4 className="mb-5 text-[13px] font-extrabold text-[#07111f]">Incident Timeline</h4>
                {[
                  { icon: AlertTriangle, title: 'Incident triggered', desc: 'dashboard.mypop.co returned 500', time: '10:21 AM', color: 'text-red-500', bg: 'bg-red-50' },
                  { icon: Send, title: 'Alert sent to @incidents', desc: 'Slack notification', time: '10:21 AM', color: 'text-violet-500', bg: 'bg-violet-50' },
                  { icon: Sparkles, title: 'AI diagnosis started', desc: 'Analyzing logs and metrics', time: '10:22 AM', color: 'text-blue-500', bg: 'bg-blue-50' },
                  { icon: ShieldCheck, title: 'Investigation in progress', desc: 'Auto-collecting relevant data', time: '10:23 AM', color: 'text-slate-500', bg: 'bg-slate-50' },
                ].map((item) => (
                  <div key={item.title} className="mb-3.5 grid grid-cols-[30px_1fr_auto] gap-3 last:mb-0">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full ${item.bg} ${item.color}`}>
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

              <div className="min-h-[238px] rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.045)]">
                <div className="mb-5 flex items-center gap-2">
                  <h4 className="text-[13px] font-extrabold text-[#07111f]">AI Analysis</h4>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-500">Beta</span>
                </div>
                <p className="mb-3 text-[12px] font-extrabold text-[#07111f]">Root cause identified</p>
                <p className="mb-5 text-[11px] font-semibold leading-relaxed text-slate-500">
                  Database connection timeout on user-service causing 500 errors.
                </p>
                <button className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-extrabold text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.045)]">
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

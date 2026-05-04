import { Link } from 'react-router-dom';
import { Activity, Bell, CheckCircle2, Clock, ShieldAlert, Sparkles, TimerReset, Zap } from 'lucide-react';
import type { ReactNode } from 'react';

interface AuthPageShellProps {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  secondaryCopy: string;
  secondaryHref: string;
  secondaryAction: string;
  children: ReactNode;
}

const signals = [
  { label: 'API monitor', value: 'Healthy', color: 'text-emerald-600', icon: Activity },
  { label: 'Alert route', value: 'Slack ready', color: 'text-orange-500', icon: Bell },
  { label: 'AI summary', value: 'Drafted', color: 'text-violet-500', icon: Sparkles },
];

export function AuthPageShell({
  eyebrow,
  title,
  accent,
  description,
  secondaryCopy,
  secondaryHref,
  secondaryAction,
  children,
}: AuthPageShellProps) {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#fffaf5] px-4 py-4 text-[#07111f] sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(255,79,10,0.16),transparent_26%),radial-gradient(circle_at_86%_24%,rgba(124,58,237,0.1),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(34,197,94,0.08),transparent_28%),linear-gradient(180deg,#fff7ee_0%,#fffdf9_42%,#fffaf5_100%)]" />
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle,rgba(7,17,31,0.08)_1px,transparent_1px)] [background-size:30px_30px] opacity-[0.16]" />
      <div className="pointer-events-none absolute inset-x-4 top-[88px] h-px bg-gradient-to-r from-transparent via-orange-200/80 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-32px)] w-full max-w-[1180px] flex-col">
        <header className="flex items-center justify-between gap-4">
          <Link to="/" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#07111f] text-[#ff4f0a] shadow-[0_10px_22px_rgba(7,17,31,0.14)]">
              <Zap size={19} fill="currentColor" />
            </span>
            <span className="text-[24px] font-extrabold leading-none tracking-[-0.04em] text-[#07111f]">
              FixFlow <span className="text-[#ff4f0a]">AI</span>
            </span>
          </Link>
          <Link
            to={secondaryHref}
            className="rounded-xl border border-slate-200 bg-white/88 px-4 py-2.5 text-[13px] font-black text-[#07111f] shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-4 focus:ring-orange-200"
          >
            {secondaryAction}
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-6 py-5 lg:grid-cols-[minmax(0,0.82fr)_minmax(430px,0.9fr)] lg:gap-8 lg:py-6">
          <div className="mx-auto w-full max-w-[500px] lg:mx-0">
            <div className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-full border border-orange-100 bg-white/80 px-4 text-[11px] font-black uppercase tracking-[0.18em] text-orange-600 shadow-[0_10px_28px_rgba(255,79,10,0.08)]">
              <ShieldAlert size={16} />
              {eyebrow}
            </div>

            <h1 className="font-serif text-[44px] leading-[0.92] tracking-[-0.055em] text-[#07111f] sm:text-[58px] xl:text-[64px]">
              <span className="block">{title}</span>
              <span className="block text-[#ff4f0a]">{accent}</span>
            </h1>
            <p className="mt-5 max-w-[470px] text-[15px] font-semibold leading-7 text-slate-500 sm:text-[16px]">
              {description}
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {['60s checks', 'AI summaries', 'Status pages'].map((item) => (
                <span key={item} className="rounded-full border border-slate-200 bg-white/78 px-3 py-1.5 text-[11px] font-black text-slate-500 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
                  {item}
                </span>
              ))}
            </div>

            <div className="relative mt-6 hidden lg:block">
              <div className="absolute -inset-7 rounded-[42px] bg-orange-200/28 blur-3xl" />
              <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 p-4 shadow-[0_26px_70px_rgba(68,49,35,0.13)]">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,247,239,0.78))]" />
                <div className="relative">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Command status</p>
                      <h2 className="mt-1 text-[21px] font-black tracking-[-0.04em] text-[#07111f]">Workspace ready</h2>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-[#ff4f0a]">
                      <CheckCircle2 size={20} />
                    </span>
                  </div>

                  <div className="grid gap-2.5">
                    {signals.map(({ label, value, color, icon: Icon }) => (
                      <div key={label} className="flex min-h-[58px] items-center justify-between rounded-2xl border border-slate-200 bg-white px-3.5 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.045)]">
                        <div className="flex items-center gap-3">
                          <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 ${color}`}>
                            <Icon size={18} />
                          </span>
                          <div>
                            <p className="text-[13px] font-black text-[#07111f]">{label}</p>
                            <p className="text-[12px] font-bold text-slate-400">{value}</p>
                          </div>
                        </div>
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 rounded-2xl bg-[#07111f] p-4 text-white">
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-200">
                      <Clock size={14} />
                      next incident drill
                    </div>
                    <p className="text-[13px] font-semibold leading-5 text-slate-200">
                      Invite responders, connect monitors, and keep the team aligned before the next alert fires.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[560px]">
            <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-orange-100 bg-white/76 px-4 py-3 shadow-[0_12px_26px_rgba(68,49,35,0.07)] backdrop-blur">
              <span className="flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.14em] text-slate-500">
                <TimerReset size={15} className="text-[#ff4f0a]" />
                Fast setup
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-600">No card required</span>
            </div>
            <div className="relative rounded-[28px] border border-slate-200/90 bg-white/95 p-2.5 shadow-[0_30px_80px_rgba(68,49,35,0.15)] backdrop-blur">
              <div className="pointer-events-none absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
              {children}
            </div>

            <p className="mt-4 text-center text-[14px] font-bold text-slate-500">
              {secondaryCopy}{' '}
              <Link to={secondaryHref} className="text-[#ff4f0a] underline decoration-orange-200 underline-offset-4">
                {secondaryAction}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

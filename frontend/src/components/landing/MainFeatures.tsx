import { Check } from 'lucide-react';
import { StatusDot, AvatarGroup, SmallBars } from './shared/UIAtoms';
import { FEATURE_CARDS } from './constants';

interface FeaturePreviewProps {
  index: number;
}

function FeaturePreview({ index }: FeaturePreviewProps) {
  if (index === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-5 flex items-center gap-2 text-[12px] font-extrabold text-[#07111f]">
          <span># incident-war-room</span>
          <div className="ml-auto flex items-center gap-1 text-[11px] text-emerald-600"><StatusDot /> Live</div>
        </div>
        {[
          ['10:21 AM', 'Incident triggered', 'Payments API latency spike'],
          ['10:22 AM', 'Maya acknowledged', 'Investigating the root cause'],
          ['10:23 AM', 'Arjun joined', 'Looking into database metrics'],
        ].map(([time, title, desc]) => (
          <div key={time} className="mb-4 grid grid-cols-[70px_1fr] gap-3 text-[11px]">
            <span className="font-semibold text-slate-400">{time}</span>
            <span>
              <span className="block font-extrabold text-slate-700">{title}</span>
              <span className="font-medium text-slate-500">{desc}</span>
            </span>
          </div>
        ))}
        <AvatarGroup />
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[12px] font-extrabold text-[#07111f]">Suspected change</span>
          <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-black text-red-500">High confidence</span>
        </div>
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-[12px] font-extrabold text-[#07111f]">
            <img src="/logos/github.svg" alt="GitHub" className="h-4.5 w-4.5" /> GitHub Deploy
          </div>
          <div className="text-[11px] font-semibold text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-0.5">main</span> <span className="ml-2">a1b2c3d</span>
          </div>
          <p className="mt-1 text-[10px] font-semibold text-slate-400">Deployed 10:16 AM - by joe</p>
        </div>
        <p className="mb-3 text-[12px] font-extrabold text-[#07111f]">Changes in this deploy</p>
        {[
          ['payments/handler.py', '+23', 'text-emerald-600'],
          ['database/queries.sql', '-8', 'text-red-500'],
        ].map(([file, change, tone]) => (
          <div key={file} className="flex items-center justify-between border-t border-slate-100 py-3 text-[11px]">
            <span className="font-semibold text-slate-500">{file}</span>
            <span className={`font-black ${tone}`}>{change}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-5 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white"><Check size={14} /></span>
        <span className="text-[12px] font-extrabold text-[#07111f]">All systems operational</span>
        <span className="ml-auto text-[10px] font-bold text-slate-400">Updated 2m ago</span>
      </div>
      {[
        ['Payments API', 'Degraded performance', 'degraded'],
        ['Web App', 'Operational', 'up'],
        ['Auth Service', 'Operational', 'up'],
      ].map(([service, status, tone]) => (
        <div key={service} className="flex items-center justify-between border-t border-slate-100 py-3">
          <span>
            <span className="block text-[12px] font-extrabold text-[#07111f]">{service}</span>
            <span className={`text-[10px] font-black ${tone === 'up' ? 'text-emerald-600' : 'text-orange-500'}`}>{status}</span>
          </span>
          <SmallBars status={tone as any} />
        </div>
      ))}
      <div className="mt-4 flex items-center justify-between text-[11px]">
        <span><span className="block font-bold text-slate-400">Page views</span><strong className="text-[20px] text-[#07111f]">1.2K</strong></span>
        <span><span className="block font-bold text-slate-400">Subscribers</span><strong className="text-[20px] text-[#07111f]">342</strong></span>
        <button className="rounded-xl border border-slate-200 px-3 py-2 font-extrabold text-slate-700">View status page</button>
      </div>
    </div>
  );
}

export function MainFeatures() {
  return (
    <section id="product" className="relative bg-transparent px-6 py-24 scroll-mt-24">
      <div className="absolute right-8 top-4 hidden h-60 w-60 opacity-40 md:block" style={{ backgroundImage: 'radial-gradient(#ffb17d 1px, transparent 1px)', backgroundSize: '13px 13px' }} />
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-12 text-center font-serif text-[44px] leading-[1.02] tracking-[-0.05em] text-[#07111f] md:text-[60px]">
          Everything your team needs<br />
          <span className="text-[#ff4f0a]">between detection and resolution.</span>
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {FEATURE_CARDS.map((item, index) => {
            const { icon: Icon, tint, title, desc } = item;
            return (
              <div key={title} className="rounded-[26px] border border-slate-200 bg-white/84 p-6 text-left shadow-[0_22px_62px_rgba(80,55,40,0.08)] backdrop-blur md:p-8">
                <span className={`mb-8 flex h-12 w-12 items-center justify-center rounded-2xl ${tint}`}>
                  {(item as any).logo ? (
                    <img src={(item as any).logo} alt={title} className="h-6 w-6 object-contain" />
                  ) : (
                    <Icon size={22} />
                  )}
                </span>
                <h3 className="mb-4 text-[21px] font-black tracking-[-0.025em] text-[#07111f]">{title}</h3>
                <p className="text-[15px] font-semibold leading-7 text-slate-500">{desc}</p>
                <FeaturePreview index={index} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

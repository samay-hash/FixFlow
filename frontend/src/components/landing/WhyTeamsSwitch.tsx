import { Zap, Sparkles, MessageSquare } from 'lucide-react';

export function WhyTeamsSwitch() {
  return (
    <section className="relative bg-transparent px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-12 text-center font-serif text-[40px] leading-[1.05] tracking-[-0.05em] text-[#07111f] md:text-[52px]">
          Why teams switch to <span className="text-[#ff4f0a]">FixFlow.</span>
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: Zap, title: 'Faster incident response', desc: 'Resolve issues sooner with context-rich alerts.', stat: '-32%', label: 'MTTR improvement', tint: 'bg-orange-50 text-orange-500' },
            { icon: Sparkles, title: 'Less manual work', desc: 'AI summaries and postmortems reduce repetitive work.', stat: '-45%', label: 'Manual effort', tint: 'bg-violet-50 text-violet-500', statTone: 'text-violet-600' },
            { icon: MessageSquare, title: 'Clearer communication', desc: 'Status updates and shared timelines keep everyone aligned.', stat: '+68%', label: 'Stakeholder satisfaction', tint: 'bg-blue-50 text-blue-500', statTone: 'text-blue-600' },
          ].map(({ icon: Icon, title, desc, stat, label, tint, statTone = 'text-[#ff4f0a]' }) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_16px_44px_rgba(80,55,40,0.06)]">
              <span className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${tint}`}><Icon size={24} /></span>
              <h3 className="text-[17px] font-black text-[#07111f]">{title}</h3>
              <p className="mt-2 text-[14px] font-semibold leading-6 text-slate-500">{desc}</p>
              <strong className={`mt-7 block text-[35px] tracking-[-0.04em] ${statTone}`}>{stat}</strong>
              <p className="text-[13px] font-bold text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

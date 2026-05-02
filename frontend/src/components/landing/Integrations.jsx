import React from 'react';
import { GitBranch, Mail, Webhook, Code2 } from 'lucide-react';

export function Integrations() {
  return (
    <section id="integrations" className="bg-[#fffaf5] px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-center gap-8">
          <span className="h-px flex-1 bg-slate-200" />
          <h2 className="text-center font-serif text-[34px] tracking-[-0.04em] text-[#07111f] md:text-[42px]">Works with the tools already in your stack.</h2>
          <span className="h-px flex-1 bg-slate-200" />
        </div>
        <div className="flex flex-wrap justify-center gap-5">
          {[
            { label: 'GitHub', icon: GitBranch },
            { label: 'Slack', text: 'SL' },
            { label: 'Email', icon: Mail },
            { label: 'PagerDuty', text: 'pd', tone: 'text-emerald-600' },
            { label: 'Webhooks', icon: Webhook },
            { label: 'API', icon: Code2 },
            { label: '+40 more' },
          ].map(({ label, icon: Icon, text, tone }) => (
            <span key={label} className="flex h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 text-[15px] font-black text-[#07111f] shadow-[0_12px_30px_rgba(80,55,40,0.05)]">
              {Icon && <Icon size={23} />}
              {text && <span className={`text-[22px] ${tone || 'text-[#4a154b]'}`}>{text}</span>}
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import { GitBranch, Mail, Webhook, Activity, AlertTriangle, BarChart3, Bell, Sparkles } from 'lucide-react';
import { AlertLogos, TrendPreview, IncidentPreview, UptimePreview, DeployPreview, SummaryPreview } from './shared/Previews';

const PRODUCT_FEATURES = [
  {
    title: 'Uptime Monitoring',
    desc: 'Monitor HTTP(s), keywords, and APIs every 60 seconds.',
    icon: Activity,
    preview: <TrendPreview color="#22c55e" />,
  },
  {
    title: 'Auto-created Incidents',
    desc: 'Automatically create incidents with full context and severity based on real-time alerts.',
    icon: AlertTriangle,
    preview: <IncidentPreview />,
  },
  {
    title: 'Realtime Dashboard',
    desc: 'See system health, incidents, and response times in real time.',
    icon: BarChart3,
    preview: <UptimePreview />,
  },
  {
    title: 'Alerting & Escalations',
    desc: 'Smart alert routing via Slack, email, PagerDuty, and more.',
    icon: Bell,
    preview: <AlertLogos compact />,
  },
  {
    title: 'Deploy Context',
    desc: 'Link incidents to deploys and see exactly what changed.',
    icon: GitBranch,
    preview: <DeployPreview />,
  },
  {
    title: 'AI Incident Summaries',
    desc: 'Get AI-powered root cause analysis and postmortems.',
    icon: Sparkles,
    preview: <SummaryPreview />,
  },
];

export function ProductFeatures() {
  return (
    <section className="bg-[#fffaf5] px-6 ">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-6 text-center text-[22px] font-semibold font-black tracking-[-0.03em] text-[#07111f]">Everything you need to ship reliable software</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PRODUCT_FEATURES.map(({ title, desc, icon: Icon, preview }) => (
            <div key={title} className="grid min-h-[116px] grid-cols-[1fr_auto] items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(80,55,40,0.05)]">
              <div>
                <div className="mb-2 flex items-center gap-2 text-[14px] font-black text-[#07111f]">
                  <Icon size={17} className="text-[#ff4f0a]" />
                  {title}
                </div>
                <p className="max-w-[260px] text-[12px] font-semibold leading-5 text-slate-500">{desc}</p>
              </div>
              <div className="hidden sm:block">{preview}</div>
            </div>
          ))}
        </div>
        <h3 className="mt-9 text-center font-semibold text-[17px] font-black text-[#07111f]">Connect your stack. Close the loop.</h3>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-5">
          {[
            { label: 'GitHub', icon: GitBranch },
            { label: 'Slack', text: 'SL' },
            { label: 'Email', icon: Mail },
            { label: 'PagerDuty', text: 'pd', tone: 'text-emerald-600' },
            { label: 'Webhooks', icon: Webhook },
            { label: '+40 more' },
          ].map(({ label, icon: Icon, text, tone }) => (
            <span key={label} className="flex h-14 min-w-14 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-[14px] font-black text-[#07111f] shadow-[0_12px_28px_rgba(80,55,40,0.06)]">
              {Icon && <Icon size={23} />}
              {text && <span className={`text-[22px] ${tone || 'text-[#4a154b]'}`}>{text}</span>}
              <span className={label === '+40 more' ? 'text-slate-600' : 'sr-only'}>{label}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

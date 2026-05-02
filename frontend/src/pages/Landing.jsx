import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Zap,
  Globe,
  FileText,
  Activity,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Clock,
  Bell,
  GitBranch,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { motion } from 'framer-motion';

const PRODUCT_FEATURES = [
  { title: 'Uptime Monitoring', desc: 'Monitor HTTP(s), keywords, and APIs every 60 seconds.', icon: Activity },
  { title: 'Auto-created Incidents', desc: 'Automatically create incidents with full context and severity based on real-time alerts.', icon: AlertTriangle },
  { title: 'Realtime Dashboard', desc: 'See system health, incidents, and response times in real time.', icon: Activity },
  { title: 'Alerting & Escalations', desc: 'Smart alert routing via Slack, email, PagerDuty, and more.', icon: Bell },
  { title: 'Deploy Context', desc: 'Link incidents to deploys and see exactly what changed.', icon: GitBranch },
  { title: 'AI Incident Summaries', desc: 'Get AI-powered root cause analysis and postmortems.', icon: Sparkles },
];

const HERO_CHIPS = [
  { icon: Clock, label: '60s checks', color: 'text-green-500' },
  { icon: Bell, label: 'Realtime alerts', color: 'text-orange-500' },
  { icon: GitBranch, label: 'Deploy context', color: 'text-purple-500' },
  { icon: Sparkles, label: 'AI summaries', color: 'text-rose-500' },
  { icon: FileText, label: 'Postmortems', color: 'text-blue-500' },
];

const LIFECYCLE = [
  {
    id: 'Detect',
    icon: Activity,
    color: 'text-green-500',
    bg: 'bg-green-50',
    desc: 'Continuous checks catch issues the moment they start.',
  },
  {
    id: 'Alert',
    icon: Bell,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    desc: 'Smart alerts with context reduce noise and pinpoint what matters.',
  },
  {
    id: 'Investigate',
    icon: Globe,
    color: 'text-violet-500',
    bg: 'bg-violet-50',
    desc: 'AI and telemetry correlate signals to surface the root cause.',
  },
  {
    id: 'Resolve',
    icon: Zap,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    desc: 'Link deploys, commits, and changes to fix faster with confidence.',
  },
  {
    id: 'Learn',
    icon: Sparkles,
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    desc: 'AI summaries and postmortems help your team improve every time.',
  },
];

const PRICING = [
  { plan: 'Starter', price: '$0', features: ['Up to 3 integrations', '7-day event history', 'Basic incident alerts', 'Community support'] },
  { plan: 'Pro', price: '$19', features: ['Unlimited integrations', '30-day event history', 'Advanced incident alerts', 'Priority email support'] },
  { plan: 'Team', price: '$49', features: ['Unlimited everything', '90-day event history', 'Status pages & analytics', 'SAML SSO & audit logs'], popular: true },
  { plan: 'Enterprise', price: 'Custom', features: ['Advanced security & SSO', 'Custom data retention', 'Dedicated success manager', '99.9% uptime SLA'] },
];

export default function Landing() {
  const accent = '#FF5A0A';

  return (
    <div
      className="relative min-h-screen bg-[#FEF9F3] text-slate-900 overflow-x-clip"
      style={{ fontFamily: '"Inter", sans-serif' }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(#f5c9a8 1.1px, transparent 1.1px)',
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(circle at 50% 25%, black 30%, transparent 82%)',
          }}
        />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-slate-200/40 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-6">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F172A] shadow-lg transition-transform group-hover:scale-105">
                <Shield size={18} color={accent} strokeWidth={2.5} />
              </div>
              <span className="text-[24px] font-bold tracking-tight leading-none text-slate-900">
                FixFlow <span style={{ color: accent }}>AI</span>
              </span>
            </Link>
          </div>

          <div className="hidden items-center gap-9 lg:flex absolute left-1/2 -translate-x-1/2">
            {['Product', 'Solutions', 'Integrations', 'Docs', 'Pricing'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="flex items-center gap-1 text-[15px] font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                {item}
                {(item === 'Product' || item === 'Solutions') && <ChevronDown size={14} className="opacity-40" />}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-[15px] font-semibold text-slate-600 hover:text-slate-900">
              Sign in
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-2 rounded-full px-6 py-2.5 text-[15px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ 
                backgroundColor: accent,
                boxShadow: `0 8px 16px -4px ${accent}40`
              }}
            >
              Start free <ArrowRight size={14} strokeWidth={3} />
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative min-h-[110vh] px-6 pt-32 pb-20 overflow-hidden flex flex-col items-center">
        {/* Background Patterns */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[#FFFDFC]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FFF3E8] via-[#FFFDFC] to-[#FFFDFC]" />
          
          {/* Decorative Dotted Corners */}
          <div className="absolute top-0 left-0 w-64 h-64 opacity-20" style={{ backgroundImage: 'radial-gradient(#FF5A1F 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute bottom-0 right-0 w-64 h-64 opacity-20" style={{ backgroundImage: 'radial-gradient(#FF5A1F 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          
          {/* Subtle Glows */}
          <div className="absolute top-[20%] left-[-10%] w-[50%] h-[60%] blur-[140px] rounded-full bg-[#FFE2C2]/30" />
          <div className="absolute top-[10%] right-[-10%] w-[40%] h-[50%] blur-[140px] rounded-full bg-orange-50/20" />
          
          {/* Curved Line Decorations (Simulated with SVGs or Ring) */}
          <img src="/hero/ring.png" alt="" className="absolute -left-[30%] top-[10%] w-[80%] opacity-[0.03] rotate-12" />
          <img src="/hero/ring.png" alt="" className="absolute -right-[30%] bottom-[10%] w-[80%] opacity-[0.03] -rotate-12" />
        </div>

        <div className="mx-auto max-w-7xl text-center relative z-10 w-full flex flex-col items-center">
          {/* Status Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 inline-flex items-center gap-2.5 rounded-full border border-orange-100 bg-white/80 backdrop-blur-sm px-4 py-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
          >
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </div>
            <span className="text-[13px] font-semibold tracking-wide text-slate-600 uppercase">Live monitoring active</span>
            <Activity size={13} className="text-orange-500 animate-pulse" />
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mb-6 max-w-[900px] text-[48px] md:text-[76px] leading-[0.98] tracking-[-0.04em] font-bold"
            style={{ fontFamily: '"Instrument Serif", serif' }}
          >
            <span className="block text-slate-900">Stay ahead of incidents.</span>
            <span className="block" style={{ color: accent }}>
              Fix issues before customers notice.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="mx-auto mb-10 max-w-[580px] text-[18px] md:text-[20px] leading-relaxed text-slate-500 font-medium"
          >
            AI-powered monitoring, incident response, and postmortems that help engineering teams move fast and stay reliable.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-14 flex flex-wrap items-center justify-center gap-5"
          >
            <Link
              to="/register"
              className="flex items-center gap-2 rounded-2xl px-10 py-4 text-[17px] font-bold text-white transition-all hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
              style={{ 
                backgroundColor: accent,
                boxShadow: `0 20px 40px -10px ${accent}40`
              }}
            >
              Start free <ArrowRight size={18} strokeWidth={3} />
            </Link>
            <Link 
              to="/demo" 
              className="rounded-2xl border border-slate-200 bg-white px-10 py-4 text-[17px] font-bold text-slate-800 transition-all hover:bg-slate-50 hover:border-slate-300"
            >
              Book a demo
            </Link>
          </motion.div>

          {/* Feature Pills */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1, delayChildren: 0.4 }
              }
            }}
            className="mb-20 flex flex-wrap items-center justify-center gap-3.5"
          >
            {[
              { icon: Clock, label: '60s checks', color: 'text-green-500' },
              { icon: Bell, label: 'Realtime alerts', color: 'text-orange-500' },
              { icon: GitBranch, label: 'Deploy context', color: 'text-purple-500' },
              { icon: Sparkles, label: 'AI summaries', color: 'text-rose-500' },
              { icon: FileText, label: 'Postmortems', color: 'text-blue-500' },
            ].map((chip) => (
              <motion.div 
                key={chip.label}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="flex items-center gap-2 rounded-xl border border-slate-200/60 bg-white px-5 py-2.5 text-[14px] font-bold text-slate-600 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:shadow-md hover:border-slate-300"
              >
                <chip.icon size={16} className={chip.color} strokeWidth={2.5} />
                {chip.label}
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="mb-6 flex flex-col items-center gap-2.5 cursor-pointer z-20"
            onClick={() => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Scroll to explore
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 bg-white shadow-sm text-slate-400">
              <ChevronDown size={18} strokeWidth={3} />
            </div>
          </motion.div>

          {/* Dashboard Preview Section */}
          <div className="relative mx-auto w-[82%] md:w-[78%] lg:max-w-[1050px] perspective-[2000px]">
            {/* Glowing Pedestal/Ring */}
            <motion.div 
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[110%] h-[120px] rounded-[100%] bg-radial-gradient from-white via-orange-200/20 to-transparent blur-[40px] z-0"
              style={{
                background: 'radial-gradient(circle at center, white 0%, #FFE2C2 30%, transparent 70%)',
                opacity: 0.5
              }}
            />
            
            {/* Main Dashboard Image */}
            <motion.div 
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 overflow-hidden rounded-[24px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)]"
            >
              <img src="/hero/dummyDashboard.png" alt="FixFlow dashboard preview" className="w-full select-none" />
            </motion.div>

            {/* Floating Asset Cards (Direct Images) */}
            {/* A. GitHub Deploy */}
            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-[-15%] top-[15%] hidden xl:block w-[240px] z-20 -rotate-3"
            >
              <img src="/hero/github.png" alt="GitHub Deploy" className="w-full drop-shadow-2xl" />
            </motion.div>

            {/* B. Live Incident */}
            <motion.div
              animate={{ y: [6, -6, 6] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-[-18%] bottom-[20%] hidden xl:block w-[280px] z-20 -rotate-2"
            >
              <img src="/hero/incedent.png" alt="Live Incident" className="w-full drop-shadow-2xl" />
            </motion.div>

            {/* C. Alert Routing */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-[-12%] top-[20%] hidden xl:block w-[250px] z-20 rotate-3"
            >
              <img src="/hero/alert.png" alt="Alert Routing" className="w-full drop-shadow-2xl" />
            </motion.div>

            {/* D. AI Summary */}
            <motion.div
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-[-15%] bottom-[15%] hidden xl:block w-[290px] z-20 rotate-2"
            >
              <img src="/hero/aisummary.png" alt="AI Summary" className="w-full drop-shadow-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      <div id="solutions" className="mt-24 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-12 text-[42px] leading-tight text-slate-900 text-center" style={{ fontFamily: '"Instrument Serif", serif' }}>
            The complete incident lifecycle, guided by AI.
          </h2>
          <div className="grid gap-6 md:grid-cols-5">
            {LIFECYCLE.map((step) => (
              <motion.div 
                key={step.id} 
                whileHover={{ y: -5 }}
                className="rounded-3xl border border-slate-200/60 bg-white/50 backdrop-blur-sm p-6 text-left shadow-sm hover:shadow-md transition-all"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${step.bg}`}>
                  <step.icon size={20} className={step.color} />
                </div>
                <p className="mb-2 text-[18px] font-bold text-slate-900">{step.id}</p>
                <p className="text-[14px] leading-relaxed text-slate-500 font-medium">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>


      <section id="product" className="py-24 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
              Everything you need to ship reliable software
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PRODUCT_FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50">
                  <feature.icon size={24} className="text-slate-900" />
                </div>
                <h3 className="mb-3 text-lg font-bold text-slate-900">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="relative overflow-hidden bg-slate-900 py-24 px-6 text-white scroll-mt-20">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
        />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">Pricing that scales with your team.</h2>
            <div className="mt-8 flex items-center justify-center gap-4">
              <span className="text-sm font-medium opacity-60">Monthly</span>
              <div className="flex h-6 w-12 cursor-pointer items-center justify-start rounded-full bg-slate-800 p-1">
                <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
              </div>
              <span className="text-sm font-medium opacity-60">Yearly</span>
              <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-bold text-green-400">Save 20%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PRICING.map((plan) => (
              <div
                key={plan.plan}
                className={`relative flex flex-col rounded-3xl border p-8 backdrop-blur-xl ${plan.popular ? 'border-orange-500 ring-4 ring-orange-500/10' : 'border-slate-800'} bg-slate-800/50`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-black uppercase text-white">
                    Most popular
                  </span>
                )}
                <h3 className="mb-2 text-lg font-bold">{plan.plan}</h3>
                <p className="mb-6 text-xs text-slate-400">
                  For {plan.plan === 'Starter' ? 'individuals getting started' : plan.plan === 'Pro' ? 'small teams' : 'growing teams'}.
                </p>
                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-sm text-slate-500">/per user / month</span>}
                </div>
                <ul className="mb-10 flex-1 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle size={14} className="text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={`w-full rounded-xl py-3 text-sm font-bold transition-all ${plan.popular ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-white text-slate-900 hover:bg-slate-100'}`}>
                  {plan.plan === 'Enterprise' ? 'Contact sales' : 'Start free trial'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-white py-20 px-6">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="mb-6 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F172A]">
                <Shield size={16} color={accent} strokeWidth={3} />
              </div>
              <span className="text-xl font-bold tracking-tight">
                FixFlow<span style={{ color: accent }}>AI</span>
              </span>
            </Link>
            <p className="mb-8 max-w-sm text-sm leading-relaxed text-slate-500">
              AI-powered monitoring, incident response, and postmortems that help engineering teams move fast and stay reliable.
            </p>
            <div className="flex items-center gap-4">
              {['github', 'twitter', 'linkedin'].map((item) => (
                <div key={item} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors hover:text-slate-900">
                  <Activity size={16} />
                </div>
              ))}
            </div>
          </div>

          {[
            { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'Changelog'] },
            { title: 'Resources', links: ['Docs', 'Guides', 'API Reference', 'Status'] },
            { title: 'Company', links: ['About us', 'Blog', 'Careers', 'Contact'] },
          ].map((column) => (
            <div key={column.title}>
              <h4 className="mb-6 font-bold text-slate-900">{column.title}</h4>
              <ul className="space-y-4">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-slate-500 transition-colors hover:text-slate-900">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-20 flex max-w-7xl items-center justify-between border-t border-slate-100 pt-8 text-[11px] font-medium text-slate-400">
          <span>© 2026 FixFlow AI Inc. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

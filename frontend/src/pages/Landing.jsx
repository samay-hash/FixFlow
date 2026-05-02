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


      {/* MID: Everything section */}
      <section id="product" className="py-24 px-6 scroll-mt-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[42px] md:text-[52px] font-bold tracking-tight text-slate-900 leading-tight mb-0" style={{fontFamily:'"Instrument Serif",serif'}}>
              Everything your team needs
            </h2>
            <h2 className="text-[42px] md:text-[52px] font-bold tracking-tight leading-tight" style={{fontFamily:'"Instrument Serif",serif'}}>
              <span style={{color:'#FF5A0A'}}>between detection</span> and <span style={{color:'#FF5A0A'}}>resolution.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {icon:'💬', title:'War room collaboration', desc:'Align your team with shared timelines, clear ownership, and live updates.', preview:(
                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 text-[11px]">
                  <div className="flex items-center gap-2 mb-3 text-slate-500 font-medium"># incident-war-room <span className="ml-auto flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-500"/>Live</span></div>
                  {[['10:21 AM','Incident triggered','Payments API latency spike'],['10:22 AM','@Maya acknowledged','Investigating the root cause'],['10:23 AM','@Arjun joined','Looking into database metrics']].map(([t,u,m])=>(
                    <div key={t} className="flex gap-2 mb-2"><span className="text-slate-400 shrink-0">{t}</span><div><div className="font-semibold text-slate-700">{u}</div><div className="text-slate-500">{m}</div></div></div>
                  ))}
                  <div className="flex mt-3">{'👤👤👤'.split('').map((a,i)=><span key={i} className="text-base -ml-1">{a}</span>)}<span className="ml-2 text-slate-400">+3</span></div>
                </div>
              )},
              {icon:'</>',iconClass:'text-violet-500', title:'Deploy-aware investigations', desc:'Automatically link incidents to deploys and code changes that may be related.', preview:(
                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 text-[11px]">
                  <div className="flex items-center justify-between mb-3"><span className="font-semibold text-slate-700">Suspected change</span><span className="text-orange-500 font-bold text-[10px]">High confidence</span></div>
                  <div className="bg-white rounded-lg border border-slate-200 p-3 mb-3">
                    <div className="flex items-center gap-2 font-semibold text-slate-800 mb-1">⚫ GitHub Deploy</div>
                    <div className="text-slate-500">main &nbsp;a1b2c3d</div>
                    <div className="text-slate-400">Deployed 10:16 AM · by joe</div>
                  </div>
                  <div className="font-medium text-slate-600 mb-2">Changes in this deploy</div>
                  {[['payments/handler.py','+23','text-green-600'],['database/queries.sql','-8','text-red-500']].map(([f,n,c])=>(
                    <div key={f} className="flex items-center justify-between py-1 border-b border-slate-100"><span className="text-slate-600">{f}</span><span className={`font-bold ${c}`}>{n}</span></div>
                  ))}
                </div>
              )},
              {icon:'🌐', title:'Customer communication', desc:'Keep stakeholders informed with status pages and clear, consistent updates.', preview:(
                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 text-[11px]">
                  <div className="flex items-center gap-2 mb-3"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white text-[9px]">✓</span><span className="font-semibold text-slate-700">All systems operational</span><span className="ml-auto text-slate-400">Updated 2m ago</span></div>
                  {[['Payments API','Degraded performance','text-orange-500'],['Web App','Operational','text-green-600'],['Auth Service','Operational','text-green-600']].map(([s,st,c])=>(
                    <div key={s} className="flex items-center justify-between py-2 border-b border-slate-100">
                      <div><div className="font-medium text-slate-700">{s}</div><div className={`text-[10px] font-semibold ${c}`}>{st}</div></div>
                      <div className="flex gap-0.5">{[1,2,3,4,5,6,7].map(i=><div key={i} className={`w-1 rounded-full ${i<6?'h-3':'h-5'} ${st==='Degraded performance'&&i>4?'bg-orange-400':'bg-green-400'}`}/>)}</div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between mt-2 pt-2"><div><div className="text-slate-400">Page views</div><div className="font-bold text-slate-800">1.2K</div></div><div><div className="text-slate-400">Subscribers</div><div className="font-bold text-slate-800">342</div></div><button className="text-[10px] font-semibold text-slate-700 border border-slate-200 rounded-lg px-2 py-1">View status page →</button></div>
                </div>
              )},
            ].map(({icon,iconClass,title,desc,preview})=>(
              <div key={title} className="flex flex-col">
                <div className={`text-2xl mb-4 ${iconClass||'text-orange-500'}`}>{icon}</div>
                <h3 className="text-[18px] font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-[15px] leading-relaxed">{desc}</p>
                {preview}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MID: Incident workspace */}
      <section className="py-24 px-6 bg-[#FFFDFC]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-[38px] md:text-[48px] font-bold tracking-tight mb-16" style={{fontFamily:'"Instrument Serif",serif'}}>
            Work the incident from <span style={{color:'#FF5A0A'}}>one focused workspace.</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3 mb-4 pb-4 border-b border-slate-100">
                <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center"><AlertTriangle size={16} className="text-red-500"/></div>
                <div className="flex-1"><div className="font-bold text-slate-900 text-[15px]">Payments API latency spike</div><div className="text-[12px] text-slate-500">Incident #INC-507 · Triggered 10:21 AM (8m ago)</div></div>
                <span className="text-[12px] font-semibold text-orange-600 border border-orange-200 bg-orange-50 rounded-full px-3 py-1">Investigating</span>
              </div>
              <div className="flex gap-6 text-[13px] font-semibold mb-6 border-b border-slate-100 pb-3">
                {['Overview','Timeline','Impact','Logs','Postmortem'].map((t,i)=><span key={t} className={i===0?'text-orange-500 border-b-2 border-orange-500 pb-3 -mb-3':'text-slate-500 cursor-pointer hover:text-slate-800'}>{t}</span>)}
              </div>
              <div className="grid md:grid-cols-3 gap-6 text-[13px]">
                <div>
                  <div className="text-slate-500 mb-1">Impact summary</div>
                  <div className="text-slate-600 mb-2">Affected users</div>
                  <div className="text-[28px] font-bold text-slate-900">12.4%</div>
                  <div className="text-orange-500 text-[12px] font-semibold">↑ 3.2% in last 10m</div>
                  <div className="text-slate-600 mt-2 mb-1">Response time</div>
                  <div className="text-[28px] font-bold text-slate-900">124 ms</div>
                  <div className="text-orange-500 text-[12px] font-semibold">↑ 42% in last 10m</div>
                  <div className="mt-4 h-16 bg-orange-50 rounded-lg flex items-end p-2 gap-0.5">
                    {[3,4,3,5,6,7,8,10,12,14].map((h,i)=><div key={i} className="flex-1 bg-orange-400 rounded-t" style={{height:`${h*5}px`}}/>)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 mb-3">Suspected deploy</div>
                  <div className="bg-slate-50 rounded-xl p-3 mb-3 text-[12px]">
                    <div className="font-semibold mb-1">⚫ main &nbsp;a1b2c3d</div>
                    <div className="text-slate-400">Deployed 10:16 AM · by joe</div>
                  </div>
                  <div className="text-slate-500 mb-1">Confidence</div>
                  <span className="text-[11px] font-bold bg-orange-100 text-orange-600 rounded px-2 py-0.5">High</span>
                  <button className="block mt-4 text-[12px] text-orange-500 font-semibold">View change details →</button>
                </div>
                <div>
                  <div className="text-slate-500 mb-2">Current status</div>
                  <div className="flex items-center gap-2 mb-3"><span className="h-2 w-2 rounded-full bg-orange-400"/>Investigating</div>
                  <div className="text-slate-500 mb-1">Owner</div>
                  <div className="flex items-center gap-2 mb-3"><span className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center text-[11px] font-bold">M</span>Maya Chen</div>
                  <div className="text-slate-500 mb-1">Responders</div>
                  <div className="flex gap-1 mb-3">{['A','B','C'].map(l=><span key={l} className="h-7 w-7 rounded-full bg-slate-300 flex items-center justify-center text-[11px] font-bold">{l}</span>)}<span className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-[11px] text-slate-500">+2</span></div>
                  <button className="w-full text-[12px] font-semibold border border-slate-200 rounded-lg py-2 text-slate-700 hover:bg-slate-50">Add responder</button>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-[#4A154B] flex items-center justify-center text-white text-[12px] font-bold">#</div>
                  <span className="font-bold text-slate-900 text-[14px]">Slack alert</span>
                </div>
                <div className="text-[12px] text-slate-500 mb-1">FixFlow APP &nbsp;10:21 AM</div>
                <div className="text-[13px] font-medium text-slate-800">⚠ Incident triggered</div>
                <div className="text-[12px] text-slate-600 mb-3">Payments API latency spike</div>
                <button className="text-[12px] font-bold text-orange-500 border border-orange-200 rounded-lg px-3 py-1.5">Open incident</button>
                <div className="mt-3 text-[11px] text-slate-400">3 replies · Last reply 2m ago</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-7 w-7 rounded-full bg-slate-900 flex items-center justify-center text-white text-[11px]">G</div>
                  <span className="font-bold text-slate-900 text-[14px]">GitHub deploy context</span>
                </div>
                {[['Repository','fixflow/payments-service'],['Branch','main'],['Commit','a1b2c3d'],['Deployed','10:16 AM · by joe']].map(([k,v])=>(
                  <div key={k} className="flex justify-between text-[12px] py-1 border-b border-slate-50"><span className="text-slate-400">{k}</span><span className="font-medium text-slate-700">{v}</span></div>
                ))}
                <button className="mt-3 text-[12px] font-semibold text-orange-500">View commit →</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MID: Stats */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-[36px] md:text-[44px] font-bold tracking-tight mb-16" style={{fontFamily:'"Instrument Serif",serif'}}>
            Why teams switch to <span style={{color:'#FF5A0A'}}>FixFlow.</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {icon:<Zap size={24} className="text-orange-500"/>, bg:'bg-orange-50', title:'Faster incident response', desc:'Resolve issues sooner with context-rich alerts.', stat:'-32%', statLabel:'MTTR improvement'},
              {icon:<Sparkles size={24} className="text-violet-500"/>, bg:'bg-violet-50', title:'Less manual work', desc:'AI summaries and postmortems reduce repetitive work.', stat:'-45%', statLabel:'Manual effort', statColor:'text-violet-500'},
              {icon:<Bell size={24} className="text-blue-500"/>, bg:'bg-blue-50', title:'Clearer communication', desc:'Status updates and shared timelines keep everyone aligned.', stat:'+68%', statLabel:'Stakeholder satisfaction', statColor:'text-blue-500'},
            ].map(({icon,bg,title,desc,stat,statLabel,statColor='text-orange-500'})=>(
              <div key={title} className="flex flex-col">
                <div className={`h-12 w-12 rounded-2xl ${bg} flex items-center justify-center mb-5`}>{icon}</div>
                <h3 className="font-bold text-slate-900 text-[17px] mb-2">{title}</h3>
                <p className="text-slate-500 text-[14px] leading-relaxed mb-6">{desc}</p>
                <div className={`text-[40px] font-bold ${statColor}`}>{stat}</div>
                <div className="text-slate-400 text-[14px] mt-1">{statLabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM: Pricing */}
      <section id="pricing" className="py-24 px-6 bg-[#FFFDFC] scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[14px] font-semibold text-slate-500 mb-4 uppercase tracking-widest">Simple, transparent pricing</p>
            <h2 className="text-[40px] md:text-[52px] font-bold tracking-tight" style={{fontFamily:'"Instrument Serif",serif'}}>
              Pricing that <span style={{color:'#FF5A0A'}}>scales with your team.</span>
            </h2>
            <div className="mt-6 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1">
              <button className="rounded-full px-5 py-2 text-[14px] font-semibold text-slate-900 bg-white shadow-sm">Monthly</button>
              <button className="rounded-full px-5 py-2 text-[14px] font-semibold text-slate-500 hover:text-slate-900">Yearly <span className="ml-1 text-[11px] font-bold text-green-600">Save 20%</span></button>
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {[
              {plan:'Starter', sub:'For individuals getting started.', price:'$0', priceNote:'Forever free', features:['Up to 3 integrations','7-day event history','Basic incident alerts','Community support'], btn:'Get started free', btnStyle:'border border-slate-200 text-slate-900 hover:bg-slate-50'},
              {plan:'Pro', sub:'For small teams that move fast.', price:'$19', priceNote:'per user / month', features:['Unlimited integrations','30-day event history','Advanced incident alerts','Priority email support'], btn:'Start free trial', btnStyle:'border border-slate-200 text-slate-900 hover:bg-slate-50'},
              {plan:'Team', sub:'For growing engineering teams.', price:'$49', priceNote:'per user / month', features:['Unlimited everything','90-day event history','Status pages & analytics','SAML SSO & audit logs','Priority chat support'], btn:'Start free trial', btnStyle:'bg-[#FF5A0A] text-white hover:brightness-110', popular:true},
              {plan:'Enterprise', sub:'For organizations with scale.', price:'Custom', priceNote:"Let's build a plan for you.", features:['Advanced security & SSO','Custom data retention','Dedicated success manager','99.9% uptime SLA'], btn:'Contact sales', btnStyle:'border border-slate-200 text-slate-900 hover:bg-slate-50'},
            ].map(({plan,sub,price,priceNote,features,btn,btnStyle,popular})=>(
              <div key={plan} className={`relative flex flex-col rounded-2xl border bg-white p-7 ${popular?'border-[#FF5A0A] shadow-[0_0_0_4px_rgba(255,90,10,0.08)]':'border-slate-200'}`}>
                {popular && <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#FF5A0A] px-4 py-1 text-[11px] font-black uppercase text-white">Most popular</span>}
                <h3 className="text-[17px] font-bold text-slate-900 mb-1">{plan}</h3>
                <p className="text-[13px] text-slate-400 mb-5">{sub}</p>
                <div className="mb-6">
                  <span className="text-[36px] font-bold text-slate-900">{price}</span>
                  <span className="text-[13px] text-slate-400 ml-1">{priceNote}</span>
                </div>
                <ul className="flex-1 space-y-3 mb-8">
                  {features.map(f=>(
                    <li key={f} className="flex items-start gap-2 text-[13px] text-slate-600">
                      <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5"/>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full rounded-xl py-3 text-[14px] font-bold transition-all ${btnStyle}`}>{btn}</button>
              </div>
            ))}
          </div>
          <p className="text-center text-[13px] text-slate-400 mt-8">All plans include FixFlow AI core, incident workspace, and deploy-aware RCA.</p>
        </div>
      </section>

      {/* BOTTOM: Integrations */}
      <section className="py-16 px-6 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-[28px] md:text-[36px] font-bold text-slate-900 mb-12" style={{fontFamily:'"Instrument Serif",serif'}}>
            Works with the tools already in your stack.
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-10">
            {[
              {label:'GitHub', icon:'⚫'},
              {label:'Slack', icon:'#️⃣'},
              {label:'Email', icon:'✉️'},
              {label:'PagerDuty', icon:'📟', color:'text-green-600'},
              {label:'Webhooks', icon:'🔗'},
              {label:'API', icon:'</>'},
              {label:'+40 more', icon:null},
            ].map(({label,icon,color})=>(
              <div key={label} className="flex items-center gap-2 text-[15px] font-semibold text-slate-700">
                {icon && <span className={`text-xl ${color||''}`}>{icon}</span>}
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM: Testimonials */}
      <section className="py-20 px-6 bg-[#FFFDFC]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {quote:'"FixFlow AI cut our mean time to resolution in half. The root cause surface is scary good."', name:'Arjun Patel', role:'SRE Lead, Rently', company:'Rently', companyColor:'text-orange-500'},
            {quote:'"The deploy-aware context is a game changer. We finally see the why, not just the what."', name:'Maya Chen', role:'Staff Engineer, Loopy', company:'loopy', companyColor:'text-slate-800'},
            {quote:'"Our customers love the status page. Clear updates build real trust."', name:'Lucas Martin', role:'Engineering Manager, Paymate', company:'paymate', companyColor:'text-green-600'},
          ].map(({quote,name,role,company,companyColor})=>(
            <div key={name} className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm flex flex-col">
              <div className="flex gap-1 mb-5 text-orange-400 text-lg">{'★★★★★'}</div>
              <p className="text-[15px] text-slate-700 leading-relaxed flex-1 mb-6">{quote}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">{name[0]}</div>
                  <div><div className="font-bold text-slate-900 text-[14px]">{name}</div><div className="text-slate-400 text-[12px]">{role}</div></div>
                </div>
                <span className={`font-black text-[16px] ${companyColor}`}>{company}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM: CTA Banner */}
      <section className="py-24 px-6 relative overflow-hidden bg-gradient-to-b from-[#FFFDFC] to-[#FFF0E0]">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] h-[180px] rounded-[100%] blur-[60px] opacity-30" style={{background:'radial-gradient(circle, #FF5A0A 0%, transparent 70%)'}}/>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-[42px] md:text-[56px] font-bold tracking-tight mb-4" style={{fontFamily:'"Instrument Serif",serif'}}>
            Bring clarity to <span style={{color:'#FF5A0A'}}>every incident.</span>
          </h2>
          <p className="text-[16px] text-slate-500 mb-10">Start free. No credit card. Set up in minutes.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/register" className="flex items-center gap-2 rounded-full px-10 py-4 text-[16px] font-bold text-white transition-all hover:brightness-110" style={{backgroundColor:'#FF5A0A', boxShadow:'0 16px 32px -8px rgba(255,90,10,0.35)'}}>
              Start free <ArrowRight size={18} strokeWidth={3}/>
            </Link>
            <Link to="/demo" className="rounded-full border border-slate-200 bg-white px-10 py-4 text-[16px] font-bold text-slate-800 hover:bg-slate-50">
              Book a demo
            </Link>
          </div>
        </div>
      </section>

      {/* BOTTOM: Footer */}
      <footer className="bg-white border-t border-slate-100 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-14">
            <div className="col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F172A]">
                  <Shield size={16} color="#FF5A0A" strokeWidth={3}/>
                </div>
                <span className="text-[18px] font-bold tracking-tight">FixFlow <span style={{color:'#FF5A0A'}}>AI</span></span>
              </Link>
              <p className="text-[13px] text-slate-500 leading-relaxed mb-5 max-w-[220px]">AI-powered monitoring, incident response, and postmortems that help engineering teams move fast and stay reliable.</p>
              <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden mb-5">
                <input type="email" placeholder="Enter your work email" className="flex-1 px-4 py-2.5 text-[13px] outline-none bg-white text-slate-700 placeholder-slate-400"/>
                <button className="px-4 py-2.5 text-[13px] font-bold text-white" style={{backgroundColor:'#FF5A0A'}}>Subscribe</button>
              </div>
              <div className="flex gap-3">
                {['⚫','#️⃣','🔗','🐦','▶'].map((icon,i)=>(
                  <div key={i} className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-[14px] cursor-pointer hover:border-slate-400">{icon}</div>
                ))}
              </div>
            </div>
            {[
              {title:'Product', links:['Features','Pricing','Integrations','Changelog']},
              {title:'Resources', links:['Docs','Guides','API Reference','Status']},
              {title:'Company', links:['About us','Blog','Careers','Contact']},
              {title:'Legal', links:['Privacy','Terms','Security','Trust & Compliance']},
            ].map(col=>(
              <div key={col.title}>
                <h4 className="text-[13px] font-bold text-slate-900 mb-4">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map(l=><li key={l}><a href="#" className="text-[13px] text-slate-500 hover:text-slate-900">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-[12px] text-slate-400">
            <span>© 2025 FixFlow AI Inc. All rights reserved.</span>
            <span>Made with ❤️ by the FixFlow AI team</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

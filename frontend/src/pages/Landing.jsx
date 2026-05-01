import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Shield, Zap, Globe, Bot, FileText, Activity, ArrowRight, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const FEATURES = [
  { icon: Globe,        title: 'Uptime Monitoring',    desc: 'Every site checked every 60 seconds. HTTP status, response time, degradation — all tracked.',  accent: '#FF8C42' },
  { icon: AlertTriangle,title: 'Auto Incidents',       desc: 'Sites go down? Incidents are auto-created instantly. No manual alerts needed.',                    accent: '#FF2D78' },
  { icon: Bot,          title: 'AI Postmortems',       desc: 'Gemini AI generates structured RCA reports from your incident timeline in seconds.',               accent: '#5500CC' },
  { icon: Activity,     title: 'Real-time Dashboard',  desc: 'Socket.io-powered live updates. No refresh needed — watch your infra breathe.',                   accent: '#A0C4FF' },
  { icon: Zap,          title: 'Auto-Remediation',     desc: 'AI suggests bash, kubectl and AWS CLI commands to fix your incident automatically.',               accent: '#FFE500' },
  { icon: FileText,     title: 'Log Explorer',         desc: 'Filter 200+ logs by FATAL, ERROR, WARN, INFO. Search by source or message in real-time.',         accent: '#FF6B00' },
];

const STATS = [
  { value: '60s',  label: 'Check Interval' },
  { value: '99.9%',label: 'Detection Rate' },
  { value: '<1min',label: 'Alert Latency' },
  { value: 'AI',   label: 'Postmortem Gen' },
];

const HOW = [
  { step: '01', title: 'Add Your Site',       desc: 'Paste any URL. Our monitor pings it every 60 seconds from our global nodes.' },
  { step: '02', title: 'Get Instant Alerts',  desc: 'Site down? You get an email + in-app notification before your users even notice.' },
  { step: '03', title: 'Respond in War Room', desc: 'Collaborate in a live incident timeline. AI writes the SITREP for you.' },
  { step: '04', title: 'AI Writes Postmortem',desc: 'One click. Gemini AI generates root cause, impact, and prevention steps automatically.' },
];

export default function Landing() {
  const [dark, setDark] = useState(() => localStorage.getItem('fixflow-theme') === 'dark');

  useEffect(() => {
    localStorage.setItem('fixflow-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const t = {
    bg:       dark ? '#0A0A0A' : '#F2EDE4',
    bg2:      dark ? '#141414' : '#EAE4D9',
    bg3:      dark ? '#1E1E1E' : '#fff',
    text:     dark ? '#F0EBE0' : '#0A0A0A',
    muted:    dark ? '#999'    : '#555',
    border:   dark ? '#444'    : '#0A0A0A',
    dot:      dark ? '#F0EBE018' : '#0A0A0A18',
    cardBg:   dark ? '#1A1A1A' : '#EAE4D9',
    // Always-dark tokens — for logo box & terminal header only
    inkBg:    '#0A0A0A',
    inkText:  '#F0EBE0',
    // Theme-aware accent section (stats bar + CTA)
    accentBg: dark ? '#0A0A0A' : '#EAE4D9',
    accentText: dark ? '#FF8C42' : '#0A0A0A',
    accentMuted: dark ? '#888'  : '#555',
    accentDivider: dark ? '#333' : '#bbb',
    accentBorder: dark ? '#444' : '#0A0A0A',
  };

  const card = (extra = {}) => ({
    background: t.cardBg,
    border: `3px solid ${t.border}`,
    boxShadow: `4px 4px 0 ${t.border}`,
    ...extra,
  });

  return (
    <div style={{
      background: t.bg,
      color: t.text,
      minHeight: '100vh',
      backgroundImage: `radial-gradient(circle, ${t.dot} 1px, transparent 1px)`,
      backgroundSize: '24px 24px',
      fontFamily: "'Space Grotesk', sans-serif",
    }}>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav style={{ borderBottom: `3px solid ${t.border}`, background: t.bg2 }}
        className="sticky top-0 z-50 flex items-center justify-between px-8 py-4">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center"
            style={{ background: t.inkBg, boxShadow: `2px 2px 0 #FF8C42` }}>
            <Shield size={16} color="#FF8C42" />
          </div>
          <span className="font-black text-lg uppercase tracking-widest" style={{ color: t.text }}>FixFlow</span>
          <span className="text-xs font-bold px-1.5 py-0.5"
            style={{ background: '#FF8C42', color: '#0A0A0A', border: `2px solid ${t.border}` }}>AI</span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {['Features', 'How It Works', 'Stats'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
              className="px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all hover:opacity-70"
              style={{ color: t.muted }}>
              {l}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button onClick={() => setDark(!dark)}
            className="w-9 h-9 flex items-center justify-center transition-all hover:opacity-70"
            style={{ border: `2px solid ${t.border}`, background: t.bg3, boxShadow: `2px 2px 0 ${t.border}` }}>
            {dark ? <Sun size={15} color={t.text} /> : <Moon size={15} color={t.text} />}
          </button>
          <Link to="/login"
            className="px-4 py-2 text-sm font-black uppercase"
            style={{ border: `2px solid ${t.border}`, color: t.text, background: 'transparent' }}>
            Login
          </Link>
          <Link to="/register"
            className="px-4 py-2 text-sm font-black uppercase"
            style={{ background: '#FF8C42', border: `2px solid ${t.border}`, color: '#0A0A0A', boxShadow: `3px 3px 0 ${t.border}` }}>
            Get Started →
          </Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="px-8 pt-20 pb-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6"
              style={{ background: '#FF2D78', border: `2px solid ${t.border}`, boxShadow: `3px 3px 0 ${t.border}` }}>
              <span className="pulse-dot-red" />
              <span className="text-xs font-black uppercase tracking-wider text-white">Live Monitoring Active</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-7xl font-black uppercase leading-none mb-6" style={{ color: t.text }}>
              INCIDENTS<br />
              <span className="inline-block px-2" style={{ background: '#FF8C42', color: '#0A0A0A' }}>
                FIXED.
              </span><br />
              FAST.
            </h1>

            <p className="text-lg font-medium mb-8 max-w-md" style={{ color: t.muted }}>
              FixFlow monitors your websites every 60 seconds, auto-creates incidents when things break,
              and uses <span className="font-black" style={{ color: t.text }}>Gemini AI</span> to write
              your postmortem — so you can focus on fixing, not documenting.
            </p>

            <div className="flex gap-4 flex-wrap">
              <Link to="/register"
                className="px-6 py-3 font-black uppercase text-sm tracking-wide transition-all"
                style={{ background: '#FF8C42', color: '#0A0A0A', border: `3px solid ${t.border}`, boxShadow: `4px 4px 0 ${t.border}` }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = `6px 6px 0 ${t.border}`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `4px 4px 0 ${t.border}`; }}>
                Start Monitoring Free →
              </Link>
              <a href="#how-it-works"
                className="px-6 py-3 font-black uppercase text-sm tracking-wide"
                style={{ background: 'transparent', color: t.text, border: `3px solid ${t.border}` }}>
                See How It Works ↓
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex gap-3 mt-8 flex-wrap">
              {['No Credit Card', 'Free to Start', 'AI-Powered'].map(b => (
                <span key={b} className="flex items-center gap-1.5 text-xs font-bold uppercase"
                  style={{ color: t.muted }}>
                  <CheckCircle size={12} color="#FF8C42" />{b}
                </span>
              ))}
            </div>
          </div>

          {/* Dashboard Preview Card */}
          <div className="relative">
            {/* Floating accent */}
            <div className="absolute -top-4 -right-4 w-16 h-16 z-10"
              style={{ background: '#FF2D78', border: `3px solid ${t.border}`, boxShadow: `3px 3px 0 ${t.border}` }} />
            <div className="absolute -bottom-4 -left-4 w-10 h-10 z-10"
              style={{ background: '#FF8C42', border: `3px solid ${t.border}`, boxShadow: `2px 2px 0 ${t.border}` }} />

            <div style={{ ...card(), position: 'relative', overflow: 'hidden' }}>
              {/* Terminal header — always dark */}
              <div className="flex items-center justify-between px-4 py-3 -mx-6 -mt-6 mb-5"
                style={{ background: t.inkBg, marginLeft: -24, marginRight: -24, marginTop: -24, paddingLeft: 24, paddingRight: 24 }}>
                <div className="flex gap-1.5">
                  {['#FF2D78', '#FFE500', '#FF8C42'].map(c => (
                    <div key={c} className="w-3 h-3" style={{ background: c, border: '1.5px solid #555' }} />
                  ))}
                </div>
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: '#FF8C42' }}>
                  FixFlow Dashboard
                </span>
                <span className="text-xs font-mono" style={{ color: '#888' }}>LIVE</span>
              </div>

              {/* Mock status rows */}
              <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: t.muted }}>Site Status</p>
              {[
                { name: 'api.myapp.com',     status: 'UP',   ms: '124ms',  color: '#FF8C42' },
                { name: 'dashboard.myapp.com',status: 'DOWN', ms: '—',      color: '#FF2D78' },
                { name: 'cdn.myapp.com',     status: 'UP',   ms: '89ms',   color: '#FF8C42' },
              ].map(s => (
                <div key={s.name} className="flex items-center gap-3 mb-2 p-3"
                  style={{ background: t.bg3, border: `2px solid ${t.border}` }}>
                  <div className="w-2.5 h-2.5 flex-shrink-0"
                    style={{ background: s.color, border: `1.5px solid ${t.border}` }} />
                  <span className="text-xs font-mono flex-1" style={{ color: t.text }}>{s.name}</span>
                  <span className="text-xs font-black" style={{ color: t.muted }}>{s.ms}</span>
                  <span className="text-xs font-black px-2 py-0.5"
                    style={{ background: s.color, color: '#0A0A0A', border: `1.5px solid ${t.border}` }}>
                    {s.status}
                  </span>
                </div>
              ))}

              {/* Mock alert */}
              <div className="mt-3 p-3 flex items-center gap-2"
                style={{ background: '#FF2D78', border: `2px solid ${t.border}` }}>
                <span className="pulse-dot-red" />
                <span className="text-xs font-black text-white uppercase tracking-wide">
                  🚨 Auto-incident created — dashboard.myapp.com is DOWN
                </span>
              </div>

              {/* Mock AI Suggestion */}
              <div className="mt-3 p-3"
                style={{ background: dark ? '#2A1A44' : '#EDE0FF', border: `2px solid #5500CC` }}>
                <p className="text-xs font-black uppercase tracking-wide mb-1" style={{ color: dark ? '#BB88FF' : '#5500CC' }}>
                  🤖 AI SUGGESTION
                </p>
                <p className="text-xs font-mono" style={{ color: dark ? '#ccc' : '#333' }}>
                  "Restart nginx pods &amp; check DB connection pool"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────── */}
      <section style={{ borderTop: `3px solid ${t.border}`, borderBottom: `3px solid ${t.border}`, background: t.accentBg }}>
        <div className="max-w-7xl mx-auto px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-0">
          {STATS.map((s, i) => (
            <div key={s.label}
              className="text-center py-4 px-6"
              style={{ borderRight: i < STATS.length - 1 ? `3px solid ${t.accentDivider}` : 'none' }}>
              <p className="text-3xl font-black" style={{ color: t.accentText }}>{s.value}</p>
              <p className="text-xs font-bold uppercase tracking-wider mt-1" style={{ color: t.accentMuted }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section id="features" className="px-8 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-black uppercase tracking-widest"
            style={{ background: '#FF8C42', border: `2px solid ${t.border}`, color: '#0A0A0A' }}>
            // Features
          </div>
          <h2 className="text-4xl lg:text-5xl font-black uppercase" style={{ color: t.text }}>
            EVERYTHING YOU NEED.<br />
            <span className="inline-block px-2" style={{ background: '#FF2D78', color: 'white' }}>NOTHING YOU DON'T.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, accent }) => (
            <div key={title}
              className="p-5 group transition-all"
              style={card()}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-3px,-3px)'; e.currentTarget.style.boxShadow = `7px 7px 0 ${t.border}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `4px 4px 0 ${t.border}`; }}>
              <div className="w-10 h-10 flex items-center justify-center mb-4"
                style={{ background: accent, border: `2px solid ${t.border}` }}>
                <Icon size={18} color="#0A0A0A" />
              </div>
              <h3 className="font-black text-base uppercase tracking-wide mb-2" style={{ color: t.text }}>{title}</h3>
              <p className="text-sm font-medium leading-relaxed" style={{ color: t.muted }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section id="how-it-works"
        style={{ borderTop: `3px solid ${t.border}`, borderBottom: `3px solid ${t.border}`, background: t.bg2 }}
        className="px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 mb-4 text-xs font-black uppercase tracking-widest"
              style={{ background: '#A0C4FF', border: `2px solid ${t.border}`, color: '#0A0A0A' }}>
              // How It Works
            </div>
            <h2 className="text-4xl lg:text-5xl font-black uppercase" style={{ color: t.text }}>
              FOUR STEPS TO<br />
              <span className="inline-block px-2" style={{ background: '#FF8C42', color: '#0A0A0A' }}>ZERO DOWNTIME.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW.map(({ step, title, desc }, i) => (
              <div key={step} className="relative p-6" style={card()}>
                <div className="text-5xl font-black mb-4 leading-none"
                  style={{ color: '#FF8C42', WebkitTextStroke: `2px ${t.border}` }}>
                  {step}
                </div>
                <h3 className="font-black text-base uppercase tracking-wide mb-2" style={{ color: t.text }}>{title}</h3>
                <p className="text-sm font-medium" style={{ color: t.muted }}>{desc}</p>
                {i < HOW.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight size={20} color={t.border} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ──────────────────────────────────────── */}
      <section id="stats" className="px-8 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-black uppercase tracking-widest"
            style={{ background: '#FFE500', border: `2px solid ${t.border}`, color: '#0A0A0A' }}>
            // Tech Stack
          </div>
          <h2 className="text-4xl font-black uppercase" style={{ color: t.text }}>
            BUILT WITH<br />
            <span className="inline-block px-2" style={{ background: t.inkBg, color: '#FF8C42' }}>
              PRODUCTION-GRADE TOOLS.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'React 18', role: 'Frontend',   color: '#61DAFB' },
            { name: 'Express 5', role: 'Backend',   color: '#FF8C42' },
            { name: 'MongoDB',   role: 'Database',  color: '#47A248' },
            { name: 'Socket.io', role: 'Realtime',  color: '#FF2D78' },
            { name: 'Gemini AI', role: 'AI Engine', color: '#5500CC' },
            { name: 'Redux',     role: 'State',     color: '#764ABC' },
            { name: 'node-cron', role: 'Scheduler', color: '#FFE500' },
            { name: 'Nodemailer',role: 'Alerts',    color: '#FF6B00' },
          ].map(tech => (
            <div key={tech.name} className="p-4 text-center transition-all"
              style={card()}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = `6px 6px 0 ${t.border}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `4px 4px 0 ${t.border}`; }}>
              <div className="w-3 h-3 mx-auto mb-2"
                style={{ background: tech.color, border: `2px solid ${t.border}` }} />
              <p className="font-black text-sm uppercase" style={{ color: t.text }}>{tech.name}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: t.muted }}>{tech.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section style={{ borderTop: `3px solid ${t.border}`, background: t.accentBg }}
        className="px-8 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6"
            style={{ background: '#FF2D78', border: `2px solid ${t.accentBorder}` }}>
            <Clock size={12} color="white" />
            <span className="text-xs font-black uppercase tracking-wider text-white">Start in 60 Seconds</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-black uppercase leading-tight mb-6" style={{ color: t.text }}>
            STOP FINDING OUT<br />
            <span style={{ background: '#FF8C42', color: '#0A0A0A', display: 'inline-block', padding: '0 12px' }}>
              FROM YOUR USERS.
            </span>
          </h2>
          <p className="text-base font-medium mb-8" style={{ color: t.muted }}>
            FixFlow tells you before they do. Free to start. No credit card. Just add a URL.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register"
              className="px-8 py-4 font-black uppercase text-base tracking-wide transition-all"
              style={{ background: '#FF8C42', color: '#0A0A0A', border: `3px solid ${t.border}`, boxShadow: `5px 5px 0 ${t.border}` }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>
              Create Free Workspace →
            </Link>
            <Link to="/login"
              className="px-8 py-4 font-black uppercase text-base tracking-wide"
              style={{ background: 'transparent', color: t.muted, border: `3px solid ${t.border}` }}>
              I Have an Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer style={{ borderTop: `3px solid ${t.border}`, background: t.bg2 }}
        className="px-8 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 flex items-center justify-center"
              style={{ background: t.inkBg, boxShadow: '2px 2px 0 #FF8C42' }}>
              <Shield size={12} color="#FF8C42" />
            </div>
            <span className="font-black uppercase tracking-widest text-sm" style={{ color: t.text }}>FixFlow</span>
            <span className="text-xs" style={{ color: t.muted }}>Smart Incident Monitoring & Response</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login"
              className="text-xs font-bold uppercase" style={{ color: t.muted }}>Login</Link>
            <Link to="/register"
              className="text-xs font-bold uppercase" style={{ color: t.muted }}>Register</Link>
            <button onClick={() => setDark(!dark)}
              className="w-7 h-7 flex items-center justify-center"
              style={{ border: `2px solid ${t.border}`, background: t.bg3 }}>
              {dark ? <Sun size={12} color={t.text} /> : <Moon size={12} color={t.text} />}
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-4 pt-4 text-center"
          style={{ borderTop: `1px solid ${dark ? '#222' : '#ccc'}` }}>
          <p className="text-xs font-medium" style={{ color: t.muted }}>
            Built for hackathons & production SRE teams · ISC License · 2026
          </p>
        </div>
      </footer>
    </div>
  );
}

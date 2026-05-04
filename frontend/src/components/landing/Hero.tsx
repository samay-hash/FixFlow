import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { HERO_CHIPS } from './constants';
import { BackgroundOrnaments } from './shared/BackgroundOrnaments';
import { HeroDashboard } from './shared/HeroDashboard';
import { FloatingDeployCard, FloatingIncidentCard, FloatingRoutingCard, FloatingSummaryCard } from './shared/FloatingCards';

export function Hero() {
  const isAuthenticated  = false

  return (
    <section className="relative overflow-hidden px-5 pt-[140px] sm:px-8 lg:pt-[180px]">
      <BackgroundOrnaments />
      <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[910px] font-serif text-[54px] leading-[0.9] tracking-[-0.055em] text-[#07111f] sm:text-[76px] lg:text-[82px]"
        >
          <span className="block">Stay ahead of incidents.</span>
          <span className="block text-[#ff4f0a]">Fix issues before customers notice.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.75 }}
          className="mt-10 max-w-[640px] text-[17px] font-semibold leading-8 text-slate-500 sm:text-[19px] lg:mt-12"
        >
          AI-powered monitoring, incident response, and postmortems that help engineering teams move fast and stay reliable.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.75 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-5 lg:mt-12"
        >
          {isAuthenticated ? (
            <Link to="/dashboard" className="inline-flex min-h-[56px] items-center gap-3 rounded-xl bg-[#07111f] px-10 py-4 text-[16px] font-black text-white shadow-[0_16px_34px_rgba(7,17,31,0.3)] transition hover:-translate-y-0.5 hover:brightness-110">
              Go to Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <Link to="/register" className="inline-flex min-h-[56px] items-center gap-3 rounded-xl bg-[#ff4f0a] px-10 py-4 text-[16px] font-black text-white shadow-[0_16px_34px_rgba(255,79,10,0.3)] transition hover:-translate-y-0.5 hover:brightness-105">
              Start free <ArrowRight size={18} />
            </Link>
          )}
          <Link to="/demo" className="inline-flex min-h-[56px] items-center rounded-xl border border-slate-200 bg-white px-10 py-4 text-[16px] font-black text-[#07111f] shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50">
            Book a demo
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.35 } },
          }}
          className="mt-14 flex flex-wrap items-center justify-center gap-4 lg:mt-20"
        >
          {HERO_CHIPS.map(({ icon: Icon, label, color }) => (
            <motion.div
              key={label}
              variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
              className="flex min-h-[52px] items-center gap-3 rounded-xl border border-slate-200 bg-white/88 px-6 text-[14px] font-black text-[#07111f] shadow-[0_8px_20px_rgba(80,55,40,0.06)] backdrop-blur"
            >
              <Icon size={18} className={color} strokeWidth={2.4} />
              {label}
            </motion.div>
          ))}
        </motion.div>

        <button
          type="button"
          onClick={() => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })}
          className="mt-14 flex flex-col items-center gap-3 text-[12px] font-bold text-slate-400 lg:mt-20"
        >
          Scroll to explore
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-[#07111f] shadow-[0_8px_22px_rgba(80,55,40,0.08)]">
            <ChevronDown size={19} />
          </span>
        </button>

        <div className="relative mt-2 w-full max-w-[1420px] pb-28 2xl:min-h-[560px]">
          <HeroDashboard />
          <FloatingDeployCard />
          <FloatingIncidentCard />
          <FloatingRoutingCard />
          <FloatingSummaryCard />
        </div>
      </div>
    </section>
  );
}

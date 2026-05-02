import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, ChevronDown } from 'lucide-react';
import { HERO_CHIPS } from './constants';
import { BackgroundOrnaments } from './shared/BackgroundOrnaments';
import { HeroDashboard } from './shared/HeroDashboard';
import { FloatingDeployCard, FloatingIncidentCard, FloatingRoutingCard, FloatingSummaryCard } from './shared/FloatingCards';

export function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pb-28 pt-[116px] sm:px-8">
      <BackgroundOrnaments />
      <div className="relative z-10 mx-auto flex max-w-[1260px] flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 inline-flex items-center gap-3 rounded-full border border-emerald-200 bg-emerald-50/80 px-4 py-2 shadow-[0_8px_22px_rgba(20,83,45,0.09)] backdrop-blur"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[12px] font-black text-emerald-700">Live monitoring active</span>
          <Activity size={15} className="text-emerald-500" />
        </motion.div>

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
          className="mt-6 max-w-[640px] text-[17px] font-semibold leading-8 text-slate-500 sm:text-[19px]"
        >
          AI-powered monitoring, incident response, and postmortems that help engineering teams move fast and stay reliable.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.75 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-4"
        >
          <Link to="/register" className="inline-flex min-h-[52px] items-center gap-3 rounded-xl bg-[#ff4f0a] px-9 py-4 text-[16px] font-black text-white shadow-[0_16px_34px_rgba(255,79,10,0.3)] transition hover:-translate-y-0.5 hover:brightness-105">
            Start free <ArrowRight size={18} />
          </Link>
          <Link to="/demo" className="inline-flex min-h-[52px] items-center rounded-xl border border-slate-200 bg-white px-9 py-4 text-[16px] font-black text-[#07111f] shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50">
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
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          {HERO_CHIPS.map(({ icon: Icon, label, color }) => (
            <motion.div
              key={label}
              variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
              className="flex min-h-[48px] items-center gap-3 rounded-xl border border-slate-200 bg-white/88 px-5 text-[14px] font-black text-[#07111f] shadow-[0_8px_20px_rgba(80,55,40,0.06)] backdrop-blur"
            >
              <Icon size={18} className={color} strokeWidth={2.4} />
              {label}
            </motion.div>
          ))}
        </motion.div>

        <button
          type="button"
          onClick={() => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })}
          className="mt-7 flex flex-col items-center gap-2 text-[12px] font-bold text-slate-400"
        >
          Scroll to explore
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-[#07111f] shadow-[0_8px_22px_rgba(80,55,40,0.08)]">
            <ChevronDown size={19} />
          </span>
        </button>

        <div className="relative mt-3 w-full max-w-[1060px]">
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

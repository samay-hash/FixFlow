import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { SparkLine } from './UIAtoms';
import { AlertLogos } from './Previews';

const CARD_ROTATIONS = {
  deploy: 2.5,
  incident: -2.5,
  routing: 2.5,
  summary: 2.5,
};

export function FloatingDeployCard() {
  return (
    <motion.div
      animate={{ y: [-6, 6, -6] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      style={{ rotate: CARD_ROTATIONS.deploy }}
      className="absolute left-0 top-[15%] z-30 hidden w-[220px] rounded-2xl border border-white/30 bg-[#111827] p-4 text-left text-white shadow-[0_28px_70px_rgba(7,17,31,0.34)] lg:block"
    >
      <div className="mb-4 flex items-center gap-3">
        <img src="/logos/github.svg" alt="GitHub" className="h-6 w-6 brightness-200 contrast-200" />
        <div>
          <p className="text-[14px] font-extrabold">GitHub Deploy</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-300">
            <span className="rounded-full bg-slate-700 px-2 py-0.5">main</span> <span className="ml-2">a1b2c3d</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-300">
        <CheckCircle size={15} className="text-emerald-400" />
        Deployed 10:16 AM <span className="text-slate-500">by joe</span>
      </div>
    </motion.div>
  );
}

export function FloatingIncidentCard() {
  return (
    <motion.div
      animate={{ y: [8, -8, 8] }}
      transition={{ duration: 5.6, repeat: Infinity, ease: 'easeInOut' }}
      style={{ rotate: CARD_ROTATIONS.incident }}
      className="absolute bottom-[20%] left-10 z-30 hidden w-[238px] rounded-2xl border border-white/10 bg-[#101827] p-4 text-left text-white shadow-[0_34px_80px_rgba(7,17,31,0.36)] lg:block"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500">
            <AlertTriangle size={15} />
          </span>
          <p className="text-[14px] font-extrabold">Live Incident</p>
        </div>
        <span className="rounded-lg bg-red-500/15 px-2 py-1 text-[10px] font-black text-red-400">500</span>
      </div>
      <div className="mb-2 rounded-xl bg-slate-950/50 px-3 py-2 text-[12px] font-semibold text-slate-200">dashboard.mypop.co</div>
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
        <span>High impact - 10:21 AM</span>
        <SparkLine className="h-8 w-20" color="#ff1d3d" strokeWidth={2.3} />
      </div>
    </motion.div>
  );
}

export function FloatingRoutingCard() {
  return (
    <motion.div
      animate={{ y: [-5, 5, -5] }}
      transition={{ duration: 5.9, repeat: Infinity, ease: 'easeInOut' }}
      style={{ rotate: CARD_ROTATIONS.routing }}
      className="absolute right-0 top-[22%] z-30 hidden w-[220px] rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-[0_30px_70px_rgba(80,55,40,0.18)] lg:block"
    >
      <p className="mb-4 text-[14px] font-extrabold text-[#07111f]">Alert Routing</p>
      <AlertLogos />
      <p className="mt-4 text-[11px] font-semibold text-slate-500">
        Escalation policy: <span className="ml-1 rounded-lg bg-red-50 px-2 py-1 font-black text-red-500">Critical</span>
      </p>
    </motion.div>
  );
}

export function FloatingSummaryCard() {
  return (
    <motion.div
      animate={{ y: [6, -6, 6] }}
      transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut' }}
      style={{ rotate: CARD_ROTATIONS.summary }}
      className="absolute bottom-[20%] right-10 z-30 hidden w-[230px] rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-[0_30px_70px_rgba(80,55,40,0.18)] lg:block"
    >
      <div className="mb-4 flex items-center gap-2">
        <p className="text-[14px] font-extrabold text-[#07111f]">AI Summary</p>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-500">Beta</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold text-[#07111f]">Root cause identified</p>
          <p className="mt-1 text-[10px] font-medium leading-relaxed text-slate-500">
            Database connection timeout on user-service causing 500 errors.
          </p>
        </div>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
          <Sparkles size={20} />
        </span>
      </div>
    </motion.div>
  );
}

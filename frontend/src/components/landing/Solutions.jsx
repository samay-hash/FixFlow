import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { LIFECYCLE } from './constants';

export function Solutions() {
  return (
    <section id="solutions" className="relative px-6 pb-20 scroll-mt-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-9 text-center text-[20px] font-black tracking-[-0.03em] text-[#07111f] md:text-[22px]">
          The complete incident lifecycle, guided by AI.
        </h2>
        <div className="grid gap-5 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr]">
          {LIFECYCLE.map((step, index) => (
            <React.Fragment key={step.id}>
              <motion.div whileHover={{ y: -4 }} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-[0_14px_36px_rgba(80,55,40,0.06)]">
                <span className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${step.bg} ${step.color}`}>
                  <step.icon size={24} />
                </span>
                <p className="mb-1 text-[14px] font-black text-[#07111f]">{step.id}</p>
                <p className="text-[11px] font-semibold leading-5 text-slate-500">{step.desc}</p>
              </motion.div>
              {index < LIFECYCLE.length - 1 && <span className="hidden items-center text-slate-400 md:flex"><ArrowRight size={20} /></span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

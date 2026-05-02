import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-[#fffaf5] px-6 py-24">
      <div className="absolute bottom-4 left-1/2 h-[130px] w-[70%] -translate-x-1/2 rounded-[999px] border border-orange-200 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.96)_0%,rgba(255,147,83,0.30)_38%,transparent_72%)]" />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h2 className="font-serif text-[46px] leading-[1] tracking-[-0.055em] text-[#07111f] md:text-[60px]">
          Bring clarity to <span className="text-[#ff4f0a]">every incident.</span>
        </h2>
        <p className="mt-5 text-[16px] font-semibold text-slate-500">Start free. No credit card. Set up in minutes.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/register" className="inline-flex h-13 items-center gap-3 rounded-xl bg-[#ff4f0a] px-10 py-4 text-[16px] font-black text-white shadow-[0_16px_34px_rgba(255,79,10,0.3)]">Start free <ArrowRight size={18} /></Link>
          <Link to="/demo" className="inline-flex h-13 items-center rounded-xl border border-slate-200 bg-white px-10 py-4 text-[16px] font-black text-[#07111f]">Book a demo</Link>
        </div>
      </div>
    </section>
  );
}

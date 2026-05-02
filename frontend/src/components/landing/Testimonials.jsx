import React from 'react';
import { Sparkles } from 'lucide-react';

export function Testimonials() {
  return (
    <section className="bg-[#fffaf5] px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
        {[
          { quote: '"FixFlow AI cut our mean time to resolution in half. The root cause surface is scary good."', name: 'Arjun Patel', role: 'SRE Lead, Rently', company: 'Rently', color: 'text-[#ff4f0a]' },
          { quote: '"The deploy-aware context is a game changer. We finally see the why, not just the what."', name: 'Maya Chen', role: 'Staff Engineer, Loopy', company: 'loopy', color: 'text-violet-600' },
          { quote: '"Our customers love the status page. Clear updates build real trust."', name: 'Lucas Martin', role: 'Engineering Manager, Paymate', company: 'paymate', color: 'text-emerald-600' },
        ].map((testimonial) => (
          <div key={testimonial.name} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_16px_44px_rgba(80,55,40,0.06)]">
            <div className="mb-5 flex gap-1 text-[#ff4f0a]" aria-label="5 star rating">
              {Array.from({ length: 5 }).map((_, index) => <Sparkles key={index} size={15} fill="currentColor" />)}
            </div>
            <p className="min-h-[86px] text-[14px] font-semibold leading-7 text-[#07111f]">{testimonial.quote}</p>
            <div className="mt-7 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-[13px] font-black text-orange-700">{testimonial.name[0]}</span>
                <span>
                  <span className="block text-[13px] font-black text-[#07111f]">{testimonial.name}</span>
                  <span className="text-[11px] font-semibold text-slate-500">{testimonial.role}</span>
                </span>
              </div>
              <strong className={`text-[18px] ${testimonial.color}`}>{testimonial.company}</strong>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

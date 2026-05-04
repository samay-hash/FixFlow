import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { PRICING } from './constants';
import { CurveField } from './shared/BackgroundOrnaments';

export function Pricing() {
  return (
    <section id="pricing" className="relative overflow-hidden bg-transparent px-6 py-24 scroll-mt-24">
      <div className="absolute -left-28 top-0 h-72 w-72 opacity-30"><CurveField /></div>
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 inline-flex rounded-full border border-orange-200 bg-white px-8 py-3 text-[14px] font-black text-slate-700">Simple, transparent pricing</div>
          <h2 className="font-serif text-[44px] leading-[1.02] tracking-[-0.05em] text-[#07111f] md:text-[62px]">
            Pricing that <span className="text-[#ff4f0a]">scales with your team.</span>
          </h2>
          <div className="mt-6 inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
            <button className="rounded-full bg-white px-8 py-2 text-[14px] font-black text-[#07111f] shadow-sm">Monthly</button>
            <button className="rounded-full px-8 py-2 text-[14px] font-black text-slate-500">Yearly <span className="text-emerald-600">Save 20%</span></button>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-4">
          {PRICING.map((tier) => (
            <div key={tier.plan} className={`relative flex min-h-[410px] flex-col rounded-2xl border bg-white p-7 shadow-[0_16px_44px_rgba(80,55,40,0.06)] ${tier.popular ? 'border-[#ff4f0a] shadow-[0_20px_60px_rgba(255,79,10,0.12)]' : 'border-slate-200'}`}>
              {tier.popular && <span className="absolute right-5 top-5 rounded-full bg-orange-50 px-4 py-1 text-[11px] font-black text-[#ff4f0a]">Most popular</span>}
              <h3 className="text-[20px] font-black text-[#07111f]">{tier.plan}</h3>
              <p className="mt-2 text-[13px] font-semibold leading-6 text-slate-500">{tier.sub}</p>
              <div className="mt-8">
                <strong className="text-[38px] tracking-[-0.04em] text-[#07111f]">{tier.price}</strong>
                <span className="ml-2 text-[12px] font-bold text-slate-500">{tier.priceNote}</span>
              </div>
              <ul className="mt-7 flex-1 space-y-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-[13px] font-semibold text-slate-600">
                    <CheckCircle size={16} className="shrink-0 text-emerald-500" /> {feature}
                  </li>
                ))}
              </ul>
              <Link to="/register" className={`mt-8 inline-flex h-12 items-center justify-center rounded-xl text-[14px] font-black transition hover:-translate-y-0.5 ${tier.popular ? 'bg-[#ff4f0a] text-white shadow-[0_14px_28px_rgba(255,79,10,0.25)]' : 'border border-slate-200 bg-white text-[#07111f]'}`}>
                {tier.btn}
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-[14px] font-semibold text-slate-500">All plans include FixFlow AI core, incident workspace, and deploy-aware RCA.</p>
      </div>
    </section>
  );
}

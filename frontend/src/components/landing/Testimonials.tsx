import { Sparkles } from 'lucide-react';

export function Testimonials() {
  return (
    <section className="bg-transparent px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
        {[
          { quote: '"FixFlow AI cut our mean time to resolution in half. The root cause surface is scary good."', name: 'Arjun Patel', gender: 'male', role: 'SRE Lead', company: 'Rently', color: 'text-[#ff4f0a]', avatar: '/avatars/arjun.png', companyLogo: '/companies/rently.png' },
          { quote: '"The deploy-aware context is a game changer. We finally see the why, not just the what."', name: 'Maya Chen', gender: 'female', role: 'Staff Engineer', company: 'Loopy', color: 'text-violet-600', avatar: '/avatars/maya.png', companyLogo: '/companies/loopy.png' },
          { quote: '"Our customers love the status page. Clear updates build real trust."', name: 'Lucas Martin', gender: 'male', role: 'Engineering Manager', company: 'Paymate', color: 'text-emerald-600', avatar: '/avatars/lucas.png', companyLogo: '/companies/paymate.png' },
        ].map((testimonial) => (
          <div key={testimonial.name} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_16px_44px_rgba(80,55,40,0.06)]">
            <div className="mb-5 flex gap-1 text-[#ff4f0a]" aria-label="5 star rating">
              {Array.from({ length: 5 }).map((_, index) => <Sparkles key={index} size={15} fill="currentColor" />)}
            </div>
            <p className="min-h-[86px] text-[14px] font-semibold leading-7 text-[#07111f]">{testimonial.quote}</p>
            <div className="mt-7 flex items-center justify-between gap-4 border-t border-slate-50 pt-6">
              <div className="flex items-center gap-3">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="h-11 w-11 rounded-full object-cover border border-slate-100" 
                />
                <div>
                  <span className="block text-[13px] font-black text-[#07111f]">
                    {testimonial.gender === 'male' ? 'Mr. ' : 'Ms. '}{testimonial.name}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">{testimonial.role} @ {testimonial.company}</span>
                </div>
              </div>
              <img 
                src={testimonial.companyLogo} 
                alt={testimonial.company} 
                className="h-7 max-w-[80px] object-contain opacity-80 grayscale transition hover:grayscale-0 hover:opacity-100" 
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

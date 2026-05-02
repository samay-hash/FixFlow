import React from 'react';
import { Logo } from './shared/Logo';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div>
            <Logo compact />
            <p className="mt-4 max-w-[280px] text-[13px] font-semibold leading-6 text-slate-500">
              AI-powered monitoring, incident response, and postmortems that help engineering teams move fast and stay reliable.
            </p>
            <div className="mt-5 flex max-w-[310px] overflow-hidden rounded-xl border border-slate-200 bg-white">
              <input aria-label="Work email" className="min-w-0 flex-1 px-4 py-3 text-[12px] font-semibold outline-none" placeholder="Enter your work email" type="email" />
              <button className="bg-[#ff4f0a] px-4 text-[12px] font-black text-white">Subscribe</button>
            </div>
          </div>
          {[
            { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'Changelog'] },
            { title: 'Resources', links: ['Docs', 'Guides', 'API Reference', 'Status'] },
            { title: 'Company', links: ['About us', 'Blog', 'Careers', 'Contact'] },
            { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Trust & Compliance'] },
          ].map((column) => (
            <div key={column.title}>
              <h4 className="mb-4 text-[13px] font-black text-[#07111f]">{column.title}</h4>
              <div className="space-y-3">
                {column.links.map((link) => (
                  <a key={link} href="#" className="block text-[13px] font-semibold text-slate-500 transition hover:text-[#07111f]">{link}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-slate-100 pt-6 text-[12px] font-semibold text-slate-400 md:flex-row">
          <span>(c) 2026 FixFlow AI Inc. All rights reserved.</span>
          <span>Made with care by the FixFlow AI team</span>
        </div>
      </div>
    </footer>
  );
}

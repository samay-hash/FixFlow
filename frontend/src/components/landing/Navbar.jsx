import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { Logo } from './shared/Logo';

export function Navbar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-[#fffaf5]/78 backdrop-blur-2xl">
      <div className="mx-auto flex h-[78px] max-w-[1280px] items-center justify-between px-5 sm:px-8">
        <Logo />
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 lg:flex">
          {['Product', 'Solutions', 'Integrations', 'Docs', 'Pricing'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="flex items-center gap-1 text-[14px] font-bold text-slate-700 transition-colors hover:text-[#07111f]">
              {item}
              {(item === 'Product' || item === 'Solutions') && <ChevronDown size={14} />}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden rounded-xl border border-slate-200 bg-white px-5 py-3 text-[14px] font-black text-[#07111f] shadow-sm transition hover:-translate-y-0.5 sm:inline-flex">
            Sign in
          </Link>
          <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-[#ff4f0a] px-5 py-3 text-[14px] font-black text-white shadow-[0_14px_24px_rgba(255,79,10,0.26)] transition hover:-translate-y-0.5 hover:brightness-105">
            Start free <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </nav>
  );
}

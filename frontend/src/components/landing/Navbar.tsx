import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowRight, LayoutDashboard } from 'lucide-react';
import { Logo } from './shared/Logo';

export function Navbar() {
  const  isAuthenticated  = false
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed inset-x-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isScrolled ? 'top-4 px-4 sm:px-6' : 'top-0'}`}>
      <div 
        className={`relative mx-auto flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isScrolled 
            ? 'h-[72px] max-w-[1100px] bg-white/90 backdrop-blur-xl border border-slate-200 shadow-[0_16px_40px_rgba(0,0,0,0.08)] rounded-full px-6 sm:px-8' 
            : 'h-[78px] max-w-[1280px] bg-white/20 backdrop-blur-2xl border-b border-[var(--border-subtle)] px-5 sm:px-8 rounded-none'
        }`}
      >
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
          {isAuthenticated ? (
            <Link 
              to="/dashboard" 
              className={`inline-flex items-center gap-2 bg-[#07111f] font-black text-white shadow-[0_14px_24px_rgba(7,17,31,0.26)] transition hover:-translate-y-0.5 hover:brightness-110 ${
                isScrolled ? 'px-4 py-2.5 text-[13px] rounded-full' : 'px-5 py-3 text-[14px] rounded-xl'
              }`}
            >
              <LayoutDashboard size={18} />
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`hidden border border-slate-200 bg-white font-black text-[#07111f] shadow-sm transition hover:-translate-y-0.5 sm:inline-flex ${
                  isScrolled ? 'px-4 py-2.5 text-[13px] rounded-full' : 'px-5 py-3 text-[14px] rounded-xl'
                }`}
              >
                Sign in
              </Link>
              <Link 
                to="/register" 
                className={`inline-flex items-center gap-2 bg-[#ff4f0a] font-black text-white shadow-[0_14px_24px_rgba(255,79,10,0.26)] transition hover:-translate-y-0.5 hover:brightness-105 ${
                  isScrolled ? 'px-4 py-2.5 text-[13px] rounded-full' : 'px-5 py-3 text-[14px] rounded-xl'
                }`}
              >
                Start free <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

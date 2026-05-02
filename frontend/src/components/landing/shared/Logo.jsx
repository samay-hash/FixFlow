import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { ACCENT } from '../constants';

export function Logo({ compact = false }) {
  return (
    <Link to="/" className="group flex items-center gap-3">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#07111f] shadow-[0_12px_30px_rgba(7,17,31,0.16)]">
        <Shield size={20} color={ACCENT} strokeWidth={2.7} />
        <span className="absolute inset-[6px] rounded-md border border-white/10" />
      </span>
      <span className={`${compact ? 'text-[19px]' : 'text-[25px]'} font-extrabold leading-none tracking-[-0.045em] text-[#07111f]`}>
        FixFlow <span className="font-bold text-[#ff4f0a]">AI</span>
      </span>
    </Link>
  );
}

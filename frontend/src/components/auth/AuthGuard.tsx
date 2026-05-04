import { Navigate, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[#fffaf5] text-[#07111f]">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#07111f] text-[#ff4f0a] shadow-[0_18px_45px_rgba(7,17,31,0.16)]">
          <ShieldCheck size={25} />
          <span className="absolute inset-[-7px] rounded-[24px] border-2 border-orange-100 border-t-[#ff4f0a] animate-spin" />
        </div>
        <p className="mt-5 text-[12px] font-black uppercase tracking-[0.16em] text-slate-500">
          Establishing secure session
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

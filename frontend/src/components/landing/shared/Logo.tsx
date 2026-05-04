import { Link } from 'react-router-dom';

interface LogoProps {
  compact?: boolean;
}

export function Logo({ compact = false }: LogoProps) {
  return (
    <Link to="/" className="group flex items-center gap-3">
      <img 
        src="/logo.png" 
        alt="FixFlow AI" 
        className={`${compact ? 'h-7 w-7' : 'h-10 w-10'} object-contain`} 
      />
      <span className={`${compact ? 'text-[19px]' : 'text-[25px]'} font-extrabold leading-none tracking-[-0.045em] text-[#07111f]`}>
        FixFlow <span className="font-bold text-[#ff4f0a]">AI</span>
      </span>
    </Link>
  );
}

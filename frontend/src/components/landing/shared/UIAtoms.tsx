
interface SparkLineProps {
  color?: string;
  className?: string;
  strokeWidth?: number;
}

export function SparkLine({ color = '#22c55e', className = '', strokeWidth = 2 }: SparkLineProps) {
  return (
    <svg viewBox="0 0 120 42" className={className} fill="none" aria-hidden="true">
      <path d="M2 31 C 14 34, 19 21, 29 25 S 45 31, 54 21 S 70 28, 78 17 S 96 17, 118 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface SmallBarsProps {
  status?: 'up' | 'degraded' | 'down';
}

export function SmallBars({ status = 'up' }: SmallBarsProps) {
  const bars = [8, 14, 11, 19, 15, 23, 18, 26, 21, 30];
  const color = status === 'degraded' ? 'bg-orange-400' : 'bg-emerald-500';

  return (
    <div className="flex h-9 items-end gap-[3px]" aria-hidden="true">
      {bars.map((height, index) => (
        <span key={index} className={`w-1 rounded-full ${color}`} style={{ height }} />
      ))}
    </div>
  );
}

interface AvatarGroupProps {
  size?: 'sm' | 'md';
}

export function AvatarGroup({ size = 'sm' }: AvatarGroupProps) {
  const dims = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  return (
    <div className="flex items-center">
      {[
        { name: 'Maya Chen', src: '/avatars/maya.png' },
        { name: 'Arjun Patel', src: '/avatars/arjun.png' },
        { name: 'Lucas Martin', src: '/avatars/lucas.png' },
      ].map((user, index) => (
        <img
          key={user.name}
          src={user.src}
          alt={user.name}
          className={`${dims} -ml-1.5 first:ml-0 rounded-full border-2 border-white object-cover shadow-sm`}
          style={{ zIndex: 10 - index }}
        />
      ))}
      <span className={`${dims} -ml-1.5 flex items-center justify-center rounded-full border-2 border-white bg-slate-50 text-[10px] font-bold text-slate-500 shadow-sm`}>+3</span>
    </div>
  );
}

interface StatusDotProps {
  color?: string;
}

export function StatusDot({ color = 'bg-emerald-500' }: StatusDotProps) {
  return <span className={`inline-flex h-2 w-2 rounded-full ${color}`} />;
}

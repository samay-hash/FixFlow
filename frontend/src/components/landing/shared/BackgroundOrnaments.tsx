
export function CurveField() {
  return (
    <svg viewBox="0 0 520 390" fill="none" className="h-full w-full">
      {Array.from({ length: 9 }).map((_, index) => (
        <path
          key={index}
          d={`M-20 ${120 + index * 18} C 130 ${20 + index * 10}, 230 ${250 - index * 5}, 550 ${90 + index * 16}`}
          stroke="#f7b77d"
          strokeWidth="1"
          opacity="0.55"
        />
      ))}
    </svg>
  );
}

export function BackgroundOrnaments() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,219,187,0.38),transparent_34%),linear-gradient(180deg,#fff6ed_0%,#fffdf9_32%,#fffaf5_100%)]" />
      <div
        className="absolute -left-10 top-[27%] h-64 w-64 opacity-50"
        style={{ backgroundImage: 'radial-gradient(#ffb17d 1px, transparent 1px)', backgroundSize: '13px 13px' }}
      />
      <div
        className="absolute right-4 top-[8%] hidden h-64 w-64 opacity-50 md:block"
        style={{ backgroundImage: 'radial-gradient(#ffb17d 1px, transparent 1px)', backgroundSize: '13px 13px' }}
      />
      <div className="absolute -left-32 top-[8%] h-[300px] w-[520px] opacity-30">
        <CurveField />
      </div>
      <div className="absolute -right-24 top-[24%] h-[390px] w-[520px] rotate-[10deg] opacity-40">
        <CurveField />
      </div>
    </div>
  );
}

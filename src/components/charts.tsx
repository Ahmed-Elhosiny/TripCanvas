import { useEffect, useState } from 'react';

/* ---------------- donut ---------------- */

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export function Donut({
  data,
  size = 190,
  thickness = 22,
  centerTop,
  centerBottom,
}: {
  data: DonutSlice[];
  size?: number;
  thickness?: number;
  centerTop: string;
  centerBottom: string;
}) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setProgress(1));
    return () => cancelAnimationFrame(raf);
  }, []);

  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  let acc = 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-mist)" strokeWidth={thickness} />
        {total > 0 &&
          data.map((slice) => {
            const frac = slice.value / total;
            const dash = frac * C * progress;
            const offset = -acc * C;
            acc += frac;
            if (frac === 0) return null;
            return (
              <circle
                key={slice.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={slice.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
                style={{ transition: 'stroke-dasharray 900ms cubic-bezier(0.2,0.7,0.2,1), stroke-dashoffset 900ms cubic-bezier(0.2,0.7,0.2,1)' }}
              />
            );
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="tnum font-display text-[26px] font-semibold leading-none text-ink">{centerTop}</p>
        <p className="mt-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-fog">{centerBottom}</p>
      </div>
    </div>
  );
}

/* ---------------- horizontal bar ---------------- */

export function BarRow({
  label,
  valueLabel,
  pct,
  color,
  over,
}: {
  label: string;
  valueLabel: string;
  pct: number;
  color: string;
  over?: boolean;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="flex items-center gap-2 text-[13px] font-semibold text-ink">
          <span className="h-2 w-2 rounded-[3px]" style={{ background: color }} />
          {label}
        </span>
        <span className={`tnum font-mono text-[11.5px] font-bold ${over ? 'text-persimmon' : 'text-moss'}`}>{valueLabel}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-mist">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${Math.min(100, pct)}%`, background: over ? 'var(--color-persimmon)' : color }}
        />
      </div>
    </div>
  );
}

/* ---------------- day activity spark bars ---------------- */

export function DaySpark({ counts, activeIndex, onSelect }: { counts: number[]; activeIndex: number; onSelect: (i: number) => void }) {
  const max = Math.max(1, ...counts);
  return (
    <div className="flex h-16 items-end gap-1.5" role="group" aria-label="Activities per day">
      {counts.map((c, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`Day ${i + 1}: ${c} activities`}
          className="group flex h-full flex-1 flex-col items-center justify-end gap-1"
        >
          <span
            className={`w-full max-w-[26px] rounded-t-[4px] transition-all duration-500 ${
              i === activeIndex ? 'bg-persimmon' : c === 0 ? 'bg-mist group-hover:bg-line' : 'bg-pine/70 group-hover:bg-pine'
            }`}
            style={{ height: `${Math.max(8, (c / max) * 100)}%` }}
          />
          <span className={`font-mono text-[9px] font-bold ${i === activeIndex ? 'text-persimmon' : 'text-fog'}`}>{i + 1}</span>
        </button>
      ))}
    </div>
  );
}

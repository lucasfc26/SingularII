import { useMemo, useRef, useState } from 'react';
import { formatCompact, formatNumber } from '@/utils/format';

/** Single-series area chart with crosshair + tooltip. */
export function AreaChart({ data, label, height = 220 }: { data: { label: string; value: number }[]; label: string; height?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = height;
  const pad = { t: 16, r: 12, b: 26, l: 44 };
  const max = Math.max(...data.map((d) => d.value)) * 1.1;
  const x = (i: number) => pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.value)}`).join(' ');
  const area = `${line} L${x(data.length - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z`;
  const ticks = useMemo(() => [0, 0.5, 1].map((k) => Math.round(max * k)), [max]);

  const onMove = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  };

  return (
    <div className="relative">
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="w-full touch-none" role="img" aria-label={label} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="area-g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--primary)" stopOpacity=".28" />
            <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--line)" />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">{formatCompact(t)}</text>
          </g>
        ))}
        {data.map((d, i) => (i % 2 === 0 || i === data.length - 1) && (
          <text key={d.label} x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">{d.label}</text>
        ))}
        <path d={area} fill="url(#area-g)" />
        <path d={line} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinejoin="round" />
        <circle cx={x(data.length - 1)} cy={y(data[data.length - 1]!.value)} r="4" fill="var(--primary)" stroke="var(--surface)" strokeWidth="2" />
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="var(--line-strong)" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(data[hover]!.value)} r="5" fill="var(--primary)" stroke="var(--surface)" strokeWidth="2" />
          </g>
        )}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute top-0 rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-lg" style={{ left: `clamp(0px, calc(${(x(hover) / W) * 100}% - 60px), calc(100% - 120px))` }}>
          <p className="font-mono text-muted">{data[hover]!.label}</p>
          <p className="font-medium text-fg">{formatNumber(data[hover]!.value)}</p>
        </div>
      )}
      <table className="sr-only">
        <caption>{label}</caption>
        <tbody>{data.map((d) => <tr key={d.label}><th>{d.label}</th><td>{d.value}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

/** Horizontal bars, single hue, direct value labels, hover highlight. */
export function BarList({ data, format = formatNumber, max: maxProp }: { data: { label: string; value: number; total?: number }[]; format?: (n: number) => string; max?: number }) {
  const max = maxProp ?? Math.max(...data.map((d) => d.total ?? d.value), 1);
  return (
    <ul className="space-y-3.5">
      {data.map((d) => (
        <li key={d.label} className="group" title={`${d.label}: ${format(d.value)}${d.total ? ` de ${format(d.total)}` : ''}`}>
          <div className="mb-1.5 flex justify-between gap-3 text-[13px]">
            <span className="truncate text-fg/85">{d.label}</span>
            <span className="font-mono text-xs text-fg tabular-nums">{format(d.value)}{d.total ? <span className="text-muted"> / {format(d.total)}</span> : null}</span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-fg/[0.06]">
            {d.total && <div className="absolute inset-y-0 left-0 rounded-full bg-primary/15" style={{ width: `${(d.total / max) * 100}%` }} />}
            <div className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[filter] group-hover:brightness-125" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${28 - ((v - min) / (max - min || 1)) * 24}`).join(' ');
  return (
    <svg viewBox="0 0 100 30" className="h-8 w-24" preserveAspectRatio="none" aria-hidden>
      <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

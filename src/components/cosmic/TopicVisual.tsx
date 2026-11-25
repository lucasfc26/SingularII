import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { Topic, TopicVisualKind } from '@/types';
import { SmartImage } from '../ui/Misc';
import { spotlightHandler } from '@/hooks/dom';
import { cn } from '@/utils/cn';

const HUE: Record<TopicVisualKind, string> = {
  pendulum: '#F0A35E', wave: '#A78BFA', spacetime: '#6C8CFF', star: '#FFB562', cosmos: '#53DDF5',
  telescope: '#E7C35A', particles: '#F27A8A', blackhole: '#FF9D4D', darkmatter: '#8FA2FF', darkenergy: '#5FD3A0',
};

const hex = (cx: number, cy: number, r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(' ');

/** A distinct, lightweight SVG composition for each field of science. */
export function TopicVisual({ kind, className }: { kind: TopicVisualKind; className?: string }) {
  const c = HUE[kind];
  const common = { fill: 'none', stroke: c, strokeWidth: 0.8 } as const;
  return (
    <svg viewBox="0 0 200 200" className={cn('pointer-events-none', className)} aria-hidden>
      {kind === 'pendulum' && (
        <g>
          <line x1="40" y1="30" x2="160" y2="30" {...common} strokeOpacity=".5" />
          <path d="M55 150 A 100 100 0 0 0 145 150" {...common} strokeDasharray="2 4" />
          <g style={{ transformOrigin: '100px 30px' }} className="[animation:pendulum_3.2s_ease-in-out_infinite_alternate]">
            <line x1="100" y1="30" x2="100" y2="148" {...common} />
            <circle cx="100" cy="152" r="9" fill={c} fillOpacity=".9" />
          </g>
          <circle cx="100" cy="30" r="2.5" fill={c} />
        </g>
      )}
      {kind === 'wave' && (
        <g>
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M10 100 ${Array.from({ length: 18 }, (_, k) => `Q ${15 + k * 10} ${100 + (k % 2 ? -1 : 1) * (40 - Math.abs(k - 9) * 4) * (1 - i * 0.3)} ${20 + k * 10} 100`).join(' ')}`} {...common} strokeOpacity={1 - i * 0.3} strokeDasharray="300" className="[animation:dash_6s_linear_infinite]" style={{ animationDelay: `${i * -2}s` }} />
          ))}
          <path d="M10 100 C 60 100, 70 30, 100 30 S 140 100, 190 100" {...common} strokeOpacity=".35" />
        </g>
      )}
      {kind === 'spacetime' && (
        <g>
          {Array.from({ length: 9 }, (_, i) => {
            const y = 40 + i * 16;
            const d = 30 / (1 + Math.abs(i - 4) * 0.8);
            return <path key={`h${i}`} d={`M10 ${y} Q 100 ${y + d} 190 ${y}`} {...common} strokeOpacity=".45" />;
          })}
          {Array.from({ length: 9 }, (_, i) => {
            const x = 20 + i * 20;
            const d = (x - 100) * -0.25;
            return <path key={`v${i}`} d={`M${x} 30 Q ${x + d} 110 ${x} 190`} {...common} strokeOpacity=".45" />;
          })}
          <circle cx="100" cy="108" r="13" fill={c} fillOpacity=".85" />
          <ellipse cx="100" cy="108" rx="44" ry="12" {...common} className="origin-center [animation:spin-slow_14s_linear_infinite]" />
        </g>
      )}
      {kind === 'star' && (
        <g>
          {[18, 32, 48, 66].map((r, i) => <circle key={r} cx="100" cy="100" r={r} {...common} strokeOpacity={0.9 - i * 0.2} strokeDasharray={i % 2 ? '1 5' : undefined} />)}
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2;
            return <line key={i} x1={100 + Math.cos(a) * 22} y1={100 + Math.sin(a) * 22} x2={100 + Math.cos(a) * (i % 2 ? 40 : 56)} y2={100 + Math.sin(a) * (i % 2 ? 40 : 56)} {...common} strokeOpacity=".5" />;
          })}
          <circle cx="100" cy="100" r="12" fill={c} />
        </g>
      )}
      {kind === 'cosmos' && (
        <g>
          {[14, 30, 50, 74].map((r, i) => <circle key={r} cx="100" cy="100" r={r} {...common} strokeOpacity={1 - i * 0.2} className="[animation:expand_5s_ease-out_infinite]" style={{ animationDelay: `${i * -1.25}s`, transformOrigin: '100px 100px' }} />)}
          {Array.from({ length: 22 }, (_, i) => {
            const a = i * 2.39;
            const r = 12 + i * 3.6;
            return <circle key={i} cx={100 + Math.cos(a) * r} cy={100 + Math.sin(a) * r} r={i % 4 ? 1.2 : 2.2} fill={c} />;
          })}
        </g>
      )}
      {kind === 'telescope' && (
        <g className="origin-center [animation:spin-slow_60s_linear_infinite]">
          {[[0, 0], [0, -1], [0, 1], [1, -0.5], [1, 0.5], [-1, -0.5], [-1, 0.5], [0, -2], [0, 2], [1, -1.5], [1, 1.5], [-1, -1.5], [-1, 1.5], [2, -1], [2, 0], [2, 1], [-2, -1], [-2, 0], [-2, 1]].map(([q, r], i) =>
            i === 0 ? null : <polygon key={i} points={hex(100 + q! * 26, 100 + r! * 30, 14.5)} fill={c} fillOpacity={0.12 + (i % 5) * 0.05} stroke={c} strokeWidth=".8" />,
          )}
          <line x1="100" y1="10" x2="100" y2="190" {...common} strokeOpacity=".25" />
          <line x1="22" y1="55" x2="178" y2="145" {...common} strokeOpacity=".25" />
          <line x1="22" y1="145" x2="178" y2="55" {...common} strokeOpacity=".25" />
        </g>
      )}
      {kind === 'particles' && (
        <g>
          {Array.from({ length: 9 }, (_, i) => {
            const a = (i / 9) * Math.PI * 2;
            const k = i % 2 ? 1 : -1;
            const x2 = 100 + Math.cos(a) * 85;
            const y2 = 100 + Math.sin(a) * 85;
            const qx = 100 + Math.cos(a + k * 0.7) * 55;
            const qy = 100 + Math.sin(a + k * 0.7) * 55;
            return <path key={i} d={`M100 100 Q ${qx} ${qy} ${x2} ${y2}`} {...common} strokeOpacity=".8" strokeDasharray="200" className="[animation:dash_4s_ease-out_infinite]" style={{ animationDelay: `${i * -0.4}s` }} />;
          })}
          <path d="M100 100 m0 0 a6 6 0 1 1 12 0 a10 10 0 1 1 -20 0 a14 14 0 1 1 28 0" {...common} />
          <circle cx="100" cy="100" r="3" fill={c} />
        </g>
      )}
      {kind === 'blackhole' && (
        <g>
          <ellipse cx="100" cy="100" rx="88" ry="20" {...common} strokeOpacity=".4" />
          <ellipse cx="100" cy="100" rx="70" ry="15" stroke={c} strokeWidth="5" fill="none" strokeOpacity=".5" />
          <circle cx="100" cy="100" r="38" fill="none" stroke={c} strokeWidth="3" strokeOpacity=".8" />
          <circle cx="100" cy="100" r="33" fill="#020205" />
          <path d="M30 100 Q 100 128 170 100" stroke={c} strokeWidth="5" fill="none" strokeOpacity=".9" />
        </g>
      )}
      {kind === 'darkmatter' && (
        <g>
          {[30, 50, 70, 88].map((r, i) => <circle key={r} cx="100" cy="100" r={r} {...common} strokeDasharray="1.5 4" strokeOpacity={0.9 - i * 0.18} className="origin-center [animation:spin-slow_linear_infinite]" style={{ animationDuration: `${30 + i * 15}s` }} />)}
          <ellipse cx="100" cy="100" rx="40" ry="12" fill={c} fillOpacity=".25" transform="rotate(-20 100 100)" />
          <circle cx="100" cy="100" r="5" fill={c} />
          <path d="M20 170 C 40 120, 60 112, 180 110" {...common} strokeWidth="1.4" />
          <path d="M20 170 C 40 120, 70 140, 180 175" {...common} strokeDasharray="3 3" strokeOpacity=".5" />
        </g>
      )}
      {kind === 'darkenergy' && (
        <g>
          {Array.from({ length: 7 }, (_, i) => {
            const x = 30 + i * 24;
            const ry = 6 + i * i * 1.7;
            return <ellipse key={i} cx={x} cy="100" rx="4" ry={ry} {...common} strokeOpacity={0.4 + i * 0.08} />;
          })}
          <path d="M26 94 C 90 90, 140 60, 182 12" {...common} />
          <path d="M26 106 C 90 110, 140 140, 182 188" {...common} />
          <circle cx="26" cy="100" r="3" fill={c} />
        </g>
      )}
    </svg>
  );
}

export function TopicCard({ topic, className, size = 'normal' }: { topic: Topic; className?: string; size?: 'normal' | 'large' }) {
  return (
    <Link
      to={`/categorias/${topic.slug}`}
      onMouseMove={spotlightHandler}
      className={cn('spotlight group relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-[18px] border border-line bg-[#070912] p-6 text-[#F4F6FC] transition-[border-color] hover:border-line-strong', className)}
    >
      <SmartImage src={topic.cover} alt="" className="absolute inset-0 !bg-[#070912] opacity-35 transition-opacity duration-700 group-hover:opacity-55" imgClassName="group-hover:scale-105 transition-transform duration-[1.6s] saturate-[0.8]" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_100%_0%,transparent,#05060A_70%)]" />
      <TopicVisual kind={topic.visual} className={cn('absolute -top-4 -right-4 opacity-80 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3', size === 'large' ? 'size-72' : 'size-48')} />
      <div className="relative z-[2] flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.16em] text-white/60 uppercase">{topic.keyFigure.label}</span>
      </div>
      <div className="relative z-[2]">
        <p className="mb-3 font-mono text-[13px] text-[#53DDF5]">{topic.keyFigure.value}</p>
        <h3 className={cn('font-display leading-tight font-semibold', size === 'large' ? 'text-3xl md:text-4xl' : 'text-2xl')}>{topic.name}</h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-white/65">{size === 'large' ? topic.description : topic.tagline}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/85 transition group-hover:text-white">
          Explorar tema <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}

import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type Tone = 'neutral' | 'primary' | 'accent' | 'secondary' | 'success' | 'warning' | 'danger';
const tones: Record<Tone, string> = {
  neutral: 'bg-fg/[0.06] text-muted border-line',
  primary: 'bg-primary/12 text-primary border-primary/25',
  accent: 'bg-accent/12 text-accent border-accent/25',
  secondary: 'bg-secondary/12 text-secondary border-secondary/25',
  success: 'bg-success/12 text-success border-success/25',
  warning: 'bg-warning/12 text-warning border-warning/25',
  danger: 'bg-danger/12 text-danger border-danger/25',
};

export function Badge({ tone = 'neutral', children, className, dot, style }: { tone?: Tone; children: ReactNode; className?: string; dot?: boolean; style?: React.CSSProperties }) {
  return (
    <span style={style} className={cn('inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10.5px] font-medium tracking-wide uppercase', tones[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

/** Category label tinted with the category hue. */
export function HueTag({ hue, children, className }: { hue: string; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 font-mono text-[10.5px] font-medium tracking-[0.14em] uppercase', className)}
      style={{ color: `color-mix(in oklab, ${hue} 78%, var(--text))` }}
    >
      <span className="size-1.5 rounded-full" style={{ background: hue, boxShadow: `0 0 8px ${hue}` }} aria-hidden />
      {children}
    </span>
  );
}

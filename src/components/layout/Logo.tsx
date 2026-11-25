import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-7', className)} aria-hidden>
      <defs>
        <radialGradient id="lm-g" cx="50%" cy="50%" r="50%">
          <stop offset="0.5" stopColor="var(--accent)" stopOpacity="0" />
          <stop offset="0.62" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill="url(#lm-g)" opacity="0.9" />
      <ellipse cx="16" cy="16" rx="14.5" ry="3.6" fill="none" stroke="var(--secondary)" strokeWidth="1.6" transform="rotate(-18 16 16)" />
      <circle cx="16" cy="16" r="5.2" fill="var(--bg)" stroke="var(--text)" strokeOpacity=".5" strokeWidth=".6" />
    </svg>
  );
}

export function Logo({ className, forceDark, compact }: { className?: string; forceDark?: boolean; compact?: boolean }) {
  const content = (
    <span className={cn('flex items-center gap-2.5', forceDark && '[--accent:#53DDF5] [--primary:#6C8CFF] [--secondary:#A78BFA] [--bg:#05060A] [--text:#F4F6FC]', className)}>
      <LogoMark />
      {!compact && (
        <span className="font-display text-[17px] leading-none font-semibold tracking-tight" style={forceDark ? { color: '#F4F6FC' } : undefined}>
          Horizonte
        </span>
      )}
    </span>
  );
  if (forceDark) return content;
  return (
    <Link to="/" aria-label="Horizonte — página inicial" className="rounded-lg">
      {content}
    </Link>
  );
}

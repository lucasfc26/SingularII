import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { cn } from '@/utils/cn';
import { initials } from '@/utils/format';

/** Lazy image with fade-in and graceful fallback. */
export function SmartImage({ src, alt, className, imgClassName, priority, style }: { src: string; alt: string; className?: string; imgClassName?: string; priority?: boolean; style?: React.CSSProperties }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <div className={cn('relative overflow-hidden bg-bg-2', className)} style={style}>
      {!loaded && !failed && <div className="skeleton absolute inset-0 rounded-none" aria-hidden />}
      {failed ? (
        <div className="nebula-bg star-dust absolute inset-0 grid place-items-center text-muted">
          <ImageOff className="size-6 opacity-60" aria-label={alt} />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn('size-full object-cover transition-[opacity,transform,filter] duration-700 ease-out', loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md', imgClassName)}
        />
      )}
    </div>
  );
}

export function Avatar({ name, hue = '#6C8CFF', size = 36, className }: { name: string; hue?: string; size?: number; className?: string }) {
  return (
    <span
      className={cn('inline-grid shrink-0 place-items-center rounded-full font-display font-semibold text-white', className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `radial-gradient(circle at 30% 25%, color-mix(in oklab, ${hue} 60%, white), ${hue} 55%, color-mix(in oklab, ${hue} 55%, black))`,
        boxShadow: `0 0 0 1px color-mix(in oklab, ${hue} 50%, transparent), 0 4px 14px -4px ${hue}`,
      }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

export function SectionHeader({ eyebrow, title, description, action, align = 'left', className, id }: { eyebrow?: string; title: ReactNode; description?: ReactNode; action?: ReactNode; align?: 'left' | 'center'; className?: string; id?: string }) {
  return (
    <div className={cn('mb-10 flex flex-col gap-6 md:mb-14', align === 'center' ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between', className)}>
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h2 id={id} className="font-display text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.02] font-semibold">{title}</h2>
        {description && <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Segmented<T extends string>({ options, value, onChange, className, layoutId = 'seg' }: { options: { value: T; label: ReactNode; count?: number }[]; value: T; onChange: (v: T) => void; className?: string; layoutId?: string }) {
  return (
    <div role="tablist" className={cn('no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-xl border border-line bg-surface/50 p-1', className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn('relative shrink-0 rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-colors', active ? 'text-fg' : 'text-muted hover:text-fg')}
          >
            {active && <motion.span layoutId={layoutId} className="absolute inset-0 rounded-lg border border-line-strong bg-fg/[0.07]" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
            <span className="relative flex items-center gap-1.5">
              {o.label}
              {o.count !== undefined && <span className="font-mono text-[10px] text-muted">{o.count}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Chip({ active, onClick, children, hue }: { active?: boolean; onClick?: () => void; children: ReactNode; hue?: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] transition-all duration-200',
        active ? 'border-transparent bg-fg text-bg' : 'border-line text-muted hover:border-line-strong hover:text-fg',
      )}
    >
      {hue && <span className="size-1.5 rounded-full" style={{ background: hue }} aria-hidden />}
      {children}
    </button>
  );
}

export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Paginação">
      <button onClick={() => onChange(page - 1)} disabled={page === 1} className="grid size-9 place-items-center rounded-lg border border-line text-muted transition hover:text-fg disabled:opacity-40" aria-label="Página anterior">
        <ChevronLeft className="size-4" />
      </button>
      {nums.map((n, i) => (
        <span key={n} className="flex items-center gap-1.5">
          {i > 0 && n - nums[i - 1]! > 1 && <span className="px-1 text-muted">…</span>}
          <button
            onClick={() => onChange(n)}
            aria-current={n === page ? 'page' : undefined}
            className={cn('size-9 rounded-lg font-mono text-sm transition', n === page ? 'bg-fg text-bg' : 'border border-line text-muted hover:text-fg')}
          >
            {n}
          </button>
        </span>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page === pages} className="grid size-9 place-items-center rounded-lg border border-line text-muted transition hover:text-fg disabled:opacity-40" aria-label="Próxima página">
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div>
      <p className="font-mono text-[10.5px] tracking-[0.14em] text-muted uppercase">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-fg">{value}</p>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'glow';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const base =
  'group/btn relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2';

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-on-primary shadow-[0_8px_24px_-10px_var(--primary)] hover:shadow-[0_10px_32px_-8px_var(--primary)] hover:brightness-110',
  glow:
    'text-on-primary bg-[linear-gradient(110deg,var(--primary),var(--secondary)_60%,var(--accent))] bg-[length:200%_100%] bg-left hover:bg-right shadow-[0_10px_34px_-12px_var(--primary)] transition-[background-position,box-shadow,transform] duration-500',
  secondary: 'bg-surface-2 text-fg border border-line hover:border-line-strong hover:bg-surface',
  outline: 'border border-line-strong text-fg hover:bg-fg/5 hover:border-fg/30',
  ghost: 'text-muted hover:text-fg hover:bg-fg/[0.06]',
  danger: 'bg-danger/90 text-white hover:bg-danger',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] rounded-lg',
  md: 'h-10 px-4 text-sm rounded-[10px]',
  lg: 'h-12 px-6 text-[15px] rounded-xl',
  icon: 'size-10 rounded-[10px]',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  to?: string;
  href?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, to, href, icon, iconRight, className, children, disabled, ...rest },
  ref,
) {
  const cls = cn(base, variants[variant], sizes[size], className);
  const content = (
    <>
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
      {iconRight && <span className="transition-transform duration-300 group-hover/btn:translate-x-0.5">{iconRight}</span>}
    </>
  );
  if (to) return <Link to={to} className={cls}>{content}</Link>;
  if (href)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {content}
      </a>
    );
  return (
    <button ref={ref} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  );
});

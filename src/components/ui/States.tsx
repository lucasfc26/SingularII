import type { ReactNode } from 'react';
import { AlertTriangle, Telescope } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/utils/cn';

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn('skeleton', className)} style={style} aria-hidden />;
}

export function CardSkeleton({ horizontal }: { horizontal?: boolean }) {
  return (
    <div className={cn('panel overflow-hidden', horizontal && 'flex gap-4 p-3')} aria-hidden>
      <Skeleton className={cn(horizontal ? 'size-24 shrink-0' : 'aspect-[16/10] rounded-none')} />
      <div className={cn('flex-1 space-y-3', !horizontal && 'p-5')}>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-11/12" />
        <Skeleton className="h-5 w-2/3" />
        {!horizontal && <Skeleton className="h-3 w-1/2" />}
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid gap-5 sm:grid-cols-2 lg:grid-cols-3', className)} role="status" aria-label="Carregando conteúdo">
      {Array.from({ length: count }, (_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="shell max-w-3xl space-y-5 pt-36" role="status" aria-label="Carregando artigo">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="mt-8 aspect-[16/8] w-full rounded-2xl" />
      {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-4" style={{ width: `${70 + ((i * 37) % 30)}%` }} />)}
    </div>
  );
}

export function EmptyState({ title, description, action, icon }: { title: string; description?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="panel flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="relative mb-5 grid size-16 place-items-center rounded-full border border-line">
        <div className="orbit-lines absolute -inset-6 rounded-full opacity-60" aria-hidden />
        {icon ?? <Telescope className="size-7 text-muted" aria-hidden />}
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="panel flex flex-col items-center px-6 py-14 text-center" role="alert">
      <AlertTriangle className="mb-4 size-8 text-warning" aria-hidden />
      <h3 className="font-display text-lg font-semibold">Perdemos o sinal</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted">{message ?? 'Não foi possível carregar este conteúdo.'}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-6" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

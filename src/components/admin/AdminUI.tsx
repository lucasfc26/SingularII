import type { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Permission } from '@/utils/permissions';
import { Badge } from '../ui/Badge';
import type { PublishStatus } from '@/types';
import { cn } from '@/utils/cn';

export function AdminPageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** Render children only when the (simulated) role grants the permission. */
export function Can({ perm, children, fallback = null }: { perm: Permission; children: ReactNode; fallback?: ReactNode }) {
  const { can } = useAuth();
  return <>{can(perm) ? children : fallback}</>;
}

export function NoPermission({ what }: { what: string }) {
  return (
    <div className="panel flex flex-col items-center px-6 py-16 text-center">
      <Lock className="mb-4 size-8 text-muted" />
      <h2 className="font-display text-lg font-semibold">Acesso restrito</h2>
      <p className="mt-1 max-w-sm text-sm text-muted">Seu papel atual não tem permissão para {what}. Peça acesso a um administrador ou simule outro papel no topo da página.</p>
    </div>
  );
}

export function StatusBadge({ status }: { status: PublishStatus }) {
  return status === 'published' ? <Badge tone="success" dot>Publicado</Badge> : status === 'scheduled' ? <Badge tone="primary" dot>Agendado</Badge> : <Badge tone="warning" dot>Rascunho</Badge>;
}

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('panel overflow-x-auto', className)}>
      <table className="w-full min-w-[640px] text-left text-sm">{children}</table>
    </div>
  );
}
export const Th = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <th className={cn('border-b border-line px-4 py-3 font-mono text-[10.5px] font-medium tracking-[0.12em] text-muted uppercase', className)}>{children}</th>
);
export const Td = ({ children, className }: { children?: ReactNode; className?: string }) => <td className={cn('border-b border-line px-4 py-3 align-middle', className)}>{children}</td>;

export function RowActions({ children }: { children: ReactNode }) {
  return <div className="flex justify-end gap-1">{children}</div>;
}
export function IconAction({ label, onClick, children, danger, disabled }: { label: string; onClick: () => void; children: ReactNode; danger?: boolean; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} title={disabled ? 'Sem permissão' : label} aria-label={label} className={cn('grid size-8 place-items-center rounded-lg text-muted transition hover:bg-fg/[0.06] disabled:opacity-30', danger ? 'hover:text-danger' : 'hover:text-fg')}>
      {children}
    </button>
  );
}

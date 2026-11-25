import { useState } from 'react';
import { Search } from 'lucide-react';
import type { AccountStatus, User } from '@/types';
import { db, eventsService, usersService } from '@/services';
import { useQuery } from '@/hooks/useQuery';
import { useDebounced, useDocumentTitle } from '@/hooks/dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { topics } from '@/data/taxonomy';
import { AdminPageHeader, NoPermission, Table, Td, Th } from '@/components/admin/AdminUI';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Form';
import { Avatar } from '@/components/ui/Misc';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, Skeleton } from '@/components/ui/States';
import { formatDate, relativeTime } from '@/utils/format';
import { ROLE_LABEL } from '@/utils/permissions';

export const AccountBadge = ({ s }: { s: AccountStatus }) => (s === 'active' ? <Badge tone="success" dot>Ativa</Badge> : s === 'pending' ? <Badge tone="warning" dot>Pendente</Badge> : <Badge tone="danger" dot>Suspensa</Badge>);

export default function AdminUsers() {
  useDocumentTitle('Usuários');
  const { can } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const dq = useDebounced(q);
  const { data, loading } = useQuery(() => usersService.list({ q: dq, status: status || undefined }), [dq, status], ['users']);
  const [sel, setSel] = useState<User | null>(null);
  const history = useQuery(async () => {
    if (!sel) return [];
    const [regs, events] = await Promise.all([eventsService.myRegistrations(sel.id, sel.email), db.events.list()]);
    return regs.map((r) => ({ r, e: events.find((x) => x.id === r.eventId) })).filter((x) => x.e);
  }, [sel?.id], ['registrations']);

  if (!can('users:view')) return <NoPermission what="ver usuários" />;

  const setAccount = async (u: User, s: AccountStatus) => {
    if (s === 'suspended' && !(await confirm({ title: 'Suspender conta?', description: `${u.name} não poderá entrar nem se inscrever em eventos.`, confirmLabel: 'Suspender' }))) return;
    const nu = await usersService.update(u.id, { status: s });
    setSel(nu);
    toast({ title: 'Status da conta atualizado' });
  };

  return (
    <>
      <AdminPageHeader title="Usuários" description={`${data?.length ?? '…'} contas cadastradas nesta demonstração.`} />
      <div className="mb-4 grid gap-2 sm:grid-cols-[300px_200px]">
        <Input leading={<Search className="size-4" />} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nome, e-mail ou cidade" aria-label="Buscar usuários" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status da conta"><option value="">Todos os status</option><option value="active">Ativas</option><option value="pending">Pendentes</option><option value="suspended">Suspensas</option></Select>
      </div>
      {loading || !data ? <Skeleton className="h-96" /> : data.length === 0 ? <EmptyState title="Nenhum usuário encontrado" /> : (
        <Table>
          <thead><tr><Th>Usuário</Th><Th>Papel</Th><Th>Status</Th><Th>Cadastro</Th><Th>Último acesso</Th></tr></thead>
          <tbody>
            {data.map((u) => (
              <tr key={u.id} onClick={() => setSel(u)} className="cursor-pointer hover:bg-fg/[0.03]">
                <Td><div className="flex items-center gap-3"><Avatar name={u.name} hue={u.hue} size={32} /><div><button className="font-medium hover:text-primary">{u.name}</button><p className="text-xs text-muted">{u.email}</p></div></div></Td>
                <Td className="text-[13px]">{ROLE_LABEL[u.role]}</Td>
                <Td><AccountBadge s={u.status} /></Td>
                <Td className="font-mono text-xs text-muted">{formatDate(u.createdAt)}</Td>
                <Td className="font-mono text-xs text-muted">{relativeTime(u.lastSeenAt)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={!!sel} onClose={() => setSel(null)} side title="Detalhes do usuário">
        {sel && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar name={sel.name} hue={sel.hue} size={56} />
              <div>
                <p className="font-display text-xl font-semibold">{sel.name}</p>
                <p className="text-sm text-muted">{sel.email}</p>
                <div className="mt-2 flex gap-2"><AccountBadge s={sel.status} /><Badge>{ROLE_LABEL[sel.role]}</Badge></div>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-4 rounded-xl border border-line p-4 text-sm">
              <div><dt className="text-xs text-muted">Cidade</dt><dd>{sel.location ?? '—'}</dd></div>
              <div><dt className="text-xs text-muted">Newsletter</dt><dd>{sel.newsletter ? 'Inscrito' : 'Não'}</dd></div>
              <div><dt className="text-xs text-muted">Cadastro</dt><dd>{formatDate(sel.createdAt)}</dd></div>
              <div><dt className="text-xs text-muted">Último acesso</dt><dd>{relativeTime(sel.lastSeenAt)}</dd></div>
              <div className="col-span-2"><dt className="text-xs text-muted">Interesses</dt><dd className="mt-1 flex flex-wrap gap-1.5">{sel.interests.map((i) => <Badge key={i} tone="primary">{topics.find((t) => t.slug === i)?.name ?? i}</Badge>)}</dd></div>
            </dl>
            <div>
              <h3 className="mb-3 text-sm font-semibold">Eventos e histórico de participação</h3>
              {history.loading ? <Skeleton className="h-24" /> : !history.data?.length ? <p className="text-sm text-muted">Nenhuma inscrição registrada.</p> : (
                <ul className="divide-y divide-line rounded-xl border border-line">
                  {history.data.map(({ r, e }) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                      <div className="min-w-0"><p className="truncate">{e!.title}</p><p className="font-mono text-[11px] text-muted">{formatDate(e!.startsAt)} · {r.code}</p></div>
                      <span className="shrink-0 font-mono text-[10px] uppercase text-muted">{new Date(e!.endsAt) < new Date() ? (r.attended ? '✓ presente' : 'ausente') : r.status === 'confirmed' ? 'inscrito' : r.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {can('users:manage') && (
              <div className="flex flex-wrap gap-2 border-t border-line pt-5">
                {sel.status !== 'active' && <Button size="sm" onClick={() => setAccount(sel, 'active')}>Ativar conta</Button>}
                {sel.status !== 'suspended' && <Button size="sm" variant="danger" onClick={() => setAccount(sel, 'suspended')}>Suspender</Button>}
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

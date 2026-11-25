import { useState } from 'react';
import { Check, Minus, Plus, Trash2 } from 'lucide-react';
import type { Role, User } from '@/types';
import { usersService } from '@/services';
import { useQuery } from '@/hooks/useQuery';
import { useDocumentTitle } from '@/hooks/dom';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useToast } from '@/contexts/ToastContext';
import { AdminPageHeader, IconAction, NoPermission, Table, Td, Th } from '@/components/admin/AdminUI';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Form';
import { Avatar } from '@/components/ui/Misc';
import { Skeleton } from '@/components/ui/States';
import { ADMIN_ROLES, PERMISSION_LABEL, ROLE_LABEL, ROLE_PERMISSIONS, type Permission } from '@/utils/permissions';
import { relativeTime, uid } from '@/utils/format';
import { AccountBadge } from './AdminUsers';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function AdminAdmins() {
  useDocumentTitle('Administradores');
  const { can, user: me } = useAuth();
  const confirm = useConfirm();
  const toast = useToast();
  const { data, loading } = useQuery(async () => (await usersService.list()).filter((u) => ADMIN_ROLES.includes(u.role)), [], ['users']);
  const [invite, setInvite] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'editor' as Role });
  const [touched, setTouched] = useState(false);

  if (!can('admins:manage')) return <NoPermission what="gerenciar administradores (apenas Superadministradores)" />;

  const changeRole = async (u: User, role: Role) => {
    if (u.id === me?.id) return toast({ title: 'Você não pode alterar o próprio papel', variant: 'warning' });
    await usersService.update(u.id, { role });
    toast({ title: 'Permissões atualizadas', description: `${u.name} agora é ${ROLE_LABEL[role]}.` });
  };
  const revoke = async (u: User) => {
    if (u.id === me?.id) return;
    if (!(await confirm({ title: 'Remover acesso administrativo?', description: `${u.name} voltará a ser um leitor comum.`, confirmLabel: 'Remover acesso' }))) return;
    await usersService.update(u.id, { role: 'leitor' });
    toast({ title: 'Acesso removido', variant: 'info' });
  };
  const send = async () => {
    setTouched(true);
    if (form.name.trim().length < 3 || !EMAIL_RE.test(form.email)) return;
    const now = new Date().toISOString();
    await usersService.create({ id: uid('u'), name: form.name, email: form.email, role: form.role, status: 'pending', createdAt: now, lastSeenAt: now, interests: [], newsletter: false, hue: '#A78BFA' });
    toast({ title: 'Convite enviado', description: `${form.email} receberá um link de acesso (simulado).` });
    setInvite(false);
    setForm({ name: '', email: '', role: 'editor' });
    setTouched(false);
  };

  const perms = Object.keys(PERMISSION_LABEL) as Permission[];

  return (
    <>
      <AdminPageHeader title="Administradores" description="Equipe com acesso ao painel e seus níveis de permissão." actions={<Button icon={<Plus className="size-4" />} onClick={() => setInvite(true)}>Convidar membro</Button>} />
      {loading || !data ? <Skeleton className="h-64" /> : (
        <Table>
          <thead><tr><Th>Membro</Th><Th>Papel</Th><Th>Status</Th><Th>Último acesso</Th><Th /></tr></thead>
          <tbody>
            {data.map((u) => (
              <tr key={u.id}>
                <Td><div className="flex items-center gap-3"><Avatar name={u.name} hue={u.hue} size={32} /><div><p className="font-medium">{u.name} {u.id === me?.id && <span className="text-xs text-muted">(você)</span>}</p><p className="text-xs text-muted">{u.email}</p></div></div></Td>
                <Td>
                  <Select value={u.role} disabled={u.id === me?.id} onChange={(e) => changeRole(u, e.target.value as Role)} className="h-8 w-48 text-xs" aria-label={`Papel de ${u.name}`}>
                    {ADMIN_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                  </Select>
                </Td>
                <Td><AccountBadge s={u.status} /></Td>
                <Td className="font-mono text-xs text-muted">{relativeTime(u.lastSeenAt)}</Td>
                <Td><div className="flex justify-end"><IconAction label="Remover acesso" danger disabled={u.id === me?.id} onClick={() => revoke(u)}><Trash2 className="size-4" /></IconAction></div></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <section className="mt-10">
        <h2 className="mb-1 font-display text-xl font-semibold">Matriz de permissões</h2>
        <p className="mb-4 text-sm text-muted">Simulada no frontend. A mesma estrutura (<code className="font-mono text-xs">ROLE_PERMISSIONS</code>) pode ser validada pelo backend.</p>
        <Table>
          <thead><tr><Th>Permissão</Th>{ADMIN_ROLES.map((r) => <Th key={r} className="text-center">{ROLE_LABEL[r]}</Th>)}</tr></thead>
          <tbody>
            {perms.map((p) => (
              <tr key={p}>
                <Td className="text-[13px]">{PERMISSION_LABEL[p]}</Td>
                {ADMIN_ROLES.map((r) => (
                  <Td key={r} className="text-center">
                    {ROLE_PERMISSIONS[r].includes(p) ? <Check className="mx-auto size-4 text-success" aria-label="Permitido" /> : <Minus className="mx-auto size-4 text-muted/50" aria-label="Não permitido" />}
                  </Td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </section>

      <Modal open={invite} onClose={() => setInvite(false)} title="Convidar membro da equipe" footer={<><Button variant="ghost" onClick={() => setInvite(false)}>Cancelar</Button><Button onClick={send}>Enviar convite</Button></>}>
        <div className="space-y-4">
          <Field label="Nome" error={touched && form.name.trim().length < 3 ? 'Informe o nome.' : undefined}>{(id) => <Input id={id} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}</Field>
          <Field label="E-mail" error={touched && !EMAIL_RE.test(form.email) ? 'E-mail inválido.' : undefined}>{(id) => <Input id={id} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />}</Field>
          <Field label="Papel" hint={`${ROLE_PERMISSIONS[form.role].length} permissões`}>{(id) => <Select id={id} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>{ADMIN_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</Select>}</Field>
        </div>
      </Modal>
    </>
  );
}

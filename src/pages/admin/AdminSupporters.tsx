import { useState } from 'react';
import { ExternalLink, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import type { Supporter } from '@/types';
import { db, supportersService } from '@/services';
import { useQuery } from '@/hooks/useQuery';
import { useDebounced, useDocumentTitle } from '@/hooks/dom';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useToast } from '@/contexts/ToastContext';
import { AdminPageHeader, NoPermission } from '@/components/admin/AdminUI';
import { CoverField } from '@/components/admin/Fields';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Form';
import { EmptyState, Skeleton } from '@/components/ui/States';
import { uid } from '@/utils/format';

const blank = (): Supporter => ({ id: uid('sup'), name: '', description: '', logo: '', url: '', createdAt: new Date().toISOString() });

export default function AdminSupporters() {
  useDocumentTitle('Apoiadores');
  const { can } = useAuth();
  const confirm = useConfirm();
  const toast = useToast();
  const [q, setQ] = useState('');
  const dq = useDebounced(q);
  const { data, loading } = useQuery(() => supportersService.list(dq), [dq], ['supporters']);
  const usage = useQuery(async () => {
    const evs = await db.events.list();
    const count: Record<string, number> = {};
    evs.forEach((e) => [...(e.organizers ?? []), ...(e.supporters ?? [])].forEach((id) => (count[id] = (count[id] ?? 0) + 1)));
    return count;
  }, [], ['events', 'supporters']);
  const [editing, setEditing] = useState<Supporter | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!can('events:manage')) return <NoPermission what="gerenciar apoiadores" />;

  const open = (s?: Supporter) => {
    setEditing(s ? { ...s } : blank());
    setIsNew(!s);
    setTouched(false);
  };
  const errors = editing
    ? {
        name: !editing.name.trim() ? 'Informe o nome.' : undefined,
        logo: !editing.logo ? 'Envie a imagem (logo).' : undefined,
        url: editing.url && !/^https?:\/\//.test(editing.url) ? 'O link deve começar com https://' : !editing.url ? 'Informe o link.' : undefined,
      }
    : {};
  const save = async () => {
    if (!editing) return;
    setTouched(true);
    if (Object.values(errors).some(Boolean)) return;
    setSaving(true);
    if (isNew) await supportersService.create(editing);
    else await supportersService.update(editing.id, editing);
    setSaving(false);
    setEditing(null);
    toast({ title: isNew ? 'Apoiador cadastrado' : 'Apoiador atualizado', description: editing.name });
  };
  const remove = async (s: Supporter) => {
    const n = usage.data?.[s.id] ?? 0;
    if (!(await confirm({ title: 'Excluir apoiador?', description: `${s.name} será removido${n ? ` e retirado de ${n} evento(s)` : ''}.`, confirmLabel: 'Excluir' }))) return;
    await supportersService.remove(s.id);
    toast({ title: 'Apoiador excluído', variant: 'info' });
  };

  return (
    <>
      <AdminPageHeader title="Apoiadores" description="Instituições que realizam ou apoiam eventos. A logo aparece na página do evento e leva ao link cadastrado." actions={<Button icon={<Plus className="size-4" />} onClick={() => open()}>Novo apoiador</Button>} />
      <div className="mb-6 sm:w-80">
        <Input leading={<Search className="size-4" />} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar apoiadores" aria-label="Buscar apoiadores" />
      </div>
      {loading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-56 rounded-[14px]" />)}</div>
      ) : data.length === 0 ? (
        <EmptyState title="Nenhum apoiador cadastrado" action={<Button onClick={() => open()}>Cadastrar apoiador</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.map((s) => (
            <div key={s.id} className="panel flex flex-col overflow-hidden">
              <div className="grid h-32 place-items-center bg-white p-4">
                <img src={s.logo} alt={s.name} className="max-h-full max-w-full object-contain" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="font-medium">{s.name}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{s.description}</p>
                <p className="mt-2 font-mono text-[11px] text-muted">{usage.data?.[s.id] ?? 0} evento(s)</p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 truncate text-xs text-primary hover:underline">
                    {s.url.replace(/^https?:\/\//, '')} <ExternalLink className="size-3 shrink-0" />
                  </a>
                  <div className="flex shrink-0">
                    <button onClick={() => open(s)} className="rounded-lg p-1.5 text-muted hover:bg-fg/5 hover:text-fg" aria-label={`Editar ${s.name}`}><Pencil className="size-4" /></button>
                    <button onClick={() => remove(s)} className="rounded-lg p-1.5 text-muted hover:bg-fg/5 hover:text-danger" aria-label={`Excluir ${s.name}`}><Trash2 className="size-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={isNew ? 'Novo apoiador' : 'Editar apoiador'} footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button><Button loading={saving} onClick={save}>{isNew ? 'Cadastrar' : 'Salvar'}</Button></>}>
        {editing && (
          <div className="space-y-4">
            <Field label="Nome" required error={touched ? errors.name : undefined}>{(id) => <Input id={id} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Ex.: FUNCAP" />}</Field>
            <Field label="Descrição">{(id) => <Textarea id={id} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="min-h-16" />}</Field>
            <Field label="Link" required error={touched ? errors.url : undefined} hint="Para onde o visitante vai ao clicar na logo.">{(id) => <Input id={id} type="url" value={editing.url} onChange={(e) => setEditing({ ...editing, url: e.target.value })} placeholder="https://" />}</Field>
            <div>
              <p className="mb-2 text-[13px] font-medium">Imagem (logo) <span className="text-danger">*</span></p>
              <CoverField value={editing.logo} onChange={(v) => setEditing({ ...editing, logo: v })} invalid={touched && !!errors.logo} transparent />
              {touched && errors.logo && <p className="mt-1 text-xs text-danger">{errors.logo}</p>}
              <p className="mt-1 text-[11px] text-muted">Prefira logos com fundo branco ou transparente (PNG/SVG).</p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

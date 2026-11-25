import { useState } from 'react';
import { ExternalLink, Flame, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import type { NewsItem, PublishStatus } from '@/types';
import { newsService } from '@/services';
import { useQuery } from '@/hooks/useQuery';
import { useDebounced, useDocumentTitle } from '@/hooks/dom';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useToast } from '@/contexts/ToastContext';
import { categories, getCategory, topics } from '@/data/taxonomy';
import { authors } from '@/data/authors';
import { AdminPageHeader, Can, IconAction, RowActions, StatusBadge, Table, Td, Th } from '@/components/admin/AdminUI';
import { BlockEditor, createBlock } from '@/components/admin/BlockEditor';
import { AttachmentsEditor, CoverField } from '@/components/admin/Fields';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Switch, Textarea } from '@/components/ui/Form';
import { Chip, Segmented } from '@/components/ui/Misc';
import { EmptyState, Skeleton } from '@/components/ui/States';
import { formatDate, fromLocalInput, readingTimeFromText, slugify, toLocalInput, uid } from '@/utils/format';

const blank = (): NewsItem => ({
  id: uid('news'), slug: '', title: '', excerpt: '', cover: '', categoryId: 'cat-astronomia', topics: [], authorId: 'a4',
  publishedAt: new Date().toISOString(), readingTime: 3, highlight: false, views: 0, source: { name: '', url: '' }, status: 'draft',
  body: [createBlock('paragraph')],
});

export default function AdminNews() {
  useDocumentTitle('Gerenciar notícias');
  const { can } = useAuth();
  const confirm = useConfirm();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [status, setStatus] = useState<PublishStatus | 'all'>('all');
  const dq = useDebounced(q);
  const { data, loading } = useQuery(() => newsService.list({ q: dq, status, categoryId: cat || undefined, pageSize: 200 }), [dq, status, cat], ['news']);

  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const open = (n?: NewsItem) => {
    setEditing(n ? structuredClone(n) : blank());
    setIsNew(!n);
    setTouched(false);
  };
  const set = <K extends keyof NewsItem>(k: K, v: NewsItem[K]) => setEditing((e) => (e ? { ...e, [k]: v } : e));

  const save = async (st: PublishStatus) => {
    if (!editing) return;
    setTouched(true);
    const invalid = !editing.title.trim() || (st !== 'draft' && (!editing.excerpt.trim() || !editing.cover || !editing.source.name.trim()));
    if (invalid) return toast({ title: 'Preencha os campos obrigatórios', description: 'Título, resumo, capa e fonte são necessários para publicar.', variant: 'error' });
    setSaving(true);
    const text = editing.body.map((b) => ('html' in b ? b.html : 'text' in b ? b.text : '')).join(' ');
    const payload: NewsItem = {
      ...editing,
      slug: editing.slug || slugify(editing.title),
      status: st,
      readingTime: readingTimeFromText(text) + 1,
      publishedAt: st === 'scheduled' ? editing.scheduledFor ?? editing.publishedAt : st === 'published' && editing.status !== 'published' ? new Date().toISOString() : editing.publishedAt,
    };
    if (isNew) await newsService.create(payload);
    else await newsService.update(payload.id, payload);
    setSaving(false);
    setEditing(null);
    toast({ title: st === 'published' ? 'Notícia publicada' : st === 'scheduled' ? 'Notícia agendada' : 'Rascunho salvo', description: payload.title });
  };

  const remove = async (n: NewsItem) => {
    if (!(await confirm({ title: 'Excluir notícia?', description: `“${n.title}” será removida.`, confirmLabel: 'Excluir' }))) return;
    await newsService.remove(n.id);
    toast({ title: 'Notícia excluída', variant: 'info' });
  };

  const err = (cond: boolean, msg: string) => (touched && cond ? msg : undefined);

  return (
    <>
      <AdminPageHeader title="Notícias" description="Publique, agende e destaque as notícias do portal." actions={<Can perm="content:create"><Button onClick={() => open()} icon={<Plus className="size-4" />}>Nova notícia</Button></Can>} />
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Segmented layoutId="adm-news" value={status} onChange={setStatus} options={[{ value: 'all', label: 'Todas' }, { value: 'published', label: 'Publicadas' }, { value: 'scheduled', label: 'Agendadas' }, { value: 'draft', label: 'Rascunhos' }]} className="w-fit" />
        <div className="grid gap-2 sm:grid-cols-[260px_200px]">
          <Input leading={<Search className="size-4" />} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar notícias" aria-label="Buscar notícias" />
          <Select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Categoria"><option value="">Todas as categorias</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
        </div>
      </div>

      {loading || !data ? <div className="space-y-2">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-14" />)}</div> : data.items.length === 0 ? (
        <EmptyState title="Nenhuma notícia encontrada" />
      ) : (
        <Table>
          <thead><tr><Th>Notícia</Th><Th>Status</Th><Th>Fonte</Th><Th>Data</Th><Th /></tr></thead>
          <tbody>
            {data.items.map((n) => (
              <tr key={n.id} className="hover:bg-fg/[0.02]">
                <Td>
                  <div className="flex items-center gap-3">
                    <img src={n.cover} alt="" className="size-11 shrink-0 rounded-md object-cover" loading="lazy" />
                    <div className="min-w-0">
                      <button onClick={() => open(n)} className="line-clamp-1 text-left font-medium hover:text-primary">{n.title}</button>
                      <p className="font-mono text-[11px] text-muted">{getCategory(n.categoryId)?.name}{n.highlight && <span className="text-danger"> · importante</span>}</p>
                    </div>
                  </div>
                </Td>
                <Td><StatusBadge status={n.status} /></Td>
                <Td className="text-[13px]">{n.source.name}</Td>
                <Td className="font-mono text-xs whitespace-nowrap text-muted">{formatDate(n.publishedAt)}</Td>
                <Td>
                  <RowActions>
                    <IconAction label={n.highlight ? 'Remover destaque' : 'Destacar'} disabled={!can('content:publish')} onClick={async () => { await newsService.update(n.id, { highlight: !n.highlight }); toast({ title: n.highlight ? 'Destaque removido' : 'Notícia destacada' }); }}><Flame className={n.highlight ? 'size-4 text-danger' : 'size-4'} /></IconAction>
                    <IconAction label="Ver no site" onClick={() => window.open(`/noticias/${n.slug}`, '_blank')}><ExternalLink className="size-4" /></IconAction>
                    <IconAction label="Editar" disabled={!can('content:edit')} onClick={() => open(n)}><Pencil className="size-4" /></IconAction>
                    <IconAction label="Excluir" danger disabled={!can('content:delete')} onClick={() => remove(n)}><Trash2 className="size-4" /></IconAction>
                  </RowActions>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        side
        title={isNew ? 'Nova notícia' : 'Editar notícia'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button variant="secondary" loading={saving} onClick={() => save('draft')}>Salvar rascunho</Button>
            {can('content:publish') && (editing?.scheduledFor && new Date(editing.scheduledFor) > new Date()
              ? <Button loading={saving} onClick={() => save('scheduled')}>Agendar</Button>
              : <Button loading={saving} onClick={() => save('published')}>Publicar</Button>)}
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <Field label="Título" required error={err(!editing.title.trim(), 'Informe o título.')}>{(id) => <Input id={id} value={editing.title} onChange={(e) => set('title', e.target.value)} />}</Field>
            <Field label="Resumo" required error={err(!editing.excerpt.trim(), 'Informe o resumo.')}>{(id) => <Textarea id={id} value={editing.excerpt} onChange={(e) => set('excerpt', e.target.value)} />}</Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Categoria">{(id) => <Select id={id} value={editing.categoryId} onChange={(e) => set('categoryId', e.target.value)}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>}</Field>
              <Field label="Autor">{(id) => <Select id={id} value={editing.authorId} onChange={(e) => set('authorId', e.target.value)}>{authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</Select>}</Field>
              <Field label="Fonte" required error={err(!editing.source.name.trim(), 'Informe a fonte.')}>{(id) => <Input id={id} value={editing.source.name} placeholder="Ex.: NASA" onChange={(e) => set('source', { ...editing.source, name: e.target.value })} />}</Field>
              <Field label="Link da fonte">{(id) => <Input id={id} type="url" value={editing.source.url} placeholder="https://" onChange={(e) => set('source', { ...editing.source, url: e.target.value })} />}</Field>
            </div>
            <Field label="Agendar publicação" hint="Deixe em branco para publicar imediatamente.">
              {(id) => <Input id={id} type="datetime-local" value={toLocalInput(editing.scheduledFor)} onChange={(e) => set('scheduledFor', e.target.value ? fromLocalInput(e.target.value) : undefined)} />}
            </Field>
            <div>
              <p className="mb-2 text-[13px] font-medium">Capa <span className="text-danger">*</span></p>
              <CoverField value={editing.cover} onChange={(v) => set('cover', v)} invalid={touched && !editing.cover} />
            </div>
            <div>
              <p className="mb-2 text-[13px] font-medium">Áreas relacionadas</p>
              <div className="flex flex-wrap gap-1.5">{topics.map((t) => <Chip key={t.slug} active={editing.topics.includes(t.slug)} onClick={() => set('topics', editing.topics.includes(t.slug) ? editing.topics.filter((x) => x !== t.slug) : [...editing.topics, t.slug])}>{t.name}</Chip>)}</div>
            </div>
            <Switch checked={editing.highlight} onChange={(v) => set('highlight', v)} label="Notícia importante" description="Recebe destaque visual na listagem e na home." disabled={!can('content:publish')} />
            <div>
              <p className="mb-2 text-[13px] font-medium">Downloads (anexos)</p>
              <AttachmentsEditor value={editing.attachments ?? []} onChange={(v) => set('attachments', v)} />
            </div>
            <div className="border-t border-line pt-4">
              <p className="mb-3 text-[13px] font-medium">Conteúdo</p>
              <BlockEditor blocks={editing.body} onChange={(b) => set('body', b)} />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

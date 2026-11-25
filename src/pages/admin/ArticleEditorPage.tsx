import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, Eye, Plus, Save, Send } from 'lucide-react';
import type { Article, Category } from '@/types';
import { articlesService, categoriesService } from '@/services';
import { useQuery } from '@/hooks/useQuery';
import { useDocumentTitle } from '@/hooks/dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { authors, getAuthor } from '@/data/authors';
import { topics } from '@/data/taxonomy';
import { BlockEditor, createBlock } from '@/components/admin/BlockEditor';
import { CoverField, ReferencesEditor, TagInput } from '@/components/admin/Fields';
import { NoPermission } from '@/components/admin/AdminUI';
import { BlockRenderer } from '@/components/content/BlockRenderer';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Switch, Textarea } from '@/components/ui/Form';
import { Chip, Segmented, SmartImage, Avatar } from '@/components/ui/Misc';
import { Skeleton } from '@/components/ui/States';
import { fromLocalInput, readingTimeFromText, slugify, stripHtml, toLocalInput, uid, formatDateLong } from '@/utils/format';

const blank = (authorId: string): Article => ({
  id: uid('art'), slug: '', title: '', subtitle: '', excerpt: '', cover: '', categoryId: 'cat-astrofisica', topics: [], tags: [],
  authorId, publishedAt: new Date().toISOString(), updatedAt: new Date().toISOString(), readingTime: 1, featured: false, views: 0,
  status: 'draft', content: [createBlock('paragraph')], references: [],
});

const SERIES = [
  { id: 's-estrelas', title: 'Vida e morte das estrelas' },
  { id: 's-quantica', title: 'Fundamentos quânticos' },
];

export default function ArticleEditorPage() {
  const { id } = useParams();
  const isNew = !id;
  const { can } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Article | null>(isNew ? blank('a1') : null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState<null | 'draft' | 'published' | 'scheduled'>(null);
  const [preview, setPreview] = useState(false);
  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now');
  const [touched, setTouched] = useState(false);
  const [newCat, setNewCat] = useState<string | null>(null);
  useDocumentTitle(isNew ? 'Novo artigo' : 'Editar artigo');

  const loaded = useQuery(() => (id ? articlesService.get(id) : Promise.resolve(null)), [id]);
  const cats = useQuery(() => categoriesService.list(), [], ['categories']);
  const tags = useQuery(() => articlesService.tags(), []);

  useEffect(() => {
    if (loaded.data) {
      setDraft(loaded.data);
      setPublishMode(loaded.data.status === 'scheduled' ? 'schedule' : 'now');
    }
  }, [loaded.data]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => dirty && e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const wordsText = useMemo(() => (draft?.content ?? []).map((b) => ('html' in b ? stripHtml(b.html) : 'text' in b ? b.text : 'items' in b ? b.items.join(' ') : '')).join(' '), [draft?.content]);

  if (!can(isNew ? 'content:create' : 'content:edit')) return <NoPermission what={isNew ? 'criar artigos' : 'editar artigos'} />;
  if (!draft || loaded.loading) return <div className="space-y-4"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-96" /></div>;

  const set = <K extends keyof Article>(k: K, v: Article[K]) => {
    setDraft((d) => (d ? { ...d, [k]: v } : d));
    setDirty(true);
  };

  const errors = {
    title: !draft.title.trim() ? 'O título é obrigatório.' : undefined,
    excerpt: !draft.excerpt.trim() ? 'Escreva um resumo para os cards.' : undefined,
    cover: !draft.cover ? 'Escolha uma imagem de capa.' : undefined,
  };

  const save = async (status: Article['status']) => {
    setTouched(true);
    if (errors.title || (status !== 'draft' && (errors.excerpt || errors.cover))) {
      toast({ title: 'Revise os campos destacados', description: status === 'draft' ? 'O rascunho precisa de um título.' : 'Para publicar: título, resumo e capa.', variant: 'error' });
      return;
    }
    setSaving(status);
    const payload: Article = {
      ...draft,
      slug: draft.slug || slugify(draft.title),
      status,
      readingTime: readingTimeFromText(wordsText),
      publishedAt: status === 'scheduled' ? draft.scheduledFor ?? new Date().toISOString() : status === 'published' && draft.status !== 'published' ? new Date().toISOString() : draft.publishedAt,
      scheduledFor: status === 'scheduled' ? draft.scheduledFor : undefined,
      updatedAt: new Date().toISOString(),
    };
    try {
      if (isNew) await articlesService.create(payload);
      else await articlesService.update(payload.id, payload);
      setDirty(false);
      toast({ title: status === 'draft' ? 'Rascunho salvo' : status === 'scheduled' ? 'Publicação agendada' : 'Artigo publicado', description: payload.title });
      if (isNew) navigate(`/admin/artigos/${payload.id}/editar`, { replace: true });
      else setDraft(payload);
    } catch (e) {
      toast({ title: 'Não foi possível salvar', description: (e as Error).message, variant: 'error' });
    } finally {
      setSaving(null);
    }
  };

  const createCategory = async () => {
    if (!newCat?.trim()) return;
    const c: Category = { id: uid('cat'), slug: slugify(newCat), name: newCat.trim(), description: '', hue: '#6C8CFF' };
    await categoriesService.create(c);
    set('categoryId', c.id);
    setNewCat(null);
    toast({ title: 'Categoria criada', description: c.name });
  };

  const author = getAuthor(draft.authorId);

  return (
    <>
      <div className="sticky top-16 z-20 -mx-4 mb-6 flex flex-wrap items-center gap-2 border-b border-line bg-bg/85 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="size-4" />} onClick={() => navigate('/admin/artigos')}>Artigos</Button>
        <span className="font-mono text-[11px] text-muted">{dirty ? '● alterações não salvas' : isNew ? 'novo' : 'salvo'}</span>
        <div className="flex-1" />
        <Button variant="secondary" size="sm" icon={<Eye className="size-4" />} onClick={() => setPreview(true)}>Pré-visualizar</Button>
        <Button variant="secondary" size="sm" icon={<Save className="size-4" />} loading={saving === 'draft'} onClick={() => save('draft')}>Salvar rascunho</Button>
        {can('content:publish') ? (
          publishMode === 'now' ? (
            <Button size="sm" icon={<Send className="size-4" />} loading={saving === 'published'} onClick={() => save('published')}>{draft.status === 'published' ? 'Atualizar' : 'Publicar agora'}</Button>
          ) : (
            <Button size="sm" icon={<CalendarClock className="size-4" />} loading={saving === 'scheduled'} onClick={() => save('scheduled')}>Agendar</Button>
          )
        ) : (
          <span className="text-xs text-muted">Envie para revisão de um editor</span>
        )}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-4">
          <textarea
            value={draft.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Título do artigo"
            rows={1}
            aria-label="Título"
            aria-invalid={touched && !!errors.title}
            className="w-full resize-none bg-transparent font-display text-4xl leading-tight font-semibold tracking-tight outline-none [field-sizing:content] placeholder:text-muted/50"
          />
          {touched && errors.title && <p className="text-xs text-danger">{errors.title}</p>}
          <textarea value={draft.subtitle} onChange={(e) => set('subtitle', e.target.value)} placeholder="Subtítulo — uma frase que convide à leitura" rows={2} aria-label="Subtítulo" className="w-full resize-none bg-transparent text-lg text-muted outline-none [field-sizing:content] placeholder:text-muted/50" />
          <div className="border-t border-line pt-8">
            <BlockEditor blocks={draft.content} onChange={(b) => set('content', b)} />
          </div>
          <p className="font-mono text-[11px] text-muted">{wordsText.split(/\s+/).filter(Boolean).length} palavras · ~{readingTimeFromText(wordsText)} min de leitura</p>
        </div>

        <aside className="space-y-5">
          <section className="panel space-y-4 p-4">
            <h2 className="text-sm font-semibold">Publicação</h2>
            <Segmented layoutId="pub-mode" value={publishMode} onChange={setPublishMode} options={[{ value: 'now', label: 'Imediata' }, { value: 'schedule', label: 'Agendar' }]} />
            {publishMode === 'schedule' && (
              <Field label="Data e hora">
                {(fid) => <Input id={fid} type="datetime-local" value={toLocalInput(draft.scheduledFor)} min={toLocalInput(new Date().toISOString())} onChange={(e) => set('scheduledFor', fromLocalInput(e.target.value))} />}
              </Field>
            )}
            <Switch checked={draft.featured} onChange={(v) => set('featured', v)} label="Conteúdo em destaque" description="Aparece no carrossel da página inicial." disabled={!can('content:publish')} />
          </section>

          <section className="panel space-y-3 p-4">
            <h2 className="text-sm font-semibold">Capa</h2>
            <CoverField value={draft.cover} onChange={(v) => set('cover', v)} invalid={touched && !!errors.cover} />
            {touched && errors.cover && <p className="text-xs text-danger">{errors.cover}</p>}
          </section>

          <section className="panel space-y-4 p-4">
            <Field label="Resumo" error={touched ? errors.excerpt : undefined} hint={`${draft.excerpt.length}/220`}>
              {(fid) => <Textarea id={fid} maxLength={220} value={draft.excerpt} onChange={(e) => set('excerpt', e.target.value)} invalid={touched && !!errors.excerpt} />}
            </Field>
            <Field label="Slug (URL)" hint={`/artigos/${draft.slug || slugify(draft.title) || '...'}`}>
              {(fid) => <Input id={fid} value={draft.slug} placeholder={slugify(draft.title)} onChange={(e) => set('slug', slugify(e.target.value))} />}
            </Field>
            <Field label="Autor">
              {(fid) => (
                <Select id={fid} value={draft.authorId} onChange={(e) => set('authorId', e.target.value)}>
                  {authors.map((a) => <option key={a.id} value={a.id}>{a.name} — {a.role}</option>)}
                </Select>
              )}
            </Field>
            <Field label="Categoria">
              {(fid) => (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select id={fid} value={draft.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
                      {cats.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>
                  </div>
                  {can('taxonomy:manage') && <Button type="button" variant="secondary" size="icon" onClick={() => setNewCat('')} aria-label="Nova categoria"><Plus className="size-4" /></Button>}
                </div>
              )}
            </Field>
            <div>
              <p className="mb-2 text-[13px] font-medium">Áreas do conhecimento</p>
              <div className="flex flex-wrap gap-1.5">
                {topics.map((t) => <Chip key={t.slug} active={draft.topics.includes(t.slug)} onClick={() => set('topics', draft.topics.includes(t.slug) ? draft.topics.filter((x) => x !== t.slug) : [...draft.topics, t.slug])}>{t.name}</Chip>)}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[13px] font-medium">Tags</p>
              <TagInput value={draft.tags} onChange={(v) => set('tags', v)} suggestions={tags.data} />
            </div>
            <Field label="Série">
              {(fid) => (
                <Select id={fid} value={draft.series?.id ?? ''} onChange={(e) => {
                  const s = SERIES.find((x) => x.id === e.target.value);
                  set('series', s ? { ...s, part: draft.series?.part ?? 1, total: draft.series?.total ?? 3 } : undefined);
                }}>
                  <option value="">Sem série</option>
                  {SERIES.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                </Select>
              )}
            </Field>
            {draft.series && (
              <div className="grid grid-cols-2 gap-2">
                <Field label="Parte">{(fid) => <Input id={fid} type="number" min={1} value={draft.series!.part} onChange={(e) => set('series', { ...draft.series!, part: Number(e.target.value) })} />}</Field>
                <Field label="Total">{(fid) => <Input id={fid} type="number" min={1} value={draft.series!.total} onChange={(e) => set('series', { ...draft.series!, total: Number(e.target.value) })} />}</Field>
              </div>
            )}
          </section>

          <section className="panel p-4">
            <h2 className="mb-3 text-sm font-semibold">Referências bibliográficas</h2>
            <ReferencesEditor value={draft.references} onChange={(v) => set('references', v)} />
          </section>
        </aside>
      </div>

      <Modal open={newCat !== null} onClose={() => setNewCat(null)} size="sm" title="Nova categoria" footer={<><Button variant="ghost" onClick={() => setNewCat(null)}>Cancelar</Button><Button onClick={createCategory} disabled={!newCat?.trim()}>Criar</Button></>}>
        <Field label="Nome da categoria">{(fid) => <Input id={fid} autoFocus value={newCat ?? ''} onChange={(e) => setNewCat(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && createCategory()} />}</Field>
      </Modal>

      <Modal open={preview} onClose={() => setPreview(false)} size="full" title="Pré-visualização" description="Assim o artigo aparecerá para os leitores.">
        <article className="mx-auto max-w-3xl py-4">
          <h1 className="font-display text-4xl leading-tight font-semibold">{draft.title || 'Sem título'}</h1>
          {draft.subtitle && <p className="mt-4 text-lg text-muted">{draft.subtitle}</p>}
          <div className="mt-6 flex items-center gap-3 border-y border-line py-4 text-sm">
            <Avatar name={author.name} hue={author.hue} size={32} />
            <span>{author.name}</span>
            <span className="font-mono text-xs text-muted">{formatDateLong(draft.scheduledFor ?? draft.publishedAt)} · {readingTimeFromText(wordsText)} min</span>
          </div>
          {draft.cover && <SmartImage src={draft.cover} alt="" className="my-8 aspect-[16/8] rounded-xl" />}
          <BlockRenderer blocks={draft.content} />
          {draft.references.length > 0 && (
            <ol className="mt-10 space-y-2 border-t border-line pt-6 text-sm">
              {draft.references.map((r, i) => <li key={r.id}><span className="font-mono text-accent">[{i + 1}]</span> {r.authors} ({r.year}). <em>{r.title}</em>. {r.source}.</li>)}
            </ol>
          )}
        </article>
      </Modal>
    </>
  );
}

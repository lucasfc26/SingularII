import { useRef, useState } from 'react';
import { CheckCircle2, Image as ImageIcon, Pencil, Search, Trash2, Upload, Video, ImageUp } from 'lucide-react';
import type { MediaCategory, MediaItem } from '@/types';
import { articlesService, mediaService } from '@/services';
import { useQuery } from '@/hooks/useQuery';
import { useDebounced, useDocumentTitle } from '@/hooks/dom';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useToast } from '@/contexts/ToastContext';
import { mediaCategories } from '@/data/media';
import { AdminPageHeader } from '@/components/admin/AdminUI';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Form';
import { Chip } from '@/components/ui/Misc';
import { EmptyState, Skeleton } from '@/components/ui/States';
import { compressImage } from '@/utils/files';
import { formatDate, uid } from '@/utils/format';
import { cn } from '@/utils/cn';

export default function AdminMedia() {
  useDocumentTitle('Biblioteca de mídia');
  const { can } = useAuth();
  const confirm = useConfirm();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<MediaCategory | ''>('');
  const dq = useDebounced(q);
  const { data, loading } = useQuery(() => mediaService.list({ q: dq, category: cat || undefined }), [dq, cat], ['media']);
  const articles = useQuery(() => articlesService.list({ status: 'all', pageSize: 200 }), []);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [coverFor, setCoverFor] = useState<MediaItem | null>(null);
  const [coverTarget, setCoverTarget] = useState('');
  const [uploads, setUploads] = useState<{ name: string; progress: number; done: boolean }[]>([]);
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || !can('media:upload')) return;
    for (const f of Array.from(files)) {
      const isImg = f.type.startsWith('image/');
      const isVid = f.type.startsWith('video/');
      if (!isImg && !isVid) {
        toast({ title: `${f.name}: formato não suportado`, variant: 'error' });
        continue;
      }
      setUploads((u) => [...u, { name: f.name, progress: 0, done: false }]);
      // simulated upload progress
      for (let p = 20; p <= 100; p += 20) {
        await new Promise((r) => setTimeout(r, 120));
        setUploads((u) => u.map((x) => (x.name === f.name ? { ...x, progress: p } : x)));
      }
      try {
        let src: string;
        let thumb: string;
        let aspect = 1.5;
        if (isImg) {
          const c = await compressImage(f);
          src = thumb = c.dataUrl;
          aspect = c.aspect;
        } else {
          src = URL.createObjectURL(f); // session-only preview; a real backend would return a CDN URL
          thumb = '';
          aspect = 16 / 9;
        }
        await mediaService.create({
          id: uid('media'), title: f.name.replace(/\.[^.]+$/, ''), description: '', category: isVid ? 'educativos' : 'fotografias',
          kind: isImg ? 'image' : 'video', src, thumb, credit: 'Equipe Horizonte', aspect, createdAt: new Date().toISOString(), topics: [], duration: isVid ? '—' : undefined,
        });
        setUploads((u) => u.map((x) => (x.name === f.name ? { ...x, done: true } : x)));
      } catch (e) {
        toast({ title: 'Falha no envio', description: (e as Error).message, variant: 'error' });
      }
    }
    toast({ title: 'Upload concluído', description: `${files.length} arquivo(s) adicionados à biblioteca.` });
    setTimeout(() => setUploads([]), 2500);
  };

  const saveEdit = async () => {
    if (!editing) return;
    await mediaService.update(editing.id, editing);
    setEditing(null);
    toast({ title: 'Mídia atualizada' });
  };

  const remove = async (m: MediaItem) => {
    if (!(await confirm({ title: 'Excluir arquivo?', description: `“${m.title}” será removido da biblioteca. Conteúdos que usam este arquivo podem ficar sem imagem.`, confirmLabel: 'Excluir' }))) return;
    await mediaService.remove(m.id);
    toast({ title: 'Arquivo excluído', variant: 'info' });
  };

  const applyCover = async () => {
    if (!coverFor || !coverTarget) return;
    await articlesService.update(coverTarget, { cover: coverFor.src });
    toast({ title: 'Capa definida', description: articles.data?.items.find((a) => a.id === coverTarget)?.title });
    setCoverFor(null);
    setCoverTarget('');
  };

  return (
    <>
      <AdminPageHeader title="Multimídia" description="Imagens e vídeos usados em artigos, notícias, eventos e na galeria pública." actions={can('media:upload') && <Button icon={<Upload className="size-4" />} onClick={() => input.current?.click()}>Enviar arquivos</Button>} />
      <input ref={input} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />

      {can('media:upload') && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
          className={cn('mb-6 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-8 text-center transition', drag ? 'border-primary bg-primary/[0.06]' : 'border-line-strong')}
        >
          <Upload className="size-6 text-muted" />
          <p className="text-sm">Arraste imagens ou vídeos para cá</p>
          <p className="text-xs text-muted">JPG, PNG, WebP, MP4 · imagens são otimizadas automaticamente</p>
          {uploads.length > 0 && (
            <ul className="mt-4 w-full max-w-md space-y-2 text-left">
              {uploads.map((u) => (
                <li key={u.name} className="text-xs">
                  <div className="mb-1 flex justify-between"><span className="truncate">{u.name}</span>{u.done ? <CheckCircle2 className="size-3.5 text-success" /> : <span className="font-mono">{u.progress}%</span>}</div>
                  <div className="h-1 overflow-hidden rounded-full bg-fg/10"><div className="h-full bg-primary transition-all" style={{ width: `${u.progress}%` }} /></div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="md:w-72"><Input leading={<Search className="size-4" />} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar arquivos" aria-label="Buscar arquivos" /></div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          <Chip active={!cat} onClick={() => setCat('')}>Todas</Chip>
          {mediaCategories.map((c) => <Chip key={c.id} active={cat === c.id} onClick={() => setCat(cat === c.id ? '' : c.id)}>{c.label}</Chip>)}
        </div>
      </div>

      {loading || !data ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">{Array.from({ length: 10 }, (_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}</div>
      ) : data.length === 0 ? <EmptyState title="Biblioteca vazia" description="Envie seus primeiros arquivos." /> : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
          {data.map((m) => (
            <div key={m.id} className="panel group overflow-hidden">
              <div className="relative aspect-[4/3] bg-bg-2">
                {m.thumb ? <img src={m.thumb} alt="" loading="lazy" className="size-full object-cover" /> : <video src={m.src} className="size-full object-cover" muted />}
                <span className="absolute top-2 left-2 rounded bg-black/60 p-1 text-white">{m.kind === 'video' ? <Video className="size-3.5" /> : <ImageIcon className="size-3.5" />}</span>
                <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/50 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                  <button onClick={() => setEditing(structuredClone(m))} className="rounded-lg bg-white/15 p-2 text-white backdrop-blur hover:bg-white/25" aria-label="Editar descrição"><Pencil className="size-4" /></button>
                  {m.kind === 'image' && <button onClick={() => setCoverFor(m)} className="rounded-lg bg-white/15 p-2 text-white backdrop-blur hover:bg-white/25" aria-label="Usar como capa"><ImageUp className="size-4" /></button>}
                  {can('media:delete') && <button onClick={() => remove(m)} className="rounded-lg bg-white/15 p-2 text-white backdrop-blur hover:bg-danger" aria-label="Excluir"><Trash2 className="size-4" /></button>}
                </div>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium">{m.title}</p>
                <p className="truncate font-mono text-[10.5px] text-muted">{mediaCategories.find((c) => c.id === m.category)?.label} · {formatDate(m.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar mídia" footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button><Button onClick={saveEdit}>Salvar</Button></>}>
        {editing && (
          <div className="space-y-4">
            {editing.thumb && <img src={editing.thumb} alt="" className="max-h-48 w-full rounded-lg object-cover" />}
            <Field label="Título">{(id) => <Input id={id} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />}</Field>
            <Field label="Descrição">{(id) => <Textarea id={id} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />}</Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Categoria">{(id) => <Select id={id} value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value as MediaCategory })}>{mediaCategories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</Select>}</Field>
              <Field label="Autor / fonte">{(id) => <Input id={id} value={editing.credit} onChange={(e) => setEditing({ ...editing, credit: e.target.value })} />}</Field>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!coverFor} onClose={() => setCoverFor(null)} size="sm" title="Usar como capa" description="Escolha o artigo que receberá esta imagem." footer={<><Button variant="ghost" onClick={() => setCoverFor(null)}>Cancelar</Button><Button onClick={applyCover} disabled={!coverTarget}>Definir capa</Button></>}>
        {coverFor && <img src={coverFor.thumb} alt="" className="mb-4 aspect-video w-full rounded-lg object-cover" />}
        <Select value={coverTarget} onChange={(e) => setCoverTarget(e.target.value)} aria-label="Artigo">
          <option value="">Selecione um artigo…</option>
          {articles.data?.items.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
        </Select>
      </Modal>
    </>
  );
}

import { useRef, useState } from 'react';
import { ImagePlus, Library, X } from 'lucide-react';
import { compressImage, readFileAsDataURL } from '@/utils/files';
import { MediaPicker } from './MediaPicker';
import { useToast } from '@/contexts/ToastContext';
import { cn } from '@/utils/cn';

export function CoverField({ value, onChange, invalid, transparent }: { value: string; onChange: (v: string) => void; invalid?: boolean; transparent?: boolean }) {
  const [picker, setPicker] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const upload = async (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) return toast({ title: 'Formato inválido', description: 'Envie JPG, PNG ou WebP.', variant: 'error' });
    if (f.size > 12 * 1024 * 1024) return toast({ title: 'Arquivo muito grande', description: 'O limite é 12 MB.', variant: 'error' });
    if (transparent && f.type === 'image/svg+xml') return onChange(await readFileAsDataURL(f));
    const { dataUrl } = await compressImage(f, transparent ? 640 : 1400, 0.9, transparent ? 'image/png' : 'image/jpeg');
    onChange(dataUrl);
  };
  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files[0]); }}
        className={cn('group relative grid aspect-[16/10] place-items-center overflow-hidden rounded-lg border border-dashed bg-bg-2/50', invalid ? 'border-danger/60' : 'border-line-strong')}
      >
        {value ? (
          <>
            <img src={value} alt="Capa" className={cn('absolute inset-0 size-full', transparent ? 'bg-white object-contain p-4' : 'object-cover')} />
            <button type="button" onClick={() => onChange('')} className="absolute top-2 right-2 rounded-md bg-black/60 p-1 text-white" aria-label="Remover capa"><X className="size-4" /></button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-center text-xs text-muted">
            <ImagePlus className="size-6" />
            Arraste a imagem de capa aqui
          </div>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={() => file.current?.click()} className="flex-1 rounded-md border border-line px-2 py-1.5 text-xs hover:bg-fg/5">Enviar</button>
        <button type="button" onClick={() => setPicker(true)} className="flex flex-1 items-center justify-center gap-1 rounded-md border border-line px-2 py-1.5 text-xs hover:bg-fg/5"><Library className="size-3.5" /> Biblioteca</button>
      </div>
      <input ref={file} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
      <MediaPicker open={picker} onClose={() => setPicker(false)} onSelect={(m) => { onChange(m.src); setPicker(false); }} />
    </div>
  );
}

export function TagInput({ value, onChange, suggestions = [] }: { value: string[]; onChange: (v: string[]) => void; suggestions?: string[] }) {
  const [text, setText] = useState('');
  const add = (t: string) => {
    const tag = t.trim().toLowerCase();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setText('');
  };
  const listId = useRef(`tags-${Math.random().toString(36).slice(2)}`).current;
  return (
    <div className="rounded-[10px] border border-line bg-surface/60 p-1.5 focus-within:border-primary/70">
      <div className="flex flex-wrap gap-1.5">
        {value.map((t) => (
          <span key={t} className="flex items-center gap-1 rounded-md bg-primary/12 px-2 py-0.5 text-xs text-primary">
            #{t}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Remover ${t}`}><X className="size-3" /></button>
          </span>
        ))}
        <input
          list={listId}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add(text);
            }
            if (e.key === 'Backspace' && !text && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={() => text && add(text)}
          placeholder={value.length ? '' : 'Digite e pressione Enter'}
          className="min-w-24 flex-1 bg-transparent px-1 py-0.5 text-sm outline-none"
          aria-label="Adicionar tag"
        />
        <datalist id={listId}>{suggestions.filter((s) => !value.includes(s)).map((s) => <option key={s} value={s} />)}</datalist>
      </div>
    </div>
  );
}

export function ReferencesEditor({ value, onChange }: { value: { id: string; authors: string; title: string; source: string; year: number; url?: string }[]; onChange: (v: typeof value) => void }) {
  const upd = (i: number, k: string, v: string) => onChange(value.map((r, j) => (j === i ? { ...r, [k]: k === 'year' ? Number(v) || 0 : v } : r)));
  const field = 'h-8 w-full rounded-md border border-line bg-surface/60 px-2 text-xs outline-none focus:border-primary/70';
  return (
    <div className="space-y-3">
      {value.map((r, i) => (
        <div key={r.id} className="grid gap-1.5 rounded-lg border border-line p-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-accent">[{i + 1}]</span>
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="text-muted hover:text-danger" aria-label="Remover referência"><X className="size-3.5" /></button>
          </div>
          <input className={field} placeholder="Autores" value={r.authors} onChange={(e) => upd(i, 'authors', e.target.value)} />
          <input className={field} placeholder="Título" value={r.title} onChange={(e) => upd(i, 'title', e.target.value)} />
          <div className="grid grid-cols-[1fr_70px] gap-1.5">
            <input className={field} placeholder="Periódico / editora" value={r.source} onChange={(e) => upd(i, 'source', e.target.value)} />
            <input className={field} placeholder="Ano" inputMode="numeric" value={r.year || ''} onChange={(e) => upd(i, 'year', e.target.value)} />
          </div>
          <input className={field} placeholder="URL / DOI (opcional)" value={r.url ?? ''} onChange={(e) => upd(i, 'url', e.target.value)} />
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, { id: `r_${Date.now()}`, authors: '', title: '', source: '', year: new Date().getFullYear() }])} className="w-full rounded-lg border border-dashed border-line-strong py-2 text-xs text-muted hover:text-fg">
        + Adicionar referência
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------
   Attachments, external links and supporters (events / articles / news)
------------------------------------------------------------------- */
const MAX_INLINE = 2 * 1024 * 1024; // files up to 2 MB are stored with the content

export function AttachmentsEditor({ value, onChange }: { value: import('@/types').Attachment[]; onChange: (v: import('@/types').Attachment[]) => void }) {
  const file = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const next = [...value];
    for (const f of Array.from(files)) {
      let src: string;
      if (f.type.startsWith('image/')) src = (await compressImage(f)).dataUrl;
      else if (f.size <= MAX_INLINE) src = await readFileAsDataURL(f);
      else {
        src = URL.createObjectURL(f);
        toast({ title: `${f.name}: pré-visualização local`, description: 'Arquivos acima de 2 MB ficam disponíveis só nesta sessão. Para mantê-los, adicione um link (Drive, Zenodo, site da UFC…).', variant: 'warning' });
      }
      next.push({ id: `att_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, name: f.name, url: src, mime: f.type, size: f.size });
    }
    onChange(next);
    setBusy(false);
  };

  const addUrl = () => {
    if (!/^https?:\/\//.test(url)) return toast({ title: 'Informe um link começando com https://', variant: 'error' });
    const name = decodeURIComponent(url.split('?')[0]!.split('/').filter(Boolean).pop() ?? 'arquivo');
    onChange([...value, { id: `att_${Date.now().toString(36)}`, name, url }]);
    setUrl('');
  };
  const upd = (i: number, patch: Partial<import('@/types').Attachment>) => onChange(value.map((a, j) => (j === i ? { ...a, ...patch } : a)));
  const field = 'h-8 w-full rounded-md border border-line bg-surface/60 px-2 text-xs outline-none focus:border-primary/70';

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}
        className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-line-strong p-4 text-center text-xs text-muted"
      >
        <span>Arraste livros, PDFs, pôsteres, apresentações…</span>
        <button type="button" disabled={busy} onClick={() => file.current?.click()} className="rounded-md border border-line px-3 py-1.5 text-fg hover:bg-fg/5 disabled:opacity-50">
          {busy ? 'Processando…' : 'Escolher arquivos'}
        </button>
        <input ref={file} type="file" multiple hidden onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
      </div>
      <div className="flex gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())} placeholder="…ou cole o link de um arquivo" className={field} aria-label="Link do arquivo" />
        <button type="button" onClick={addUrl} className="shrink-0 rounded-md border border-line px-3 text-xs hover:bg-fg/5">Adicionar</button>
      </div>
      {value.map((a, i) => (
        <div key={a.id} className="grid gap-1.5 rounded-lg border border-line p-2.5">
          <div className="flex items-center gap-2">
            <input className={field} value={a.name} onChange={(e) => upd(i, { name: e.target.value })} aria-label="Nome do arquivo" />
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="text-muted hover:text-danger" aria-label={`Remover ${a.name}`}><X className="size-4" /></button>
          </div>
          <input className={field} value={a.description ?? ''} placeholder="Descrição (opcional)" onChange={(e) => upd(i, { description: e.target.value })} aria-label="Descrição do arquivo" />
          <p className="truncate font-mono text-[10px] text-muted">{a.url.startsWith('data:') ? 'arquivo salvo com o conteúdo' : a.url.startsWith('blob:') ? 'somente nesta sessão' : a.url}</p>
        </div>
      ))}
      <p className="text-[11px] text-muted">Tudo o que for anexado aparece automaticamente em Downloads, com o link para onde foi publicado.</p>
    </div>
  );
}

export function LinksEditor({ value, onChange }: { value: import('@/types').ExternalLink[]; onChange: (v: import('@/types').ExternalLink[]) => void }) {
  const upd = (i: number, patch: Partial<import('@/types').ExternalLink>) => onChange(value.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const field = 'h-8 w-full rounded-md border border-line bg-surface/60 px-2 text-xs outline-none focus:border-primary/70';
  return (
    <div className="space-y-2">
      {value.map((l, i) => (
        <div key={l.id} className="grid grid-cols-[1fr_1.3fr_auto] gap-2">
          <input className={field} value={l.label} placeholder="Texto do link" onChange={(e) => upd(i, { label: e.target.value })} aria-label="Texto do link" />
          <input className={field} value={l.url} placeholder="https://" type="url" onChange={(e) => upd(i, { url: e.target.value })} aria-label="Endereço do link" />
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="px-1 text-muted hover:text-danger" aria-label="Remover link"><X className="size-4" /></button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, { id: `lk_${Date.now().toString(36)}`, label: '', url: '' }])} className="w-full rounded-lg border border-dashed border-line-strong py-2 text-xs text-muted hover:text-fg">
        + Adicionar link
      </button>
    </div>
  );
}

/** Multi-select of registered supporters, shown with their logos. */
export function SupporterPicker({ supporters, value, onChange, label }: { supporters: import('@/types').Supporter[]; value: string[]; onChange: (v: string[]) => void; label: string }) {
  return (
    <fieldset>
      <legend className="mb-2 text-[13px] font-medium">{label} <span className="font-normal text-muted">({value.length})</span></legend>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {supporters.map((s) => {
          const on = value.includes(s.id);
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={on}
              title={s.name}
              onClick={() => onChange(on ? value.filter((x) => x !== s.id) : [...value, s.id])}
              className={cn('relative flex flex-col items-center gap-1 rounded-lg border bg-white p-2 transition', on ? 'border-primary ring-2 ring-primary/40' : 'border-line opacity-70 hover:opacity-100')}
            >
              <img src={s.logo} alt="" className="h-10 w-full object-contain" />
              <span className="w-full truncate text-center text-[10px] text-[#334]">{s.name}</span>
              {on && <span className="absolute -top-1.5 -right-1.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] text-white">✓</span>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

import { useRef, useState } from 'react';
import { ImagePlus, Library, X } from 'lucide-react';
import { compressImage } from '@/utils/files';
import { MediaPicker } from './MediaPicker';
import { useToast } from '@/contexts/ToastContext';
import { cn } from '@/utils/cn';

export function CoverField({ value, onChange, invalid }: { value: string; onChange: (v: string) => void; invalid?: boolean }) {
  const [picker, setPicker] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const upload = async (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) return toast({ title: 'Formato inválido', description: 'Envie JPG, PNG ou WebP.', variant: 'error' });
    if (f.size > 12 * 1024 * 1024) return toast({ title: 'Arquivo muito grande', description: 'O limite é 12 MB.', variant: 'error' });
    const { dataUrl } = await compressImage(f);
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
            <img src={value} alt="Capa" className="absolute inset-0 size-full object-cover" />
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

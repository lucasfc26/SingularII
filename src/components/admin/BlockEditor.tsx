import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, Reorder, useDragControls } from 'framer-motion';
import {
  BarChart3, Bold, Code, GripVertical, Heading2, Image as ImageIcon, Info, Italic, Link2, List, ListOrdered,
  Pilcrow, Quote, Sigma, Trash2, Upload, Video, ArrowUp, ArrowDown, Library,
} from 'lucide-react';
import type { Block, BlockType } from '@/types';
import { uid } from '@/utils/format';
import { sanitizeHtml } from '@/utils/sanitize';
import { compressImage } from '@/utils/files';
import { TeX } from '../content/Math';
import { Input, Textarea } from '../ui/Form';
import { MediaPicker } from './MediaPicker';
import { useToast } from '@/contexts/ToastContext';
import { cn } from '@/utils/cn';

export const BLOCK_TYPES: { type: BlockType; label: string; icon: typeof Pilcrow }[] = [
  { type: 'paragraph', label: 'Parágrafo', icon: Pilcrow },
  { type: 'heading', label: 'Cabeçalho', icon: Heading2 },
  { type: 'list', label: 'Lista', icon: List },
  { type: 'quote', label: 'Citação', icon: Quote },
  { type: 'image', label: 'Imagem', icon: ImageIcon },
  { type: 'video', label: 'Vídeo', icon: Video },
  { type: 'formula', label: 'Fórmula', icon: Sigma },
  { type: 'chart', label: 'Gráfico', icon: BarChart3 },
  { type: 'callout', label: 'Destaque', icon: Info },
];

export function createBlock(type: BlockType): Block {
  const id = uid('b');
  switch (type) {
    case 'heading': return { id, type, level: 2, text: '' };
    case 'paragraph': return { id, type, html: '' };
    case 'list': return { id, type, ordered: false, items: [''] };
    case 'quote': return { id, type, text: '', cite: '' };
    case 'image': return { id, type, src: '', caption: '', credit: '' };
    case 'video': return { id, type, src: '', poster: '', caption: '' };
    case 'formula': return { id, type, tex: 'E = mc^2', caption: '' };
    case 'chart': return { id, type, title: 'Novo gráfico', unit: '', data: [{ label: 'A', value: 10 }, { label: 'B', value: 20 }] };
    case 'callout': return { id, type, title: 'Nota', text: '' };
  }
}

/** Uncontrolled contentEditable so the caret never jumps while typing. */
function Editable({ html, onChange, placeholder }: { html: string; onChange: (html: string) => void; placeholder?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current && ref.current.innerHTML !== html) ref.current.innerHTML = html;
  }, [html]);
  const exec = (cmd: string, value?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, value);
    onChange(ref.current?.innerHTML ?? '');
  };
  const link = () => {
    const url = window.prompt('Endereço do link (https://...)');
    if (url && /^(https?:|mailto:|\/)/.test(url)) exec('createLink', url);
  };
  const code = () => {
    const sel = window.getSelection()?.toString();
    if (sel) exec('insertHTML', `<code>${sel.replace(/</g, '&lt;')}</code>`);
  };
  const tools = [
    { label: 'Negrito', icon: Bold, run: () => exec('bold') },
    { label: 'Itálico', icon: Italic, run: () => exec('italic') },
    { label: 'Link', icon: Link2, run: link },
    { label: 'Código', icon: Code, run: code },
  ];
  return (
    <div className="relative">
      <AnimatePresence>
        {focused && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className="absolute -top-10 left-0 z-10 flex items-center gap-0.5 rounded-lg border border-line bg-surface p-1 shadow-lg">
            {tools.map(({ label, icon: Icon, run }) => (
              <button key={label} type="button" onMouseDown={(e) => { e.preventDefault(); run(); }} className="rounded p-1.5 text-muted hover:bg-fg/[0.06] hover:text-fg" aria-label={label} title={label}>
                <Icon className="size-3.5" />
              </button>
            ))}
            <span className="px-2 font-mono text-[10px] text-muted">$…$ = fórmula</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Parágrafo"
        data-placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onChange(sanitizeHtml(ref.current?.innerHTML ?? ''));
        }}
        onInput={() => onChange(ref.current?.innerHTML ?? '')}
        className="prose-cosmos min-h-[1.8em] rounded-md px-1 outline-none focus:bg-fg/[0.02]"
      />
    </div>
  );
}

function ImageField({ value, onChange }: { value: string; onChange: (src: string) => void }) {
  const toast = useToast();
  const [picker, setPicker] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const upload = async (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) return toast({ title: 'Envie um arquivo de imagem', variant: 'error' });
    const { dataUrl } = await compressImage(f);
    onChange(dataUrl);
  };
  return (
    <div>
      {value ? (
        <div className="group relative overflow-hidden rounded-lg border border-line">
          <img src={value} alt="" className="max-h-72 w-full object-cover" />
          <button type="button" onClick={() => onChange('')} className="absolute top-2 right-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">Remover</button>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files[0]); }}
          className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-line-strong p-6 text-center text-sm text-muted"
        >
          <Upload className="size-5" />
          <span>Arraste uma imagem ou</span>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => file.current?.click()} className="rounded-md border border-line px-3 py-1.5 text-xs text-fg hover:bg-fg/5">Enviar arquivo</button>
            <button type="button" onClick={() => setPicker(true)} className="flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs text-fg hover:bg-fg/5"><Library className="size-3.5" /> Biblioteca</button>
          </div>
          <input ref={file} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
          <Input placeholder="…ou cole uma URL de imagem" onBlur={(e) => e.target.value && onChange(e.target.value)} className="h-8 max-w-sm text-xs" />
        </div>
      )}
      <MediaPicker open={picker} onClose={() => setPicker(false)} onSelect={(m) => { onChange(m.src); setPicker(false); }} />
    </div>
  );
}

function BlockBody({ block, update }: { block: Block; update: (b: Block) => void }) {
  switch (block.type) {
    case 'paragraph':
      return <Editable html={block.html} onChange={(html) => update({ ...block, html })} placeholder="Escreva um parágrafo… selecione o texto para formatar." />;
    case 'heading':
      return (
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-line p-0.5">
            {([2, 3] as const).map((l) => (
              <button key={l} type="button" onClick={() => update({ ...block, level: l })} className={cn('rounded px-2 py-0.5 font-mono text-[11px]', block.level === l ? 'bg-fg text-bg' : 'text-muted')}>H{l}</button>
            ))}
          </div>
          <input value={block.text} onChange={(e) => update({ ...block, text: e.target.value })} placeholder="Título da seção" className={cn('flex-1 bg-transparent font-display font-semibold outline-none placeholder:text-muted/60', block.level === 2 ? 'text-2xl' : 'text-xl')} />
        </div>
      );
    case 'list':
      return (
        <div className="space-y-2">
          <button type="button" onClick={() => update({ ...block, ordered: !block.ordered })} className="flex items-center gap-1.5 text-xs text-muted hover:text-fg">
            {block.ordered ? <ListOrdered className="size-3.5" /> : <List className="size-3.5" />} {block.ordered ? 'Numerada' : 'Com marcadores'} (alternar)
          </button>
          <Textarea value={block.items.join('\n')} onChange={(e) => update({ ...block, items: e.target.value.split('\n') })} placeholder="Um item por linha" />
        </div>
      );
    case 'quote':
      return (
        <div className="space-y-2 border-l-2 border-accent/60 pl-4">
          <Textarea value={block.text} onChange={(e) => update({ ...block, text: e.target.value })} placeholder="Texto da citação" className="font-display text-lg" />
          <Input value={block.cite ?? ''} onChange={(e) => update({ ...block, cite: e.target.value })} placeholder="Autor da citação" />
        </div>
      );
    case 'image':
      return (
        <div className="space-y-2">
          <ImageField value={block.src} onChange={(src) => update({ ...block, src })} />
          <div className="grid gap-2 sm:grid-cols-[1fr_200px]">
            <Input value={block.caption ?? ''} onChange={(e) => update({ ...block, caption: e.target.value })} placeholder="Legenda" />
            <Input value={block.credit ?? ''} onChange={(e) => update({ ...block, credit: e.target.value })} placeholder="Crédito" />
          </div>
        </div>
      );
    case 'video':
      return (
        <div className="space-y-2">
          <Input value={block.src} onChange={(e) => update({ ...block, src: e.target.value })} placeholder="URL do vídeo (.mp4)" />
          <label className="flex w-fit cursor-pointer items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs text-fg hover:bg-fg/5">
            <Upload className="size-3.5" /> Enviar vídeo (pré-visualização local)
            <input type="file" accept="video/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) update({ ...block, src: URL.createObjectURL(f) }); }} />
          </label>
          {block.src && <video src={block.src} poster={block.poster} controls className="max-h-64 w-full rounded-lg bg-black" />}
          <div className="grid gap-2 sm:grid-cols-2">
            <Input value={block.poster ?? ''} onChange={(e) => update({ ...block, poster: e.target.value })} placeholder="URL da imagem de capa" />
            <Input value={block.caption ?? ''} onChange={(e) => update({ ...block, caption: e.target.value })} placeholder="Legenda" />
          </div>
        </div>
      );
    case 'formula':
      return (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Textarea value={block.tex} onChange={(e) => update({ ...block, tex: e.target.value })} className="font-mono text-xs" placeholder="Código LaTeX, ex.: \frac{a}{b}" spellCheck={false} />
            <Input value={block.caption ?? ''} onChange={(e) => update({ ...block, caption: e.target.value })} placeholder="Legenda (opcional)" />
          </div>
          <div className="grid place-items-center overflow-x-auto rounded-lg border border-line bg-bg-2/50 p-4 text-fg">
            <TeX tex={block.tex || '\\,'} block />
          </div>
        </div>
      );
    case 'chart':
      return (
        <div className="grid gap-2 sm:grid-cols-[1fr_140px]">
          <Input value={block.title} onChange={(e) => update({ ...block, title: e.target.value })} placeholder="Título do gráfico" />
          <Input value={block.unit ?? ''} onChange={(e) => update({ ...block, unit: e.target.value })} placeholder="Unidade" />
          <Textarea
            className="font-mono text-xs sm:col-span-2"
            defaultValue={block.data.map((d) => `${d.label}: ${d.value}`).join('\n')}
            onBlur={(e) => update({ ...block, data: e.target.value.split('\n').map((l) => l.split(':')).filter((p) => p.length >= 2).map(([l, v]) => ({ label: l!.trim(), value: Number(String(v).replace(',', '.')) || 0 })) })}
            placeholder={'Rótulo: valor\nOutro: 42'}
          />
        </div>
      );
    case 'callout':
      return (
        <div className="space-y-2 rounded-lg border border-primary/25 bg-primary/[0.06] p-3">
          <Input value={block.title ?? ''} onChange={(e) => update({ ...block, title: e.target.value })} placeholder="Título do destaque" className="h-8" />
          <Textarea value={block.text} onChange={(e) => update({ ...block, text: e.target.value })} placeholder="Texto" />
        </div>
      );
  }
}

function BlockItem({ block: b, onUpdate, onMove, onRemove }: { block: Block; onUpdate: (b: Block) => void; onMove: (d: -1 | 1) => void; onRemove: () => void }) {
  const controls = useDragControls();
  const meta = BLOCK_TYPES.find((t) => t.type === b.type)!;
  return (
    <Reorder.Item value={b} dragListener={false} dragControls={controls} className="group relative rounded-xl border border-transparent py-3 pr-2 pl-10 transition-colors hover:border-line hover:bg-surface/40 focus-within:border-line focus-within:bg-surface/40">
      <div className="absolute top-3 left-1.5 flex flex-col items-center gap-0.5 opacity-40 transition group-hover:opacity-100 group-focus-within:opacity-100">
        <span onPointerDown={(e) => controls.start(e)} className="cursor-grab touch-none rounded p-1 text-muted active:cursor-grabbing" title="Arraste para reordenar"><GripVertical className="size-4" /></span>
        <button type="button" onClick={() => onMove(-1)} className="rounded p-1 text-muted hover:text-fg" aria-label="Mover para cima"><ArrowUp className="size-3" /></button>
        <button type="button" onClick={() => onMove(1)} className="rounded p-1 text-muted hover:text-fg" aria-label="Mover para baixo"><ArrowDown className="size-3" /></button>
      </div>
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-muted uppercase"><meta.icon className="size-3" /> {meta.label}</span>
        <button type="button" onClick={onRemove} className="rounded p-1 text-muted opacity-0 transition group-hover:opacity-100 hover:text-danger focus:opacity-100" aria-label="Remover bloco"><Trash2 className="size-3.5" /></button>
      </div>
      <BlockBody block={b} update={onUpdate} />
    </Reorder.Item>
  );
}

export function BlockEditor({ blocks, onChange }: { blocks: Block[]; onChange: (b: Block[]) => void }) {
  const set = (i: number, b: Block) => onChange(blocks.map((x, k) => (k === i ? b : x)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  };
  const add = (type: BlockType, at = blocks.length) => {
    const next = [...blocks];
    next.splice(at, 0, createBlock(type));
    onChange(next);
  };

  return (
    <div>
      <Reorder.Group axis="y" values={blocks} onReorder={onChange} className="space-y-3">
        {blocks.map((b, i) => (
          <BlockItem key={b.id} block={b} onUpdate={(nb) => set(i, nb)} onMove={(d) => move(i, d)} onRemove={() => onChange(blocks.filter((x) => x.id !== b.id))} />
        ))}
      </Reorder.Group>
      {blocks.length === 0 && <p className="py-8 text-center text-sm text-muted">Comece adicionando um bloco de conteúdo.</p>}
      <div className="mt-4 flex flex-wrap gap-1.5 rounded-xl border border-dashed border-line-strong p-2">
        <span className="px-2 py-1.5 font-mono text-[10px] tracking-widest text-muted uppercase">Adicionar</span>
        {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
          <button key={type} type="button" onClick={() => add(type)} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-fg/80 transition hover:bg-fg/[0.06] hover:text-fg">
            <Icon className="size-3.5" /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}

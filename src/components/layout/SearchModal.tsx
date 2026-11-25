import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CornerDownLeft, Search, X } from 'lucide-react';
import { searchAll, type SearchHit } from '@/services';
import { useDebounced, useLockBody } from '@/hooks/dom';
import { topics } from '@/data/taxonomy';
import { cn } from '@/utils/cn';

const kindTone: Record<SearchHit['kind'], string> = {
  tema: 'text-accent',
  artigo: 'text-primary',
  notícia: 'text-secondary',
  evento: 'text-warning',
  mídia: 'text-success',
};

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const dq = useDebounced(q, 200);
  const input = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  useLockBody(open);

  useEffect(() => {
    if (open) setTimeout(() => input.current?.focus(), 50);
    else setQ('');
  }, [open]);

  useEffect(() => {
    let alive = true;
    if (!dq.trim()) {
      setHits([]);
      return;
    }
    setLoading(true);
    searchAll(dq).then((h) => {
      if (!alive) return;
      setHits(h);
      setActive(0);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [dq]);

  const go = (to: string) => {
    onClose();
    navigate(to);
  };

  const suggestions = useMemo(() => ['buraco negro', 'matéria escura', 'Webb', 'observação', 'Higgs'], []);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (!hits.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (a + 1) % hits.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a - 1 + hits.length) % hits.length);
    } else if (e.key === 'Enter') {
      go(hits[active]!.to);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[130] flex items-start justify-center px-4 pt-[12vh]" onKeyDown={onKey}>
          <motion.div className="absolute inset-0 bg-[#02030a]/70 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Pesquisar"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="size-5 text-muted" aria-hidden />
              <input
                ref={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Pesquisar artigos, notícias, eventos, mídia..."
                className="h-14 flex-1 bg-transparent text-[15px] text-fg outline-none placeholder:text-muted"
                aria-label="Termo de pesquisa"
                role="combobox"
                aria-expanded={hits.length > 0}
                aria-controls="search-results"
              />
              {loading && <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />}
              <button onClick={onClose} className="rounded-md p-1.5 text-muted hover:text-fg" aria-label="Fechar pesquisa">
                <X className="size-4" />
              </button>
            </div>
            <div id="search-results" className="max-h-[60vh] overflow-y-auto p-2" role="listbox">
              {!q.trim() && (
                <div className="p-4">
                  <p className="eyebrow mb-3 text-muted">Sugestões</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <button key={s} onClick={() => setQ(s)} className="rounded-full border border-line px-3 py-1 text-sm text-muted transition hover:border-line-strong hover:text-fg">
                        {s}
                      </button>
                    ))}
                  </div>
                  <p className="eyebrow mt-6 mb-3 text-muted">Temas</p>
                  <div className="grid gap-1 sm:grid-cols-2">
                    {topics.slice(0, 6).map((t) => (
                      <button key={t.slug} onClick={() => go(`/categorias/${t.slug}`)} className="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-fg/90 transition hover:bg-fg/5">
                        {t.name}
                        <ArrowRight className="size-3.5 text-muted" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {q.trim() && !loading && dq === q && hits.length === 0 && (
                <p className="px-4 py-10 text-center text-sm text-muted">Nenhum resultado para “{q}”. Tente outro termo.</p>
              )}
              {hits.map((h, i) => (
                <button
                  key={h.to + i}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(h.to)}
                  className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition', i === active ? 'bg-fg/[0.06]' : '')}
                >
                  {h.image && <img src={h.image} alt="" className="size-11 shrink-0 rounded-lg object-cover" loading="lazy" />}
                  <span className="min-w-0 flex-1">
                    <span className={cn('font-mono text-[10px] tracking-widest uppercase', kindTone[h.kind])}>{h.kind}</span>
                    <span className="block truncate text-sm font-medium text-fg">{h.title}</span>
                    <span className="block truncate text-xs text-muted">{h.subtitle}</span>
                  </span>
                  {i === active && <CornerDownLeft className="size-4 text-muted" aria-hidden />}
                </button>
              ))}
            </div>
            <div className="hidden items-center gap-4 border-t border-line px-4 py-2.5 font-mono text-[10.5px] text-muted sm:flex">
              <span>↑↓ navegar</span>
              <span>↵ abrir</span>
              <span>esc fechar</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

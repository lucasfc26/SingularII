import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Radio } from 'lucide-react';
import { newsService } from '@/services';
import { useQuery } from '@/hooks/useQuery';
import { useDebounced, useDocumentTitle } from '@/hooks/dom';
import { categories } from '@/data/taxonomy';
import { PageHero } from '@/components/layout/PageHero';
import { NewsCard } from '@/components/content/Cards';
import { Chip } from '@/components/ui/Misc';
import { Input, Select } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, GridSkeleton } from '@/components/ui/States';
import { fadeUp } from '@/animations/variants';
import { relativeTime } from '@/utils/format';

const PAGE = 6;

export default function News() {
  useDocumentTitle('Notícias');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [sort, setSort] = useState<'recent' | 'oldest'>('recent');
  const [limit, setLimit] = useState(PAGE);
  const dq = useDebounced(q, 250);

  const highlights = useQuery(() => newsService.list({ pageSize: 100 }), []);
  const list = useQuery(() => newsService.list({ q: dq, categoryId: cat || undefined, sort, pageSize: limit }), [dq, cat, sort, limit]);
  const top = highlights.data?.items.filter((n) => n.highlight).slice(0, 3) ?? [];
  const ticker = highlights.data?.items.slice(0, 6) ?? [];

  const reset = (fn: () => void) => {
    fn();
    setLimit(PAGE);
  };

  return (
    <>
      <PageHero eyebrow="Notícias e descobertas" title={<>O Universo, <span className="text-gradient">em tempo real.</span></>} description="Anúncios de observatórios, resultados de missões e pesquisas recém-publicadas — com contexto e fontes.">
        {ticker.length > 0 && (
          <div className="panel flex items-center gap-4 overflow-hidden py-2.5 pr-0 pl-4">
            <span className="flex shrink-0 items-center gap-2 font-mono text-[11px] tracking-widest text-danger uppercase"><Radio className="size-3.5 animate-pulse" /> Agora</span>
            <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
              <div className="flex w-max gap-10 [animation:ticker_40s_linear_infinite] hover:[animation-play-state:paused]">
                {[...ticker, ...ticker].map((n, i) => (
                  <Link key={i} to={`/noticias/${n.slug}`} className="shrink-0 text-sm text-fg/85 hover:text-fg">
                    <span className="mr-2 font-mono text-[11px] text-muted">{relativeTime(n.publishedAt)}</span>
                    {n.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </PageHero>

      <div className="shell">
        {top.length > 0 && !dq && !cat && (
          <section className="mb-20 grid gap-5 lg:grid-cols-[1.5fr_1fr]" aria-label="Destaques">
            <NewsCard item={top[0]!} variant="lead" />
            <div className="grid gap-5">{top.slice(1).map((n) => <NewsCard key={n.id} item={n} />)}</div>
          </section>
        )}

        <section aria-labelledby="todas">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <h2 id="todas" className="font-display text-3xl font-semibold">Todas as notícias</h2>
            <p className="font-mono text-xs text-muted">{list.data ? `${list.data.total} resultados` : ''}</p>
          </div>
          <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_200px]">
            <Input leading={<Search className="size-4" />} placeholder="Pesquisar notícias, missões, fontes…" value={q} onChange={(e) => reset(() => setQ(e.target.value))} aria-label="Pesquisar notícias" />
            <Select value={sort} onChange={(e) => reset(() => setSort(e.target.value as 'recent' | 'oldest'))} aria-label="Ordenar por data">
              <option value="recent">Mais recentes primeiro</option>
              <option value="oldest">Mais antigas primeiro</option>
            </Select>
          </div>
          <div className="no-scrollbar -mx-1 mb-10 flex gap-2 overflow-x-auto px-1 pb-1">
            <Chip active={!cat} onClick={() => reset(() => setCat(''))}>Todas</Chip>
            {categories.map((c) => <Chip key={c.id} hue={c.hue} active={cat === c.id} onClick={() => reset(() => setCat(cat === c.id ? '' : c.id))}>{c.name}</Chip>)}
          </div>

          {list.error ? (
            <ErrorState onRetry={list.refetch} />
          ) : !list.data && list.loading ? (
            <GridSkeleton />
          ) : list.data && list.data.items.length === 0 ? (
            <EmptyState title="Nenhuma notícia encontrada" description="Não encontramos notícias com esses filtros. Que tal ampliar a busca?" action={<Button variant="secondary" onClick={() => { setQ(''); setCat(''); }}>Limpar filtros</Button>} />
          ) : (
            list.data && (
              <>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {list.data.items.map((n, i) => (
                    <motion.div key={n.id} variants={fadeUp} initial="hidden" animate="show" custom={i % PAGE}>
                      <NewsCard item={n} />
                    </motion.div>
                  ))}
                </div>
                <div className="mt-12 flex flex-col items-center gap-3">
                  {list.data.total > list.data.items.length ? (
                    <Button variant="secondary" size="lg" loading={list.loading} onClick={() => setLimit((l) => l + PAGE)}>Carregar mais notícias</Button>
                  ) : (
                    <p className="font-mono text-xs text-muted">Você chegou ao fim · {list.data.total} notícias</p>
                  )}
                </div>
              </>
            )
          )}
        </section>
      </div>
    </>
  );
}

import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers, Search, X } from 'lucide-react';
import { articlesService } from '@/services';
import { useQuery } from '@/hooks/useQuery';
import { useDebounced, useDocumentTitle } from '@/hooks/dom';
import { categories } from '@/data/taxonomy';
import { PageHero } from '@/components/layout/PageHero';
import { ArticleCard } from '@/components/content/Cards';
import { Chip, Pagination, SmartImage } from '@/components/ui/Misc';
import { Input, Select } from '@/components/ui/Form';
import { EmptyState, ErrorState, GridSkeleton, Skeleton } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import { fadeUp, inViewProps, stagger } from '@/animations/variants';
import type { Article } from '@/types';

export default function Articles() {
  useDocumentTitle('Artigos');
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const dq = useDebounced(q, 250);
  const categoryId = params.get('categoria') ?? '';
  const tag = params.get('tag') ?? '';
  const sort = (params.get('ordem') as 'recent' | 'popular' | 'oldest') ?? 'recent';
  const page = Number(params.get('pagina') ?? 1);

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    if (k !== 'pagina') next.delete('pagina');
    setParams(next, { replace: true });
  };

  const all = useQuery(() => articlesService.list({ pageSize: 100 }), []);
  const list = useQuery(() => articlesService.list({ q: dq, categoryId: categoryId || undefined, tag: tag || undefined, sort, page, pageSize: 6 }), [dq, categoryId, tag, sort, page]);
  const tags = useQuery(() => articlesService.tags(), []);

  const featured = all.data?.items.filter((a) => a.featured) ?? [];
  const popular = useMemo(() => [...(all.data?.items ?? [])].sort((a, b) => b.views - a.views).slice(0, 5), [all.data]);
  const series = useMemo(() => {
    const map = new Map<string, Article[]>();
    all.data?.items.forEach((a) => a.series && map.set(a.series.id, [...(map.get(a.series.id) ?? []), a]));
    return [...map.values()].map((arr) => arr.sort((a, b) => a.series!.part - b.series!.part));
  }, [all.data]);
  const filtering = !!(dq || categoryId || tag);

  return (
    <>
      <PageHero eyebrow="Revista digital" title={<>Ciência explicada <span className="text-gradient">com profundidade.</span></>} description="Ensaios escritos por pesquisadores e jornalistas de ciência, com fórmulas, gráficos e referências para quem quer ir além da manchete." />

      <div className="shell">
        {/* Featured */}
        {!filtering && (
          <section aria-label="Artigos em destaque" className="mb-24">
            {all.loading ? (
              <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]"><Skeleton className="h-[540px] rounded-[18px]" /><div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28" />)}</div></div>
            ) : featured.length > 0 && (
              <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
                <ArticleCard article={featured[0]!} variant="feature" />
                <div className="panel flex flex-col p-3">
                  <p className="eyebrow px-2 pt-2 pb-3">Também em destaque</p>
                  {featured.slice(1, 5).map((a) => <ArticleCard key={a.id} article={a} variant="compact" />)}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Series */}
        {!filtering && series.length > 0 && (
          <section className="mb-24" aria-labelledby="series">
            <h2 id="series" className="mb-8 flex items-center gap-3 font-display text-3xl font-semibold"><Layers className="size-6 text-accent" /> Séries</h2>
            <div className="grid gap-5 lg:grid-cols-2">
              {series.map((s) => (
                <div key={s[0]!.series!.id} className="panel overflow-hidden">
                  <div className="relative h-36">
                    <SmartImage src={s[0]!.cover} alt="" className="absolute inset-0" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                    <div className="absolute bottom-4 left-5">
                      <p className="font-mono text-[10px] tracking-[0.16em] text-accent uppercase">Série · {s[0]!.series!.total} partes</p>
                      <h3 className="font-display text-2xl font-semibold">{s[0]!.series!.title}</h3>
                    </div>
                  </div>
                  <ol className="p-3">
                    {s.map((a) => (
                      <li key={a.id}>
                        <Link to={`/artigos/${a.slug}`} className="group flex items-center gap-4 rounded-lg px-3 py-3 transition hover:bg-fg/[0.04]">
                          <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line font-mono text-xs text-muted group-hover:border-accent group-hover:text-accent">{a.series!.part}</span>
                          <span className="flex-1 text-[15px] font-medium">{a.title}</span>
                          <span className="font-mono text-[11px] text-muted">{a.readingTime} min</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Library */}
        <section id="biblioteca" aria-labelledby="todos" className="grid gap-12 lg:grid-cols-[1fr_300px]">
          <div>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <h2 id="todos" className="font-display text-3xl font-semibold">{filtering ? 'Resultados' : 'Artigos recentes'}</h2>
              <p className="font-mono text-xs text-muted">{list.data ? `${list.data.total} artigos` : ''}</p>
            </div>
            <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_180px_160px]">
              <Input leading={<Search className="size-4" />} placeholder="Buscar por título, resumo ou tag" value={q} onChange={(e) => { setQ(e.target.value); set('q', e.target.value); }} aria-label="Buscar artigos" />
              <Select value={tag} onChange={(e) => set('tag', e.target.value)} aria-label="Filtrar por tag">
                <option value="">Todas as tags</option>
                {tags.data?.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
              <Select value={sort} onChange={(e) => set('ordem', e.target.value)} aria-label="Ordenar">
                <option value="recent">Mais recentes</option>
                <option value="popular">Mais lidos</option>
                <option value="oldest">Mais antigos</option>
              </Select>
            </div>
            <div className="no-scrollbar -mx-1 mb-8 flex gap-2 overflow-x-auto px-1 pb-1">
              <Chip active={!categoryId} onClick={() => set('categoria', '')}>Todas</Chip>
              {categories.map((c) => <Chip key={c.id} hue={c.hue} active={categoryId === c.id} onClick={() => set('categoria', categoryId === c.id ? '' : c.id)}>{c.name}</Chip>)}
            </div>
            {(tag || dq) && (
              <div className="mb-6 flex flex-wrap gap-2">
                {tag && <button onClick={() => set('tag', '')} className="flex items-center gap-1.5 rounded-full bg-primary/12 px-3 py-1 text-xs text-primary">#{tag} <X className="size-3" /></button>}
                {dq && <button onClick={() => { setQ(''); set('q', ''); }} className="flex items-center gap-1.5 rounded-full bg-primary/12 px-3 py-1 text-xs text-primary">“{dq}” <X className="size-3" /></button>}
              </div>
            )}
            {list.error ? (
              <ErrorState onRetry={list.refetch} />
            ) : list.loading || !list.data ? (
              <GridSkeleton count={6} className="lg:grid-cols-2" />
            ) : list.data.items.length === 0 ? (
              <EmptyState title="Nenhum artigo encontrado" description="Tente outros termos ou remova alguns filtros." action={<Button variant="secondary" to="/artigos">Limpar filtros</Button>} />
            ) : (
              <>
                <motion.div key={`${dq}${categoryId}${tag}${sort}${page}`} variants={stagger} initial="hidden" animate="show" className="grid gap-5 sm:grid-cols-2">
                  {list.data.items.map((a) => <motion.div key={a.id} variants={fadeUp}><ArticleCard article={a} /></motion.div>)}
                </motion.div>
                <Pagination page={list.data.page} pages={list.data.pages} onChange={(p) => { set('pagina', String(p)); document.getElementById('biblioteca')?.scrollIntoView({ behavior: 'smooth' }); }} />
              </>
            )}
          </div>
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <motion.div variants={fadeUp} {...inViewProps} className="panel p-5">
              <p className="eyebrow mb-2">Mais lidos</p>
              {popular.map((a, i) => <ArticleCard key={a.id} article={a} variant="numbered" index={i} />)}
            </motion.div>
            <div className="panel mt-5 p-5">
              <p className="eyebrow mb-4">Tags</p>
              <div className="flex flex-wrap gap-2">
                {tags.data?.slice(0, 18).map((t) => (
                  <button key={t} onClick={() => set('tag', t)} className="rounded-md border border-line px-2 py-1 font-mono text-[11px] text-muted transition hover:border-line-strong hover:text-fg">#{t}</button>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </>
  );
}

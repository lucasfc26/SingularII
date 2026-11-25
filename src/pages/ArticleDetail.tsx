import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, Eye, Layers } from 'lucide-react';
import { articlesService } from '@/services';
import { useQuery } from '@/hooks/useQuery';
import { useDocumentTitle } from '@/hooks/dom';
import { getCategory } from '@/data/taxonomy';
import { getAuthor } from '@/data/authors';
import { BlockRenderer, headingId } from '@/components/content/BlockRenderer';
import { ArticleCard } from '@/components/content/Cards';
import { ShareButtons } from '@/components/content/Share';
import { Avatar, SmartImage } from '@/components/ui/Misc';
import { HueTag, Badge } from '@/components/ui/Badge';
import { ArticleSkeleton, ErrorState } from '@/components/ui/States';
import { formatCompact, formatDateLong } from '@/utils/format';
import { EASE } from '@/animations/variants';
import { cn } from '@/utils/cn';
import NotFound from './NotFound';
import { AttachmentList } from '@/components/content/Downloads';

export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return <motion.div className="fixed inset-x-0 top-0 z-[95] h-0.5 origin-left bg-gradient-to-r from-accent via-primary to-secondary" style={{ scaleX }} aria-hidden />;
}

function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState<string>();
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis[0]) setActive(vis[0].target.id);
    }, { rootMargin: '-20% 0px -70% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

export default function ArticleDetail() {
  const { slug = '' } = useParams();
  const { data: article, loading, error, refetch } = useQuery(() => articlesService.getBySlug(slug), [slug]);
  const related = useQuery(() => (article ? articlesService.related(article) : Promise.resolve([])), [article?.id]);
  useDocumentTitle(article?.title);

  const toc = useMemo(() => (article?.content ?? []).filter((b) => b.type === 'heading').map((b) => ({ id: headingId((b as { text: string }).text), text: (b as { text: string }).text, level: (b as { level: number }).level })), [article]);
  const tocIds = useMemo(() => toc.map((t) => t.id), [toc]);
  const active = useScrollSpy(tocIds);

  if (loading) return <ArticleSkeleton />;
  if (error && (error as { status?: number }).status === 404) return <NotFound />;
  if (error || !article) return <div className="shell pt-40"><ErrorState message={error?.message} onRetry={refetch} /></div>;

  const cat = getCategory(article.categoryId);
  const author = getAuthor(article.authorId);

  return (
    <article>
      <ReadingProgress />
      <header className="relative pt-32 md:pt-40">
        <div className="nebula-bg absolute inset-0" aria-hidden />
        <div className="shell relative max-w-4xl">
          <Link to="/artigos" className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition hover:text-fg"><ArrowLeft className="size-4" /> Artigos</Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
            <div className="flex flex-wrap items-center gap-3">
              {cat && <HueTag hue={cat.hue}>{cat.name}</HueTag>}
              {article.featured && <Badge tone="accent">Destaque</Badge>}
              {article.series && <Badge tone="secondary"><Layers className="size-3" /> {article.series.title} · {article.series.part}/{article.series.total}</Badge>}
            </div>
            <h1 className="mt-6 font-display text-[clamp(2.2rem,5.6vw,4.2rem)] leading-[1.02] font-semibold tracking-[-0.035em]">{article.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted md:text-xl">{article.subtitle}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 border-y border-line py-5">
              <div className="flex items-center gap-3">
                <Avatar name={author.name} hue={author.hue} size={40} />
                <div>
                  <p className="text-sm font-medium">{author.name}</p>
                  <p className="text-xs text-muted">{author.role} · {author.affiliation}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-5 font-mono text-xs text-muted">
                <span>{formatDateLong(article.publishedAt)}</span>
                <span className="flex items-center gap-1.5"><Clock className="size-3.5" /> {article.readingTime} min de leitura</span>
                <span className="flex items-center gap-1.5"><Eye className="size-3.5" /> {formatCompact(article.views)}</span>
              </div>
              <ShareButtons title={article.title} className="sm:ml-auto" />
            </div>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.15, ease: EASE }} className="shell relative mt-10 max-w-6xl">
          <SmartImage src={article.cover} alt={article.title} priority className="aspect-[21/9] rounded-2xl border border-line" />
        </motion.div>
      </header>

      <div className="shell mt-16 grid max-w-6xl gap-12 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <nav aria-label="Sumário" className="sticky top-28">
            <p className="eyebrow mb-4 flex items-center gap-2"><BookOpen className="size-3.5" /> Sumário</p>
            <ul className="space-y-0.5 border-l border-line">
              {toc.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className={cn('-ml-px block border-l py-1.5 text-[13px] leading-snug transition', t.level === 3 ? 'pl-7' : 'pl-4', active === t.id ? 'border-accent text-fg' : 'border-transparent text-muted hover:text-fg')}>
                    {t.text}
                  </a>
                </li>
              ))}
              <li><a href="#referencias" className="-ml-px block border-l border-transparent py-1.5 pl-4 text-[13px] text-muted hover:text-fg">Referências</a></li>
            </ul>
          </nav>
        </aside>

        <div className="min-w-0 max-w-[720px]">
          {toc.length > 0 && (
            <details className="panel mb-10 p-4 lg:hidden">
              <summary className="cursor-pointer font-mono text-xs tracking-widest text-muted uppercase">Sumário</summary>
              <ul className="mt-3 space-y-2">{toc.map((t) => <li key={t.id}><a href={`#${t.id}`} className={cn('text-sm text-fg/80', t.level === 3 && 'pl-4')}>{t.text}</a></li>)}</ul>
            </details>
          )}
          <BlockRenderer blocks={article.content} />

          <div className="mt-12 flex flex-wrap gap-2">
            {article.tags.map((t) => <Link key={t} to={`/artigos?tag=${encodeURIComponent(t)}`} className="rounded-md border border-line px-2.5 py-1 font-mono text-xs text-muted transition hover:border-line-strong hover:text-fg">#{t}</Link>)}
          </div>

          {article.references.length > 0 && (
            <section id="referencias" className="mt-14 scroll-mt-28 border-t border-line pt-10">
              <h2 className="font-display text-2xl font-semibold">Referências bibliográficas</h2>
              <ol className="mt-6 space-y-4">
                {article.references.map((r, i) => (
                  <li key={r.id} className="grid grid-cols-[28px_1fr] gap-2 text-sm leading-relaxed">
                    <span className="font-mono text-xs text-accent">[{i + 1}]</span>
                    <span className="text-fg/85">
                      {r.authors} ({r.year}). <em>{r.title}</em>. <span className="text-muted">{r.source}.</span>{' '}
                      {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer" className="break-all text-primary underline-offset-2 hover:underline">{r.url.replace(/^https?:\/\//, '')}</a>}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {article.attachments?.length ? (
            <section className="mt-14 border-t border-line pt-10" aria-labelledby="downloads">
              <h2 id="downloads" className="mb-5 font-display text-2xl font-semibold">Downloads</h2>
              <AttachmentList files={article.attachments} />
            </section>
          ) : null}
          <section className="panel mt-14 flex flex-col gap-5 p-6 sm:flex-row" aria-label="Sobre o autor">
            <Avatar name={author.name} hue={author.hue} size={64} />
            <div>
              <p className="eyebrow">Sobre o autor</p>
              <p className="mt-2 font-display text-xl font-semibold">{author.name}</p>
              <p className="text-sm text-muted">{author.role} · {author.affiliation}</p>
              <p className="mt-3 text-sm leading-relaxed text-fg/85">{author.bio}</p>
            </div>
          </section>

          <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
            <p className="text-sm text-muted">Gostou? Compartilhe com alguém curioso.</p>
            <ShareButtons title={article.title} />
          </div>
        </div>
      </div>

      {related.data && related.data.length > 0 && (
        <section className="shell mt-28" aria-labelledby="relacionados">
          <h2 id="relacionados" className="mb-8 font-display text-3xl font-semibold">Artigos relacionados</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.data.map((a) => <ArticleCard key={a.id} article={a} />)}</div>
        </section>
      )}
    </article>
  );
}

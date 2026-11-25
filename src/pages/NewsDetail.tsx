import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { newsService } from '@/services';
import { useQuery } from '@/hooks/useQuery';
import { useDocumentTitle } from '@/hooks/dom';
import { getCategory } from '@/data/taxonomy';
import { getAuthor } from '@/data/authors';
import { BlockRenderer } from '@/components/content/BlockRenderer';
import { NewsCard } from '@/components/content/Cards';
import { ShareButtons } from '@/components/content/Share';
import { Avatar, SmartImage } from '@/components/ui/Misc';
import { Badge, HueTag } from '@/components/ui/Badge';
import { ArticleSkeleton, ErrorState } from '@/components/ui/States';
import { formatDateLong, formatTime } from '@/utils/format';
import { EASE } from '@/animations/variants';
import { ReadingProgress } from './ArticleDetail';
import NotFound from './NotFound';

export default function NewsDetail() {
  const { slug = '' } = useParams();
  const { data: item, loading, error, refetch } = useQuery(() => newsService.getBySlug(slug), [slug]);
  const related = useQuery(() => (item ? newsService.related(item) : Promise.resolve([])), [item?.id]);
  useDocumentTitle(item?.title);

  if (loading) return <ArticleSkeleton />;
  if (error && (error as { status?: number }).status === 404) return <NotFound />;
  if (error || !item) return <div className="shell pt-40"><ErrorState message={error?.message} onRetry={refetch} /></div>;
  const cat = getCategory(item.categoryId);
  const author = getAuthor(item.authorId);

  return (
    <article>
      <ReadingProgress />
      <div className="shell max-w-3xl pt-32 md:pt-40">
        <Link to="/noticias" className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition hover:text-fg"><ArrowLeft className="size-4" /> Notícias</Link>
        <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
          <div className="flex flex-wrap items-center gap-3">
            {cat && <HueTag hue={cat.hue}>{cat.name}</HueTag>}
            {item.highlight && <Badge tone="danger" dot>Importante</Badge>}
          </div>
          <h1 className="mt-5 font-display text-[clamp(2rem,5vw,3.4rem)] leading-[1.05] font-semibold tracking-[-0.03em]">{item.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">{item.excerpt}</p>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-line py-4">
            <div className="flex items-center gap-3">
              <Avatar name={author.name} hue={author.hue} size={36} />
              <div className="text-sm">
                <p className="font-medium">{author.name}</p>
                <p className="font-mono text-[11px] text-muted">{formatDateLong(item.publishedAt)} · {formatTime(item.publishedAt)} · {item.readingTime} min</p>
              </div>
            </div>
            <ShareButtons title={item.title} />
          </div>
        </motion.header>
      </div>
      <div className="shell mt-10 max-w-5xl">
        <SmartImage src={item.cover} alt={item.title} priority className="aspect-[16/8] rounded-2xl border border-line" />
      </div>
      <div className="shell mt-12 max-w-3xl">
        <BlockRenderer blocks={item.body.filter((b, i) => !(i > 0 && b.type === 'image' && b.src === item.cover))} />
        <a href={item.source.url} target="_blank" rel="noopener noreferrer" className="panel mt-12 flex items-center justify-between gap-4 p-5 transition hover:border-line-strong">
          <span>
            <span className="eyebrow">Fonte original</span>
            <span className="mt-1 block font-medium">{item.source.name}</span>
          </span>
          <ExternalLink className="size-5 text-muted" />
        </a>
      </div>
      {related.data && related.data.length > 0 && (
        <section className="shell mt-24" aria-labelledby="mais">
          <h2 id="mais" className="mb-8 font-display text-3xl font-semibold">Mais notícias</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.data.map((n) => <NewsCard key={n.id} item={n} />)}</div>
        </section>
      )}
    </article>
  );
}

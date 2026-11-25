import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCategory, getTopic, topics } from '@/data/taxonomy';
import { articlesService, eventsService, mediaService, newsService } from '@/services';
import { useQuery } from '@/hooks/useQuery';
import { useDocumentTitle } from '@/hooks/dom';
import { PageHero } from '@/components/layout/PageHero';
import { ArticleCard, EventCard, MediaCard, NewsCard } from '@/components/content/Cards';
import { TopicVisual, TopicCard } from '@/components/cosmic/TopicVisual';
import { RegistrationModal } from '@/components/content/RegistrationModal';
import { MediaViewer } from '@/components/content/MediaViewer';
import { Segmented } from '@/components/ui/Misc';
import { EmptyState, GridSkeleton } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import type { EventItem } from '@/types';
import NotFound from './NotFound';

type Tab = 'tudo' | 'artigos' | 'noticias' | 'eventos' | 'midia';

export default function CategoryPage() {
  const { slug = '' } = useParams();
  const topic = getTopic(slug);
  const category = getCategory(slug);
  const [tab, setTab] = useState<Tab>('tudo');
  const [joining, setJoining] = useState<EventItem | null>(null);
  const [viewer, setViewer] = useState<number | null>(null);
  useDocumentTitle(topic?.name ?? category?.name);

  const filter = topic ? { topic: topic.slug } : { categoryId: category?.id };
  const { data, loading } = useQuery(
    async () => {
      const [a, n, e, m] = await Promise.all([
        articlesService.list(filter),
        newsService.list(filter),
        topic ? eventsService.list({ topic: topic.slug }) : Promise.resolve([]),
        topic ? mediaService.list({ topic: topic.slug }) : Promise.resolve([]),
      ]);
      return { articles: a.items, news: n.items, events: e, media: m };
    },
    [slug],
    ['events'],
  );

  if (!topic && !category) return <NotFound />;
  const name = topic?.name ?? category!.name;
  const desc = topic?.description ?? category!.description;

  const counts = { artigos: data?.articles.length ?? 0, noticias: data?.news.length ?? 0, eventos: data?.events.length ?? 0, midia: data?.media.length ?? 0 };
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const show = (t: Tab) => tab === 'tudo' || tab === t;

  return (
    <>
      <PageHero eyebrow={topic ? 'Área do conhecimento' : 'Categoria editorial'} title={name} description={desc} image={topic?.cover}>
        <div className="flex flex-wrap items-center gap-6">
          {topic && (
            <div className="panel flex items-center gap-4 px-4 py-3">
              <TopicVisual kind={topic.visual} className="size-12" />
              <div>
                <p className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">{topic.keyFigure.label}</p>
                <p className="font-mono text-sm text-fg">{topic.keyFigure.value}</p>
              </div>
            </div>
          )}
          <p className="font-mono text-xs text-muted">{loading ? 'Carregando conteúdos…' : `${total} conteúdos relacionados`}</p>
        </div>
      </PageHero>

      <div className="shell">
        <Segmented
          layoutId="cat-tabs"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'tudo', label: 'Tudo', count: total },
            { value: 'artigos', label: 'Artigos', count: counts.artigos },
            { value: 'noticias', label: 'Notícias', count: counts.noticias },
            ...(topic ? [{ value: 'eventos' as Tab, label: 'Eventos', count: counts.eventos }, { value: 'midia' as Tab, label: 'Mídia', count: counts.midia }] : []),
          ]}
          className="mb-12 w-fit"
        />

        {loading || !data ? (
          <GridSkeleton />
        ) : total === 0 ? (
          <EmptyState title="Nada por aqui ainda" description="Novos conteúdos sobre este tema estão em produção. Explore outras áreas enquanto isso." action={<Button to="/explorar" variant="secondary">Explorar áreas</Button>} />
        ) : (
          <div className="space-y-20">
            {show('artigos') && data.articles.length > 0 && (
              <Group title="Artigos">
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.articles.map((a) => <ArticleCard key={a.id} article={a} />)}</div>
              </Group>
            )}
            {show('noticias') && data.news.length > 0 && (
              <Group title="Notícias">
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.news.map((n) => <NewsCard key={n.id} item={n} />)}</div>
              </Group>
            )}
            {show('eventos') && data.events.length > 0 && (
              <Group title="Eventos">
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.events.map((e) => <EventCard key={e.id} event={e} onJoin={setJoining} />)}</div>
              </Group>
            )}
            {show('midia') && data.media.length > 0 && (
              <Group title="Galeria">
                <div className="columns-2 gap-4 lg:columns-4">{data.media.map((m, i) => <MediaCard key={m.id} item={m} index={i} onOpen={() => setViewer(i)} />)}</div>
              </Group>
            )}
          </div>
        )}

        {topic && (
          <section className="mt-28" aria-labelledby="outras">
            <h2 id="outras" className="mb-8 font-display text-3xl font-semibold">Continue explorando</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {topics.filter((t) => t.slug !== topic.slug).slice(0, 3).map((t) => <TopicCard key={t.slug} topic={t} />)}
            </div>
          </section>
        )}
      </div>
      <RegistrationModal event={joining} open={!!joining} onClose={() => setJoining(null)} />
      <MediaViewer items={data?.media ?? []} index={viewer} onClose={() => setViewer(null)} onIndex={setViewer} />
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-6 flex items-center gap-4 font-display text-2xl font-semibold">
        {title}
        <span className="h-px flex-1 bg-line" />
      </h2>
      {children}
    </section>
  );
}

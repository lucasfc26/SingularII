import { useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import type { EventItem, MediaItem } from '@/types';
import { articlesService, eventsService, mediaService, newsService } from '@/services';
import { useQuery } from '@/hooks/useQuery';
import { topics } from '@/data/taxonomy';
import { Button } from '../ui/Button';
import { SectionHeader } from '../ui/Misc';
import { CardSkeleton, ErrorState, GridSkeleton, Skeleton } from '../ui/States';
import { ArticleCard, EventCard, MediaCard, NewsCard } from '../content/Cards';
import { Carousel } from '../content/Carousel';
import { RegistrationModal } from '../content/RegistrationModal';
import { MediaViewer } from '../content/MediaViewer';
import { TopicCard } from '../cosmic/TopicVisual';
import { NewsletterForm } from './NewsletterForm';
import { fadeUp, inViewProps, stagger } from '@/animations/variants';
import { formatNumber } from '@/utils/format';
import { cn } from '@/utils/cn';

export function FeaturedSection() {
  const { data, loading, error, refetch } = useQuery(() => articlesService.list({ featured: true, sort: 'recent' }), []);
  return (
    <section className="relative overflow-x-clip py-24 md:py-32" aria-labelledby="destaques">
      <div className="shell">
        <SectionHeader
          id="destaques"
          eyebrow="Em destaque"
          title={<>Descobertas que expandem <span className="text-gradient">horizontes.</span></>}
          description="Ensaios aprofundados escritos por pesquisadores — da geometria do espaço-tempo à natureza da matéria escura."
          action={<Button to="/artigos" variant="outline" iconRight={<ArrowRight className="size-4" />}>Todos os artigos</Button>}
        />
        {error ? (
          <ErrorState onRetry={refetch} />
        ) : loading || !data ? (
          <div className="grid gap-5 md:grid-cols-3">{[0, 1, 2].map((i) => <CardSkeleton key={i} />)}</div>
        ) : (
          <Carousel label="Artigos em destaque" items={data.items} render={(a) => <ArticleCard article={a} variant="carousel" />} />
        )}
      </div>
    </section>
  );
}

export function ExploreSection() {
  const featured = topics.slice(0, 5);
  return (
    <section className="relative py-24 md:py-32" aria-labelledby="explorar">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div className="shell relative">
        <SectionHeader
          id="explorar"
          eyebrow="Exploração temática"
          title="Escolha uma fronteira."
          description="Dez áreas da física, cada uma com seus artigos, notícias, eventos e imagens. Comece por onde a sua curiosidade apontar."
          action={<Button to="/explorar" variant="outline" iconRight={<ArrowRight className="size-4" />}>Ver todas as áreas</Button>}
        />
        <motion.div variants={stagger} {...inViewProps} className="grid auto-rows-[minmax(300px,auto)] gap-4 md:grid-cols-6">
          {featured.map((t, i) => (
            <motion.div key={t.slug} variants={fadeUp} className={cn(i === 0 ? 'md:col-span-4 md:row-span-2' : i === 1 ? 'md:col-span-2 md:row-span-2' : 'md:col-span-2')}>
              <TopicCard topic={t} size={i < 2 ? 'large' : 'normal'} className="h-full" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export function NewsSection() {
  const { data, loading, error, refetch } = useQuery(() => newsService.list({ pageSize: 6 }), []);
  const lead = data?.items.find((n) => n.highlight) ?? data?.items[0];
  const rest = data?.items.filter((n) => n.id !== lead?.id).slice(0, 4) ?? [];
  return (
    <section className="relative py-24 md:py-32" aria-labelledby="noticias">
      <div className="shell">
        <SectionHeader
          id="noticias"
          eyebrow="Notícias e descobertas"
          title="Enquanto isso, no cosmos."
          description="O que observatórios, missões e laboratórios anunciaram nos últimos dias."
          action={<Button to="/noticias" variant="outline" iconRight={<ArrowRight className="size-4" />}>Todas as notícias</Button>}
        />
        {error ? (
          <ErrorState onRetry={refetch} />
        ) : loading || !lead ? (
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <Skeleton className="h-[420px] rounded-[14px]" />
            <div className="space-y-4">{[0, 1, 2, 3].map((i) => <CardSkeleton key={i} horizontal />)}</div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <motion.div variants={fadeUp} {...inViewProps}>
              <NewsCard item={lead} variant="lead" />
            </motion.div>
            <motion.div variants={fadeUp} custom={1} {...inViewProps} className="panel p-5">
              {rest.map((n) => <NewsCard key={n.id} item={n} variant="row" />)}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}

export function EventsSection() {
  const { data, loading, error, refetch } = useQuery(() => eventsService.list({ when: 'upcoming' }), [], ['events']);
  const [joining, setJoining] = useState<EventItem | null>(null);
  return (
    <section className="relative py-24 md:py-32" aria-labelledby="eventos">
      <div className="nebula-bg pointer-events-none absolute inset-0 opacity-70" aria-hidden />
      <div className="shell relative">
        <SectionHeader
          id="eventos"
          eyebrow="Agenda científica"
          title="Olhe para cima, junto com a gente."
          description="Palestras, observações a céu aberto, workshops e lives. Presenciais, online ou híbridos."
          action={<Button to="/eventos" variant="outline" iconRight={<ArrowRight className="size-4" />}>Agenda completa</Button>}
        />
        {error ? <ErrorState onRetry={refetch} /> : loading || !data ? <GridSkeleton count={3} /> : (
          <motion.div variants={stagger} {...inViewProps} className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {data.slice(0, 3).map((e) => (
              <motion.div key={e.id} variants={fadeUp}>
                <EventCard event={e} onJoin={setJoining} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      <RegistrationModal event={joining} open={!!joining} onClose={() => setJoining(null)} />
    </section>
  );
}

export function GallerySection() {
  const { data, loading } = useQuery(() => mediaService.list({ kind: 'visual' }), []);
  const items: MediaItem[] = data?.slice(0, 8) ?? [];
  const [index, setIndex] = useState<number | null>(null);
  return (
    <section className="relative py-24 md:py-32" aria-labelledby="galeria">
      <div className="shell">
        <SectionHeader
          id="galeria"
          eyebrow="Galeria do Universo"
          title="Luz que viajou bilhões de anos até aqui."
          description="Imagens de telescópios espaciais, simulações e vídeos educativos — com a história por trás de cada uma."
          action={<Button to="/downloads" variant="outline" iconRight={<ArrowRight className="size-4" />}>Ver Downloads</Button>}
        />
        {loading ? (
          <div className="columns-2 gap-4 lg:columns-4">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="mb-4 rounded-[14px]" style={{ height: 180 + (i % 3) * 70 }} />)}</div>
        ) : (
          <div className="columns-2 gap-4 lg:columns-4">
            {items.map((m, i) => <MediaCard key={m.id} item={m} index={i} onOpen={() => setIndex(i)} />)}
          </div>
        )}
      </div>
      <MediaViewer items={items} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </section>
  );
}

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const c = animate(0, to, { duration: 2, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => ref.current && (ref.current.textContent = formatNumber(Math.round(v)) + suffix) });
    return () => c.stop();
  }, [inView, to, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

export function CommunitySection() {
  const stats = [
    { label: 'Artigos publicados', value: 1284 },
    { label: 'Eventos realizados', value: 326 },
    { label: 'Pessoas alcançadas', value: 2400000, suffix: '+' },
    { label: 'Conteúdos disponíveis', value: 5170 },
  ];
  return (
    <section className="relative py-24 md:py-32" aria-labelledby="comunidade">
      <div className="shell">
        <div className="relative overflow-hidden rounded-[24px] border border-line bg-bg-2/35 backdrop-blur-[2px] px-6 py-16 md:px-16 md:py-24">
          <div className="orbit-lines pointer-events-none absolute top-1/2 -right-[20%] aspect-square w-[80%] -translate-y-1/2 rounded-full opacity-70" aria-hidden />
          <div className="relative grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <p className="eyebrow mb-4">Newsletter e comunidade</p>
              <h2 id="comunidade" className="font-display text-[clamp(2.2rem,5vw,3.8rem)] leading-[1] font-semibold">A curiosidade é apenas o começo.</h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-muted md:text-lg">
                Receba descobertas, artigos, eventos e novidades do universo científico diretamente no seu e-mail.
              </p>
              <div className="mt-8 max-w-md">
                <NewsletterForm />
                <p className="mt-3 text-xs text-muted">Uma edição por semana. Sem spam — cancele quando quiser.</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
              {stats.map((s) => (
                <div key={s.label} className="bg-bg-2/90 p-6 backdrop-blur md:p-8">
                  <dt className="font-mono text-[10.5px] tracking-[0.14em] text-muted uppercase">{s.label}</dt>
                  <dd className="mt-3 font-display text-3xl font-semibold tabular-nums md:text-[2.6rem]">
                    <Counter to={s.value} suffix={s.suffix} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Clock, Eye, Globe2, MapPin, Play, Sparkles, Users, Video, Image as ImageIcon, Layers } from 'lucide-react';
import type { Article, EventItem, EventStatus, MediaItem, NewsItem } from '@/types';
import { getCategory } from '@/data/taxonomy';
import { getAuthor } from '@/data/authors';
import { mediaCategories } from '@/data/media';
import { eventStatus } from '@/services';
import { formatCompact, formatDate, formatDay, formatMonth, formatTime, relativeTime } from '@/utils/format';
import { spotlightHandler } from '@/hooks/dom';
import { SmartImage, Avatar } from '../ui/Misc';
import { Badge, HueTag } from '../ui/Badge';
import { cn } from '@/utils/cn';

/* ------------------------------------------------------------------ Articles */

export function ArticleCard({ article, variant = 'default', index }: { article: Article; variant?: 'default' | 'feature' | 'compact' | 'numbered' | 'carousel'; index?: number }) {
  const cat = getCategory(article.categoryId);
  const author = getAuthor(article.authorId);
  const to = `/artigos/${article.slug}`;

  if (variant === 'numbered')
    return (
      <Link to={to} className="group flex gap-5 border-b border-line py-5 last:border-0">
        <span className="font-mono text-3xl leading-none font-light text-muted/50 tabular-nums transition group-hover:text-accent">{String((index ?? 0) + 1).padStart(2, '0')}</span>
        <span className="min-w-0">
          {cat && <HueTag hue={cat.hue}>{cat.name}</HueTag>}
          <span className="mt-2 block font-display text-[17px] leading-snug font-medium text-fg transition group-hover:text-primary">{article.title}</span>
          <span className="mt-2 flex items-center gap-3 font-mono text-[11px] text-muted">
            <span className="flex items-center gap-1"><Eye className="size-3" /> {formatCompact(article.views)}</span>
            <span>{article.readingTime} min</span>
          </span>
        </span>
      </Link>
    );

  if (variant === 'compact')
    return (
      <Link to={to} className="group flex gap-4 rounded-xl p-2 transition hover:bg-fg/[0.04]">
        <SmartImage src={article.cover} alt="" className="aspect-square w-20 shrink-0 rounded-lg sm:w-24" imgClassName="group-hover:scale-105" />
        <span className="min-w-0 py-1">
          {cat && <HueTag hue={cat.hue}>{cat.name}</HueTag>}
          <span className="mt-1.5 line-clamp-2 block text-[15px] leading-snug font-medium text-fg">{article.title}</span>
          <span className="mt-1.5 block font-mono text-[11px] text-muted">{formatDate(article.publishedAt)} · {article.readingTime} min</span>
        </span>
      </Link>
    );

  if (variant === 'feature')
    return (
      <Link to={to} onMouseMove={spotlightHandler} className="spotlight group relative block min-h-[420px] overflow-hidden rounded-[18px] border border-line md:min-h-[540px]">
        <SmartImage src={article.cover} alt="" priority className="absolute inset-0" imgClassName="group-hover:scale-[1.04] transition-transform duration-[1.6s]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05060A] via-[#05060A]/60 to-[#05060A]/0" />
        <div className="absolute inset-x-0 bottom-0 z-[2] p-6 text-[#F4F6FC] md:p-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Badge tone="accent"><Sparkles className="size-3" /> Destaque</Badge>
            {cat && <HueTag hue={cat.hue} className="!text-white/85">{cat.name}</HueTag>}
          </div>
          <h3 className="max-w-3xl font-display text-[clamp(1.75rem,3.6vw,3rem)] leading-[1.05] font-semibold">{article.title}</h3>
          <p className="mt-4 line-clamp-2 max-w-2xl text-[15px] leading-relaxed text-white/70">{article.excerpt}</p>
          <div className="mt-6 flex items-center gap-3 text-sm text-white/75">
            <Avatar name={author.name} hue={author.hue} size={30} />
            <span>{author.name}</span>
            <span className="font-mono text-xs text-white/50">{formatDate(article.publishedAt)} · {article.readingTime} min</span>
          </div>
        </div>
      </Link>
    );

  return (
    <motion.article whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }} className="h-full">
      <Link to={to} onMouseMove={spotlightHandler} className={cn('spotlight panel group flex h-full flex-col overflow-hidden transition-[border-color,box-shadow] hover:border-line-strong', variant === 'carousel' && 'select-none')} draggable={false}>
        <div className="relative">
          <SmartImage src={article.cover} alt="" className="aspect-[16/10]" imgClassName="group-hover:scale-[1.05]" />
          {article.series && (
            <span className="glass absolute top-3 left-3 flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[10px] tracking-wide text-fg uppercase">
              <Layers className="size-3" /> Série · {article.series.part}/{article.series.total}
            </span>
          )}
        </div>
        <div className="relative z-[2] flex flex-1 flex-col p-5">
          <div className="flex items-center justify-between gap-3">
            {cat && <HueTag hue={cat.hue}>{cat.name}</HueTag>}
            <span className="font-mono text-[11px] text-muted">{formatDate(article.publishedAt)}</span>
          </div>
          <h3 className="mt-3 font-display text-[19px] leading-snug font-semibold text-fg">{article.title}</h3>
          <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-muted">{article.excerpt}</p>
          <div className="mt-auto flex items-center justify-between pt-5">
            <span className="flex items-center gap-2 text-[13px] text-fg/80">
              <Avatar name={author.name} hue={author.hue} size={24} /> {author.name}
            </span>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-mono text-[11px] text-muted"><Clock className="size-3" /> {article.readingTime} min</span>
              <span className="grid size-8 place-items-center rounded-full border border-line text-muted transition group-hover:border-primary group-hover:bg-primary group-hover:text-on-primary" aria-hidden>
                <ArrowUpRight className="size-4" />
              </span>
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ News */

export function NewsCard({ item, variant = 'default' }: { item: NewsItem; variant?: 'default' | 'lead' | 'row' }) {
  const cat = getCategory(item.categoryId);
  const to = `/noticias/${item.slug}`;

  if (variant === 'lead')
    return (
      <Link to={to} onMouseMove={spotlightHandler} className="spotlight panel group grid h-full overflow-hidden md:grid-cols-[1.25fr_1fr]">
        <SmartImage src={item.cover} alt="" className="aspect-[16/10] md:aspect-auto md:h-full" imgClassName="group-hover:scale-[1.04]" />
        <div className="relative z-[2] flex flex-col p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            {item.highlight && <Badge tone="danger" dot>Importante</Badge>}
            {cat && <HueTag hue={cat.hue}>{cat.name}</HueTag>}
          </div>
          <h3 className="mt-4 font-display text-2xl leading-tight font-semibold text-fg md:text-[2rem]">{item.title}</h3>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">{item.excerpt}</p>
          <div className="mt-auto flex items-center justify-between pt-8 font-mono text-[11px] text-muted">
            <span>{relativeTime(item.publishedAt)} · {item.source.name}</span>
            <span className="flex items-center gap-1 text-fg transition group-hover:text-primary">Ler notícia <ArrowUpRight className="size-3.5" /></span>
          </div>
        </div>
      </Link>
    );

  if (variant === 'row')
    return (
      <Link to={to} className="group grid grid-cols-[auto_1fr] items-start gap-4 border-b border-line py-5 first:pt-0 last:border-0 sm:grid-cols-[120px_1fr_auto]">
        <SmartImage src={item.cover} alt="" className="aspect-[4/3] w-24 rounded-lg sm:w-[120px]" imgClassName="group-hover:scale-105" />
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-3">
            {cat && <HueTag hue={cat.hue}>{cat.name}</HueTag>}
            {item.highlight && <Badge tone="danger">Importante</Badge>}
          </span>
          <span className="mt-2 block font-display text-[17px] leading-snug font-medium text-fg transition group-hover:text-primary">{item.title}</span>
          <span className="mt-1.5 line-clamp-2 hidden text-sm text-muted sm:block">{item.excerpt}</span>
        </span>
        <span className="hidden text-right font-mono text-[11px] whitespace-nowrap text-muted sm:block">
          {formatDate(item.publishedAt)}
          <br />
          {item.readingTime} min
        </span>
      </Link>
    );

  return (
    <motion.article whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }} className="h-full">
      <Link to={to} onMouseMove={spotlightHandler} className="spotlight panel group flex h-full flex-col overflow-hidden hover:border-line-strong">
        <div className="relative">
          <SmartImage src={item.cover} alt="" className="aspect-[16/9]" imgClassName="group-hover:scale-[1.05]" />
          {item.highlight && <Badge tone="danger" dot className="absolute top-3 left-3 bg-[#05060A]/70 backdrop-blur">Importante</Badge>}
        </div>
        <div className="relative z-[2] flex flex-1 flex-col p-5">
          <div className="flex items-center justify-between">
            {cat && <HueTag hue={cat.hue}>{cat.name}</HueTag>}
            <span className="font-mono text-[11px] text-muted">{formatDate(item.publishedAt)}</span>
          </div>
          <h3 className="mt-3 font-display text-lg leading-snug font-semibold text-fg">{item.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted">{item.excerpt}</p>
          <p className="mt-auto pt-4 font-mono text-[11px] text-muted">Fonte: {item.source.name}</p>
        </div>
      </Link>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ Events */

export const EVENT_TYPE_LABEL: Record<EventItem['type'], string> = {
  palestra: 'Palestra', congresso: 'Congresso', workshop: 'Workshop', observacao: 'Observação', live: 'Live', seminario: 'Seminário', encontro: 'Encontro',
};
export const MODALITY_LABEL: Record<EventItem['modality'], string> = { presencial: 'Presencial', online: 'Online', hibrido: 'Híbrido' };

export const STATUS_META: Record<EventStatus, { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  open: { label: 'Inscrições abertas', tone: 'success' },
  closed: { label: 'Inscrições encerradas', tone: 'warning' },
  full: { label: 'Evento lotado', tone: 'danger' },
  completed: { label: 'Evento concluído', tone: 'neutral' },
};

export function EventStatusBadge({ status, className }: { status: EventStatus; className?: string }) {
  const m = STATUS_META[status];
  return <Badge tone={m.tone} dot className={className}>{m.label}</Badge>;
}

export function CapacityBar({ registered, capacity }: { registered: number; capacity: number }) {
  const pct = Math.min(100, (registered / capacity) * 100);
  return (
    <div>
      <div className="mb-1.5 flex justify-between font-mono text-[11px] text-muted">
        <span className="flex items-center gap-1"><Users className="size-3" /> {registered} / {capacity}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-fg/[0.07]" role="progressbar" aria-valuenow={registered} aria-valuemax={capacity} aria-label="Vagas preenchidas">
        <div className={cn('h-full rounded-full', pct >= 100 ? 'bg-danger' : pct > 80 ? 'bg-warning' : 'bg-accent')} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function EventCard({ event, onJoin, variant = 'default' }: { event: EventItem; onJoin?: (e: EventItem) => void; variant?: 'default' | 'wide' }) {
  const status = eventStatus(event);
  const to = `/eventos/${event.slug}`;
  const ModIcon = event.modality === 'online' ? Globe2 : MapPin;
  return (
    <motion.article whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }} className="h-full">
      <div onMouseMove={spotlightHandler} className={cn('spotlight panel group flex h-full overflow-hidden hover:border-line-strong', variant === 'wide' ? 'flex-col md:flex-row' : 'flex-col')}>
        <Link to={to} className={cn('relative block shrink-0', variant === 'wide' && 'md:w-[42%]')} tabIndex={-1} aria-hidden>
          <SmartImage src={event.cover} alt="" className={cn('aspect-[16/9]', variant === 'wide' && 'md:aspect-auto md:h-full')} imgClassName={cn('group-hover:scale-[1.05]', status === 'completed' && 'grayscale-[0.6]')} />
          <div className="glass absolute top-3 left-3 rounded-lg px-3 py-2 text-center" style={{ background: 'var(--glass-strong)' }}>
            <p className="font-display text-xl leading-none font-semibold text-fg">{formatDay(event.startsAt)}</p>
            <p className="mt-0.5 font-mono text-[10px] tracking-widest text-muted">{formatMonth(event.startsAt)}</p>
          </div>
        </Link>
        <div className="relative z-[2] flex flex-1 flex-col p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="secondary">{EVENT_TYPE_LABEL[event.type]}</Badge>
            <EventStatusBadge status={status} />
          </div>
          <Link to={to} className="mt-3 block">
            <h3 className="font-display text-lg leading-snug font-semibold text-fg transition hover:text-primary">{event.title}</h3>
          </Link>
          <p className="mt-2 line-clamp-2 text-sm text-muted">{event.summary}</p>
          <dl className="mt-4 space-y-1.5 text-[13px] text-fg/80">
            <div className="flex items-center gap-2">
              <dt className="sr-only">Horário</dt>
              <Clock className="size-3.5 text-muted" aria-hidden />
              <dd>{formatDate(event.startsAt)} · {formatTime(event.startsAt)}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">Local</dt>
              <ModIcon className="size-3.5 text-muted" aria-hidden />
              <dd className="truncate">{MODALITY_LABEL[event.modality]}{event.location ? ` · ${event.location.city}` : ''}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">Organizador</dt>
              <Sparkles className="size-3.5 text-muted" aria-hidden />
              <dd className="truncate">{event.organizer.name}</dd>
            </div>
          </dl>
          <div className="mt-5">
            <CapacityBar registered={event.registeredCount} capacity={event.capacity} />
          </div>
          <div className="mt-auto flex gap-2 pt-5">
            <Link to={to} className="flex h-9 flex-1 items-center justify-center rounded-[10px] border border-line text-[13px] font-medium text-fg transition hover:border-line-strong hover:bg-fg/5">
              Ver evento
            </Link>
            <button
              onClick={() => onJoin?.(event)}
              disabled={status !== 'open'}
              className="h-9 flex-1 rounded-[10px] bg-fg text-[13px] font-medium text-bg transition hover:opacity-90 active:scale-[0.97] disabled:bg-fg/10 disabled:text-muted"
            >
              {status === 'open' ? 'Participar' : status === 'full' ? 'Lotado' : status === 'completed' ? 'Encerrado' : 'Fechado'}
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ Media */

export function MediaCard({ item, onOpen, index = 0 }: { item: MediaItem; onOpen: (m: MediaItem) => void; index?: number }) {
  const cat = mediaCategories.find((c) => c.id === item.category);
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onOpen(item)}
      className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-[14px] border border-line text-left"
      aria-label={`${item.kind === 'video' ? 'Assistir' : 'Visualizar'}: ${item.title}`}
    >
      <SmartImage src={item.thumb} alt={item.title} style={{ aspectRatio: String(item.aspect) }} imgClassName="group-hover:scale-[1.06] transition-transform duration-[1.2s]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#05060A]/90 via-[#05060A]/10 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
      <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-md bg-[#05060A]/60 px-2 py-1 font-mono text-[10px] tracking-wide text-white/90 uppercase backdrop-blur">
        {item.kind === 'video' ? <Video className="size-3" /> : <ImageIcon className="size-3" />}
        {item.kind === 'video' ? `Vídeo · ${item.duration}` : 'Imagem'}
      </span>
      {item.kind === 'video' && (
        <span className="absolute top-1/2 left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition group-hover:scale-110 group-hover:bg-white/20">
          <Play className="ml-0.5 size-5 fill-current" />
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <p className="font-mono text-[10px] tracking-[0.14em] text-[#53DDF5] uppercase">{cat?.label}</p>
        <p className="mt-1 font-display text-[16px] leading-snug font-semibold">{item.title}</p>
        {item.sources?.length ? <p className="mt-1 truncate font-mono text-[10px] text-white/60">em {item.sources[0]!.type}{item.sources.length > 1 ? ` +${item.sources.length - 1}` : ''}: {item.sources[0]!.title}</p> : null}
        <p className="mt-1 line-clamp-2 max-h-0 text-[13px] text-white/70 opacity-0 transition-all duration-500 group-hover:max-h-12 group-hover:opacity-100">{item.description}</p>
      </div>
    </motion.button>
  );
}

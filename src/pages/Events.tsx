import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import type { EventItem, EventStatus } from '@/types';
import { eventsService, eventStatus } from '@/services';
import { useQuery } from '@/hooks/useQuery';
import { useDebounced, useDocumentTitle } from '@/hooks/dom';
import { PageHero } from '@/components/layout/PageHero';
import { EventCard, EVENT_TYPE_LABEL, MODALITY_LABEL, STATUS_META } from '@/components/content/Cards';
import { RegistrationModal } from '@/components/content/RegistrationModal';
import { Segmented } from '@/components/ui/Misc';
import { Input, Select } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, GridSkeleton } from '@/components/ui/States';
import { fadeUp, stagger } from '@/animations/variants';
import { formatDay, formatMonth, formatTime } from '@/utils/format';
import { Link } from 'react-router-dom';

export default function Events() {
  useDocumentTitle('Eventos');
  const [when, setWhen] = useState<'upcoming' | 'past'>('upcoming');
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [modality, setModality] = useState('');
  const [status, setStatus] = useState<EventStatus | 'all'>('all');
  const [joining, setJoining] = useState<EventItem | null>(null);
  const dq = useDebounced(q);

  const { data, loading, error, refetch } = useQuery(() => eventsService.list({ when, q: dq, type: type || undefined, modality: modality || undefined, status }), [when, dq, type, modality, status], ['events']);
  const upcoming = useQuery(() => eventsService.list({ when: 'upcoming' }), [], ['events']);
  const featured = upcoming.data?.find((e) => e.featured && eventStatus(e) === 'open');
  const next = upcoming.data?.slice(0, 4) ?? [];

  return (
    <>
      <PageHero eyebrow="Eventos científicos" title={<>Ciência é melhor <span className="text-gradient">em companhia.</span></>} description="Palestras, congressos, workshops, observações astronômicas, lives e encontros. Inscreva-se, receba lembretes e leve alguém junto.">
        {next.length > 0 && (
          <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {next.map((e) => (
              <li key={e.id} className="bg-bg/80 backdrop-blur">
                <Link to={`/eventos/${e.slug}`} className="group flex gap-4 p-4 transition hover:bg-surface/70">
                  <span className="text-center">
                    <span className="block font-display text-2xl leading-none font-semibold">{formatDay(e.startsAt)}</span>
                    <span className="font-mono text-[10px] tracking-widest text-muted">{formatMonth(e.startsAt)}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 block text-sm font-medium group-hover:text-primary">{e.title}</span>
                    <span className="mt-1 block font-mono text-[11px] text-muted">{formatTime(e.startsAt)} · {MODALITY_LABEL[e.modality]}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </PageHero>

      <div className="shell">
        {featured && when === 'upcoming' && !dq && !type && !modality && status === 'all' && (
          <section className="mb-20" aria-label="Evento em destaque">
            <p className="eyebrow mb-4">Em destaque</p>
            <EventCard event={featured} onJoin={setJoining} variant="wide" />
          </section>
        )}

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Segmented layoutId="ev-when" value={when} onChange={setWhen} options={[{ value: 'upcoming', label: 'Próximos eventos' }, { value: 'past', label: 'Eventos anteriores' }]} className="w-fit" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[240px_150px_150px_180px]">
            <Input leading={<Search className="size-4" />} placeholder="Buscar eventos" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar eventos" />
            <Select value={type} onChange={(e) => setType(e.target.value)} aria-label="Tipo de evento">
              <option value="">Todos os tipos</option>
              {Object.entries(EVENT_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
            <Select value={modality} onChange={(e) => setModality(e.target.value)} aria-label="Modalidade">
              <option value="">Modalidade</option>
              {Object.entries(MODALITY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
            <Select value={status} onChange={(e) => setStatus(e.target.value as EventStatus | 'all')} aria-label="Status de inscrição">
              <option value="all">Qualquer status</option>
              {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
          </div>
        </div>

        {error ? (
          <ErrorState onRetry={refetch} />
        ) : loading || !data ? (
          <GridSkeleton />
        ) : data.length === 0 ? (
          <EmptyState title="Nenhum evento encontrado" description="Ajuste os filtros ou confira os eventos anteriores — muitas palestras ficam gravadas." action={<Button variant="secondary" onClick={() => { setQ(''); setType(''); setModality(''); setStatus('all'); }}>Limpar filtros</Button>} />
        ) : (
          <motion.div key={when + dq + type + modality + status} variants={stagger} initial="hidden" animate="show" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((e) => <motion.div key={e.id} variants={fadeUp}><EventCard event={e} onJoin={setJoining} /></motion.div>)}
          </motion.div>
        )}
      </div>
      <RegistrationModal event={joining} open={!!joining} onClose={() => setJoining(null)} />
    </>
  );
}

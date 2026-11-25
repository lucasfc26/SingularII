import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarDays, Clock, Download, ExternalLink, Globe2, Link2, Mail, MapPin, Star, Users, Video } from 'lucide-react';
import { AttachmentList } from '@/components/content/Downloads';
import { SupportersShowcase } from '@/components/content/Supporters';
import type { Registration } from '@/types';
import { eventsService, eventStatus } from '@/services';
import { useQuery } from '@/hooks/useQuery';
import { useDocumentTitle } from '@/hooks/dom';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useToast } from '@/contexts/ToastContext';
import { CapacityBar, EVENT_TYPE_LABEL, EventStatusBadge, MODALITY_LABEL } from '@/components/content/Cards';
import { AddToCalendar, RegistrationModal } from '@/components/content/RegistrationModal';
import { ShareButtons } from '@/components/content/Share';
import { Avatar, SmartImage } from '@/components/ui/Misc';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArticleSkeleton, ErrorState } from '@/components/ui/States';
import { formatDateLong, formatTime } from '@/utils/format';
import { EASE } from '@/animations/variants';
import NotFound from './NotFound';

export default function EventDetail() {
  const { slug = '' } = useParams();
  const { user } = useAuth();
  const confirm = useConfirm();
  const toast = useToast();
  const [mode, setMode] = useState<'confirmed' | 'interested' | null>(null);
  const { data: event, loading, error, refetch } = useQuery(() => eventsService.getBySlug(slug), [slug], ['events']);
  const regs = useQuery(() => (event ? eventsService.registrations(event.id) : Promise.resolve([] as Registration[])), [event?.id], ['registrations']);
  useDocumentTitle(event?.title);

  if (loading && !event) return <ArticleSkeleton />;
  if (error && (error as { status?: number }).status === 404) return <NotFound />;
  if (error || !event) return <div className="shell pt-40"><ErrorState message={error?.message} onRetry={refetch} /></div>;

  const status = eventStatus(event);
  const confirmed = regs.data?.filter((r) => r.status === 'confirmed') ?? [];
  const mine = user ? regs.data?.find((r) => r.status !== 'cancelled' && (r.userId === user.id || r.email === user.email)) : undefined;
  const speaker = (id?: string) => event.speakers.find((s) => s.id === id);
  const days = Math.ceil((+new Date(event.startsAt) - Date.now()) / 86400000);

  const cancel = async () => {
    if (!mine) return;
    const ok = await confirm({ title: 'Cancelar inscrição?', description: 'Sua vaga será liberada para outra pessoa. Você pode se inscrever novamente enquanto houver vagas.', confirmLabel: 'Cancelar inscrição' });
    if (!ok) return;
    await eventsService.cancelRegistration(mine);
    toast({ title: 'Inscrição cancelada', variant: 'info' });
  };

  return (
    <>
      <header className="relative min-h-[70vh] overflow-hidden pt-28">
        <SmartImage src={event.cover} alt="" priority className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/75 to-bg/30" />
        <div className="shell relative flex min-h-[calc(70vh-7rem)] flex-col justify-end pb-12">
          <Link to="/eventos" className="mb-auto inline-flex w-fit items-center gap-2 rounded-full bg-bg/60 px-3 py-1.5 text-sm text-fg/80 backdrop-blur transition hover:text-fg"><ArrowLeft className="size-4" /> Eventos</Link>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE }} className="mt-16">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="secondary">{EVENT_TYPE_LABEL[event.type]}</Badge>
              <Badge tone="primary">{MODALITY_LABEL[event.modality]}</Badge>
              <EventStatusBadge status={status} />
              {status === 'open' && days >= 0 && days <= 14 && <Badge tone="accent">{days === 0 ? 'Hoje' : `Faltam ${days} dias`}</Badge>}
            </div>
            <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.2rem,5.4vw,4.4rem)] leading-[1.02] font-semibold tracking-[-0.035em]">{event.title}</h1>
            <p className="mt-5 max-w-2xl text-lg text-muted">{event.summary}</p>
          </motion.div>
        </div>
      </header>

      <div className="shell grid gap-12 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-16">
          <section aria-labelledby="sobre">
            <h2 id="sobre" className="mb-5 font-display text-2xl font-semibold">Sobre o evento</h2>
            <div className="space-y-4 text-[1.0625rem] leading-relaxed text-fg/85">
              {event.description.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {event.tags.map((t) => <span key={t} className="rounded-md border border-line px-2.5 py-1 font-mono text-xs text-muted">#{t}</span>)}
            </div>
          </section>

          <section aria-labelledby="programacao">
            <h2 id="programacao" className="mb-6 font-display text-2xl font-semibold">Programação</h2>
            <ol className="relative space-y-1 border-l border-line pl-8">
              {event.schedule.map((s, i) => {
                const sp = speaker(s.speakerId);
                return (
                  <motion.li key={s.id} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="relative pb-6">
                    <span className="absolute top-1.5 -left-[37px] size-[9px] rounded-full border-2 border-accent bg-bg shadow-[0_0_10px_var(--accent)]" aria-hidden />
                    <p className="font-mono text-sm text-accent">{s.time}</p>
                    <p className="mt-1 font-display text-lg font-medium">{s.title}</p>
                    {s.description && <p className="mt-1 text-sm text-muted">{s.description}</p>}
                    {sp && <p className="mt-2 flex items-center gap-2 text-sm text-fg/80"><Avatar name={sp.name} hue={sp.hue} size={22} /> {sp.name}</p>}
                  </motion.li>
                );
              })}
            </ol>
          </section>

          <section aria-labelledby="palestrantes">
            <h2 id="palestrantes" className="mb-6 font-display text-2xl font-semibold">Palestrantes</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {event.speakers.map((s) => (
                <div key={s.id} className="panel flex items-center gap-4 p-4">
                  <Avatar name={s.name} hue={s.hue} size={52} />
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-muted">{s.role}</p>
                    <p className="font-mono text-[11px] text-muted">{s.affiliation}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="local">
            <h2 id="local" className="mb-6 font-display text-2xl font-semibold">{event.modality === 'online' ? 'Transmissão' : 'Localização'}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {event.location && (
                <div className="panel overflow-hidden">
                  <div className="grid-lines relative h-40 bg-bg-2" aria-hidden>
                    <div className="orbit-lines absolute top-1/2 left-1/2 size-56 -translate-1/2 rounded-full" />
                    <MapPin className="absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-full fill-primary/30 text-primary" />
                  </div>
                  <div className="p-5">
                    <p className="font-medium">{event.location.venue}</p>
                    <p className="text-sm text-muted">{event.location.address} · {event.location.city}</p>
                    <Button variant="secondary" size="sm" className="mt-4" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.location.venue} ${event.location.address} ${event.location.city}`)}`} iconRight={<ExternalLink className="size-3.5" />}>
                      Abrir no mapa
                    </Button>
                  </div>
                </div>
              )}
              {event.streamUrl && (
                <div className="panel flex flex-col justify-between p-5">
                  <div>
                    <Video className="mb-4 size-6 text-accent" />
                    <p className="font-medium">Transmissão ao vivo</p>
                    <p className="mt-1 text-sm text-muted">{mine?.status === 'confirmed' || status === 'completed' ? 'O link fica disponível para inscritos e a gravação, após o evento.' : 'Confirme sua inscrição para receber o link e os lembretes.'}</p>
                  </div>
                  <Button variant="secondary" size="sm" className="mt-4 w-fit" href={event.streamUrl} iconRight={<ExternalLink className="size-3.5" />}>
                    {status === 'completed' ? 'Ver gravação' : 'Acessar transmissão'}
                  </Button>
                </div>
              )}
            </div>
          </section>

          {(event.organizers?.length || event.supporters?.length) ? (
            <section aria-labelledby="realizacao">
              <h2 id="realizacao" className="mb-6 font-display text-2xl font-semibold">Realização e apoio</h2>
              <SupportersShowcase organizers={event.organizers} supporters={event.supporters} />
            </section>
          ) : null}

          <section aria-labelledby="organizacao" className="panel p-6">
            <p className="eyebrow">Organização</p>
            <h2 id="organizacao" className="mt-2 font-display text-xl font-semibold">{event.organizer.name}</h2>
            <p className="mt-2 text-sm text-muted">{event.organizer.about}</p>
            <a href={`mailto:${event.organizer.contact}`} className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"><Mail className="size-4" /> {event.organizer.contact}</a>
          </section>
        </div>

        <aside className="lg:-mt-24">
          <div className="glass sticky top-24 rounded-2xl p-6 shadow-[var(--shadow-soft)]" style={{ background: 'var(--glass-strong)' }}>
            <dl className="space-y-4 text-sm">
              <div className="flex gap-3"><CalendarDays className="mt-0.5 size-4 shrink-0 text-accent" /><div><dt className="sr-only">Data</dt><dd className="font-medium first-letter:uppercase">{formatDateLong(event.startsAt)}</dd></div></div>
              <div className="flex gap-3"><Clock className="mt-0.5 size-4 shrink-0 text-accent" /><div><dt className="sr-only">Horário</dt><dd>{formatTime(event.startsAt)} – {formatTime(event.endsAt)}</dd></div></div>
              <div className="flex gap-3">{event.modality === 'online' ? <Globe2 className="mt-0.5 size-4 shrink-0 text-accent" /> : <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />}<div><dt className="sr-only">Local</dt><dd>{event.location ? `${event.location.venue}, ${event.location.city}` : 'Online'}{event.modality === 'hibrido' && ' + transmissão'}</dd></div></div>
            </dl>
            <div className="my-6 border-t border-line pt-5">
              <CapacityBar registered={event.registeredCount} capacity={event.capacity} />
            </div>

            {mine?.status === 'confirmed' ? (
              <div className="rounded-xl border border-success/30 bg-success/10 p-4">
                <p className="text-sm font-medium text-success">{status === 'completed' ? (mine.attended ? 'Você participou deste evento' : 'Você estava inscrito') : 'Sua presença está confirmada'}</p>
                <p className="mt-1 font-mono text-xs text-muted">Código {mine.code}</p>
                {status !== 'completed' && <button onClick={cancel} className="mt-3 text-xs text-muted underline underline-offset-2 hover:text-danger">Cancelar inscrição</button>}
              </div>
            ) : (
              <div className="space-y-2">
                <Button className="w-full" size="lg" disabled={status !== 'open'} onClick={() => setMode('confirmed')}>
                  {status === 'open' ? 'Participar do evento' : status === 'full' ? 'Evento lotado' : status === 'completed' ? 'Evento concluído' : 'Inscrições encerradas'}
                </Button>
                {status !== 'completed' && (
                  <Button className="w-full" variant="secondary" icon={<Star className={mine?.status === 'interested' ? 'size-4 fill-warning text-warning' : 'size-4'} />} disabled={mine?.status === 'interested'} onClick={() => setMode('interested')}>
                    {mine?.status === 'interested' ? 'Interesse registrado' : status === 'full' ? 'Entrar na lista de espera' : 'Tenho interesse'}
                  </Button>
                )}
                {status === 'closed' && <p className="pt-1 text-center text-xs text-muted">Registre interesse para ser avisado de novas turmas.</p>}
              </div>
            )}

            <div className="mt-6 border-t border-line pt-5">
              <p className="mb-3 text-xs font-medium text-muted">Adicionar ao calendário</p>
              <AddToCalendar event={event} />
            </div>

            {event.attachments?.length ? (
              <div className="mt-6 border-t border-line pt-5">
                <p className="mb-3 flex items-center gap-2 text-xs font-medium text-muted"><Download className="size-3.5" /> Downloads</p>
                <AttachmentList files={event.attachments} compact />
              </div>
            ) : null}

            {event.links?.length ? (
              <div className="mt-6 border-t border-line pt-5">
                <p className="mb-3 flex items-center gap-2 text-xs font-medium text-muted"><Link2 className="size-3.5" /> Links externos</p>
                <ul className="space-y-1">
                  {event.links.map((l) => (
                    <li key={l.id}>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm text-fg/85 transition hover:bg-fg/[0.04] hover:text-fg">
                        <span className="min-w-0 truncate">{l.label}</span>
                        <ExternalLink className="size-3.5 shrink-0 text-muted group-hover:text-fg" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-6 border-t border-line pt-5">
              <p className="mb-3 flex items-center gap-2 text-xs font-medium text-muted"><Users className="size-3.5" /> Participantes confirmados</p>
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  {confirmed.slice(0, 7).map((r, i) => <Avatar key={r.id} name={r.name} hue={['#6C8CFF', '#A78BFA', '#53DDF5', '#F0A35E', '#5FD3A0'][i % 5]} size={30} className="ring-2 ring-surface" />)}
                </div>
                <span className="ml-3 text-xs text-muted">{event.registeredCount > 7 ? `+${event.registeredCount - Math.min(7, confirmed.length)} pessoas` : `${event.registeredCount} pessoas`}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
              <p className="text-xs font-medium text-muted">Compartilhar</p>
              <ShareButtons title={event.title} />
            </div>
          </div>
        </aside>
      </div>
      <RegistrationModal event={event} open={!!mode} mode={mode ?? 'confirmed'} onClose={() => setMode(null)} />
    </>
  );
}

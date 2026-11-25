import { useState } from 'react';
import { Download, ExternalLink, Pencil, Plus, Search, Trash2, UserCheck, Users, X } from 'lucide-react';
import type { EventItem, EventStatus, Registration, Speaker } from '@/types';
import { eventsService, eventStatus } from '@/services';
import { useQuery } from '@/hooks/useQuery';
import { useDebounced, useDocumentTitle } from '@/hooks/dom';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useToast } from '@/contexts/ToastContext';
import { topics } from '@/data/taxonomy';
import { AdminPageHeader, Can, IconAction, NoPermission, RowActions, Table, Td, Th } from '@/components/admin/AdminUI';
import { CoverField, TagInput } from '@/components/admin/Fields';
import { CapacityBar, EVENT_TYPE_LABEL, EventStatusBadge, MODALITY_LABEL, STATUS_META } from '@/components/content/Cards';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Form';
import { Avatar, Chip } from '@/components/ui/Misc';
import { EmptyState, Skeleton } from '@/components/ui/States';
import { downloadFile, toCSV } from '@/utils/files';
import { formatDate, formatTime, fromLocalInput, slugify, toLocalInput, uid } from '@/utils/format';

const blank = (): EventItem => ({
  id: uid('ev'), slug: '', title: '', summary: '', description: '', cover: '', type: 'palestra', modality: 'presencial',
  startsAt: new Date(Date.now() + 7 * 864e5).toISOString(), endsAt: new Date(Date.now() + 7 * 864e5 + 7200e3).toISOString(),
  location: { venue: '', address: '', city: '' }, organizer: { name: 'Horizonte', about: 'Plataforma de divulgação científica.', contact: 'eventos@horizonte.ciencia' },
  capacity: 100, registeredCount: 0, speakers: [], schedule: [], topics: [], tags: [],
});

function AttendeesDrawer({ event, onClose }: { event: EventItem | null; onClose: () => void }) {
  const [q, setQ] = useState('');
  const toast = useToast();
  const { data, loading } = useQuery(() => (event ? eventsService.registrations(event.id) : Promise.resolve([] as Registration[])), [event?.id], ['registrations']);
  const list = (data ?? []).filter((r) => !q || `${r.name} ${r.email}`.toLowerCase().includes(q.toLowerCase()));
  const exportCsv = () => {
    if (!event || !data) return;
    const csv = toCSV(data.map((r) => ({ nome: r.name, email: r.email, status: r.status, codigo: r.code, inscrito_em: formatDate(r.createdAt), presente: r.attended === undefined ? '' : r.attended ? 'sim' : 'não' })));
    downloadFile(`inscritos-${event.slug}.csv`, '﻿' + csv, 'text/csv;charset=utf-8');
    toast({ title: 'Lista exportada', description: `${data.length} registros em CSV.` });
  };
  return (
    <Modal open={!!event} onClose={onClose} side title="Inscritos" description={event?.title} footer={<Button icon={<Download className="size-4" />} onClick={exportCsv} disabled={!data?.length}>Exportar CSV</Button>}>
      {event && <div className="mb-5"><CapacityBar registered={event.registeredCount} capacity={event.capacity} /><p className="mt-2 text-xs text-muted">A lista abaixo mostra os registros detalhados disponíveis nesta demonstração.</p></div>}
      <Input leading={<Search className="size-4" />} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou e-mail" className="mb-4" aria-label="Buscar inscritos" />
      {loading ? <Skeleton className="h-40" /> : list.length === 0 ? <EmptyState title="Nenhum inscrito" /> : (
        <ul className="divide-y divide-line">
          {list.map((r) => (
            <li key={r.id} className="flex items-center gap-3 py-3">
              <Avatar name={r.name} size={32} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{r.name}</p>
                <p className="truncate font-mono text-[11px] text-muted">{r.email} · {r.code}</p>
              </div>
              <span className={`font-mono text-[10px] uppercase ${r.status === 'confirmed' ? 'text-success' : r.status === 'cancelled' ? 'text-muted line-through' : 'text-warning'}`}>{r.status === 'confirmed' ? 'confirmado' : r.status === 'cancelled' ? 'cancelado' : 'interesse'}</span>
              {r.status === 'confirmed' && (
                <button onClick={() => eventsService.setAttendance(r.id, !r.attended)} className={`rounded-md border px-2 py-1 text-[11px] ${r.attended ? 'border-success/40 bg-success/10 text-success' : 'border-line text-muted'}`} aria-pressed={!!r.attended}>
                  <UserCheck className="inline size-3" /> {r.attended ? 'Presente' : 'Marcar'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

export default function AdminEvents() {
  useDocumentTitle('Gerenciar eventos');
  const { can } = useAuth();
  const confirm = useConfirm();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [statusF, setStatusF] = useState<EventStatus | 'all'>('all');
  const dq = useDebounced(q);
  const { data, loading } = useQuery(() => eventsService.list({ q: dq, status: statusF, when: 'all' }), [dq, statusF], ['events']);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [attendees, setAttendees] = useState<EventItem | null>(null);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!can('events:manage')) return <NoPermission what="gerenciar eventos" />;

  const open = (e?: EventItem) => {
    setEditing(e ? structuredClone(e) : blank());
    setIsNew(!e);
    setTouched(false);
  };
  const set = <K extends keyof EventItem>(k: K, v: EventItem[K]) => setEditing((e) => (e ? { ...e, [k]: v } : e));

  const errors = editing
    ? {
        title: !editing.title.trim() ? 'Informe o nome do evento.' : undefined,
        summary: !editing.summary.trim() ? 'Escreva uma descrição curta.' : undefined,
        dates: new Date(editing.endsAt) <= new Date(editing.startsAt) ? 'O término deve ser depois do início.' : undefined,
        location: editing.modality !== 'online' && !editing.location?.venue.trim() ? 'Informe o local.' : undefined,
        stream: editing.modality !== 'presencial' && !editing.streamUrl?.trim() ? 'Informe o link da transmissão.' : undefined,
        capacity: editing.capacity < 1 ? 'Defina ao menos 1 vaga.' : undefined,
        cover: !editing.cover ? 'Escolha uma imagem de capa.' : undefined,
      }
    : {};

  const save = async () => {
    if (!editing) return;
    setTouched(true);
    if (Object.values(errors).some(Boolean)) return toast({ title: 'Revise os campos destacados', variant: 'error' });
    setSaving(true);
    const payload = { ...editing, slug: editing.slug || slugify(editing.title), location: editing.modality === 'online' ? undefined : editing.location };
    if (isNew) await eventsService.create(payload);
    else await eventsService.update(payload.id, payload);
    setSaving(false);
    setEditing(null);
    toast({ title: isNew ? 'Evento criado' : 'Evento atualizado', description: payload.title });
  };

  const remove = async (e: EventItem) => {
    if (!(await confirm({ title: 'Excluir evento?', description: `“${e.title}” e suas ${e.registeredCount} inscrições deixarão de aparecer no site.`, confirmLabel: 'Excluir evento' }))) return;
    await eventsService.remove(e.id);
    toast({ title: 'Evento excluído', variant: 'info' });
  };

  const setSpeaker = (i: number, patch: Partial<Speaker>) => editing && set('speakers', editing.speakers.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const e = (k: keyof typeof errors) => (touched ? errors[k] : undefined);

  return (
    <>
      <AdminPageHeader title="Eventos" description="Agenda, inscrições, palestrantes e status." actions={<Button onClick={() => open()} icon={<Plus className="size-4" />}>Novo evento</Button>} />
      <div className="mb-4 grid gap-2 sm:grid-cols-[280px_220px]">
        <Input leading={<Search className="size-4" />} value={q} onChange={(ev) => setQ(ev.target.value)} placeholder="Buscar eventos" aria-label="Buscar eventos" />
        <Select value={statusF} onChange={(ev) => setStatusF(ev.target.value as EventStatus | 'all')} aria-label="Status"><option value="all">Todos os status</option>{Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</Select>
      </div>
      {loading || !data ? <div className="space-y-2">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-16" />)}</div> : data.length === 0 ? <EmptyState title="Nenhum evento" /> : (
        <Table>
          <thead><tr><Th>Evento</Th><Th>Data</Th><Th>Status</Th><Th className="w-48">Vagas</Th><Th /></tr></thead>
          <tbody>
            {data.map((ev) => (
              <tr key={ev.id} className="hover:bg-fg/[0.02]">
                <Td>
                  <div className="flex items-center gap-3">
                    <img src={ev.cover} alt="" className="size-11 shrink-0 rounded-md object-cover" loading="lazy" />
                    <div className="min-w-0">
                      <button onClick={() => open(ev)} className="line-clamp-1 text-left font-medium hover:text-primary">{ev.title}</button>
                      <p className="font-mono text-[11px] text-muted">{EVENT_TYPE_LABEL[ev.type]} · {MODALITY_LABEL[ev.modality]}</p>
                    </div>
                  </div>
                </Td>
                <Td className="font-mono text-xs whitespace-nowrap text-muted">{formatDate(ev.startsAt)}<br />{formatTime(ev.startsAt)}</Td>
                <Td>
                  <Select
                    value={ev.statusOverride ?? 'auto'}
                    onChange={async (x) => { await eventsService.update(ev.id, { statusOverride: x.target.value === 'auto' ? undefined : (x.target.value as EventStatus) }); toast({ title: 'Status atualizado' }); }}
                    className="h-8 w-44 text-xs"
                    aria-label="Alterar status do evento"
                  >
                    <option value="auto">Automático · {STATUS_META[eventStatus({ ...ev, statusOverride: undefined })].label}</option>
                    <option value="open">Forçar: inscrições abertas</option>
                    <option value="closed">Forçar: encerradas</option>
                    <option value="full">Forçar: lotado</option>
                  </Select>
                  <div className="mt-1.5"><EventStatusBadge status={eventStatus(ev)} /></div>
                </Td>
                <Td><CapacityBar registered={ev.registeredCount} capacity={ev.capacity} /></Td>
                <Td>
                  <RowActions>
                    <IconAction label="Ver inscritos" onClick={() => setAttendees(ev)}><Users className="size-4" /></IconAction>
                    <IconAction label="Ver no site" onClick={() => window.open(`/eventos/${ev.slug}`, '_blank')}><ExternalLink className="size-4" /></IconAction>
                    <IconAction label="Editar" onClick={() => open(ev)}><Pencil className="size-4" /></IconAction>
                    <IconAction label="Excluir" danger disabled={!can('events:delete')} onClick={() => remove(ev)}><Trash2 className="size-4" /></IconAction>
                  </RowActions>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <AttendeesDrawer event={attendees} onClose={() => setAttendees(null)} />

      <Modal open={!!editing} onClose={() => setEditing(null)} side title={isNew ? 'Novo evento' : 'Editar evento'} footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button><Button loading={saving} onClick={save}>{isNew ? 'Criar evento' : 'Salvar alterações'}</Button></>}>
        {editing && (
          <div className="space-y-5">
            <Field label="Nome do evento" required error={e('title')}>{(id) => <Input id={id} value={editing.title} onChange={(x) => set('title', x.target.value)} />}</Field>
            <Field label="Descrição curta" required error={e('summary')}>{(id) => <Textarea id={id} value={editing.summary} onChange={(x) => set('summary', x.target.value)} className="min-h-16" />}</Field>
            <Field label="Descrição detalhada" hint="Separe parágrafos com uma linha em branco.">{(id) => <Textarea id={id} value={editing.description} onChange={(x) => set('description', x.target.value)} className="min-h-32" />}</Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tipo">{(id) => <Select id={id} value={editing.type} onChange={(x) => set('type', x.target.value as EventItem['type'])}>{Object.entries(EVENT_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>}</Field>
              <Field label="Modalidade">{(id) => <Select id={id} value={editing.modality} onChange={(x) => set('modality', x.target.value as EventItem['modality'])}>{Object.entries(MODALITY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>}</Field>
              <Field label="Início" error={e('dates')}>{(id) => <Input id={id} type="datetime-local" value={toLocalInput(editing.startsAt)} onChange={(x) => set('startsAt', fromLocalInput(x.target.value))} />}</Field>
              <Field label="Término">{(id) => <Input id={id} type="datetime-local" value={toLocalInput(editing.endsAt)} onChange={(x) => set('endsAt', fromLocalInput(x.target.value))} />}</Field>
              <Field label="Limite de participantes" error={e('capacity')}>{(id) => <Input id={id} type="number" min={1} value={editing.capacity} onChange={(x) => set('capacity', Number(x.target.value))} />}</Field>
              <Field label="Encerrar inscrições em">{(id) => <Input id={id} type="datetime-local" value={toLocalInput(editing.registrationDeadline)} onChange={(x) => set('registrationDeadline', x.target.value ? fromLocalInput(x.target.value) : undefined)} />}</Field>
            </div>
            {editing.modality !== 'online' && (
              <div className="grid gap-4 rounded-xl border border-line p-4 sm:grid-cols-2">
                <Field label="Local" required error={e('location')} className="sm:col-span-2">{(id) => <Input id={id} value={editing.location?.venue ?? ''} onChange={(x) => set('location', { ...(editing.location ?? { address: '', city: '' }), venue: x.target.value })} />}</Field>
                <Field label="Endereço">{(id) => <Input id={id} value={editing.location?.address ?? ''} onChange={(x) => set('location', { ...(editing.location ?? { venue: '', city: '' }), address: x.target.value })} />}</Field>
                <Field label="Cidade">{(id) => <Input id={id} value={editing.location?.city ?? ''} onChange={(x) => set('location', { ...(editing.location ?? { venue: '', address: '' }), city: x.target.value })} />}</Field>
              </div>
            )}
            {editing.modality !== 'presencial' && <Field label="Link da transmissão" required error={e('stream')}>{(id) => <Input id={id} type="url" placeholder="https://" value={editing.streamUrl ?? ''} onChange={(x) => set('streamUrl', x.target.value)} />}</Field>}
            <div>
              <p className="mb-2 text-[13px] font-medium">Capa <span className="text-danger">*</span></p>
              <CoverField value={editing.cover} onChange={(v) => set('cover', v)} invalid={!!e('cover')} />
              {e('cover') && <p className="mt-1 text-xs text-danger">{e('cover')}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Organizador">{(id) => <Input id={id} value={editing.organizer.name} onChange={(x) => set('organizer', { ...editing.organizer, name: x.target.value })} />}</Field>
              <Field label="Contato">{(id) => <Input id={id} value={editing.organizer.contact} onChange={(x) => set('organizer', { ...editing.organizer, contact: x.target.value })} />}</Field>
            </div>

            <div className="rounded-xl border border-line p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[13px] font-medium">Palestrantes</p>
                <Button size="sm" variant="secondary" onClick={() => set('speakers', [...editing.speakers, { id: uid('sp'), name: '', role: '', affiliation: '', hue: '#6C8CFF' }])} icon={<Plus className="size-3.5" />}>Adicionar</Button>
              </div>
              {editing.speakers.length === 0 && <p className="text-xs text-muted">Nenhum palestrante adicionado.</p>}
              <div className="space-y-2">
                {editing.speakers.map((s, i) => (
                  <div key={s.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
                    <Input value={s.name} placeholder="Nome" onChange={(x) => setSpeaker(i, { name: x.target.value })} className="h-8 text-xs" aria-label="Nome do palestrante" />
                    <Input value={s.role} placeholder="Função" onChange={(x) => setSpeaker(i, { role: x.target.value })} className="h-8 text-xs" aria-label="Função" />
                    <Input value={s.affiliation} placeholder="Instituição" onChange={(x) => setSpeaker(i, { affiliation: x.target.value })} className="h-8 text-xs" aria-label="Instituição" />
                    <button onClick={() => set('speakers', editing.speakers.filter((_, j) => j !== i))} className="px-1 text-muted hover:text-danger" aria-label="Remover palestrante"><X className="size-4" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-line p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[13px] font-medium">Programação</p>
                <Button size="sm" variant="secondary" onClick={() => set('schedule', [...editing.schedule, { id: uid('sc'), time: '19:00', title: '' }])} icon={<Plus className="size-3.5" />}>Adicionar</Button>
              </div>
              <div className="space-y-2">
                {editing.schedule.map((s, i) => (
                  <div key={s.id} className="grid grid-cols-[90px_1fr_140px_auto] gap-2">
                    <Input type="time" value={s.time} onChange={(x) => set('schedule', editing.schedule.map((y, j) => (j === i ? { ...y, time: x.target.value } : y)))} className="h-8 text-xs" aria-label="Horário" />
                    <Input value={s.title} placeholder="Atividade" onChange={(x) => set('schedule', editing.schedule.map((y, j) => (j === i ? { ...y, title: x.target.value } : y)))} className="h-8 text-xs" aria-label="Atividade" />
                    <Select value={s.speakerId ?? ''} onChange={(x) => set('schedule', editing.schedule.map((y, j) => (j === i ? { ...y, speakerId: x.target.value || undefined } : y)))} className="h-8 text-xs" aria-label="Palestrante">
                      <option value="">—</option>
                      {editing.speakers.map((sp) => <option key={sp.id} value={sp.id}>{sp.name || 'Sem nome'}</option>)}
                    </Select>
                    <button onClick={() => set('schedule', editing.schedule.filter((_, j) => j !== i))} className="px-1 text-muted hover:text-danger" aria-label="Remover atividade"><X className="size-4" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[13px] font-medium">Áreas</p>
              <div className="flex flex-wrap gap-1.5">{topics.map((t) => <Chip key={t.slug} active={editing.topics.includes(t.slug)} onClick={() => set('topics', editing.topics.includes(t.slug) ? editing.topics.filter((x) => x !== t.slug) : [...editing.topics, t.slug])}>{t.name}</Chip>)}</div>
            </div>
            <div>
              <p className="mb-2 text-[13px] font-medium">Tags</p>
              <TagInput value={editing.tags} onChange={(v) => set('tags', v)} />
            </div>
            <Can perm="events:manage">
              <Field label="Status manual" hint="“Automático” calcula a partir de datas, vagas e prazo.">
                {(id) => (
                  <Select id={id} value={editing.statusOverride ?? ''} onChange={(x) => set('statusOverride', (x.target.value || undefined) as EventStatus | undefined)}>
                    <option value="">Automático</option>
                    <option value="open">Inscrições abertas</option>
                    <option value="closed">Inscrições encerradas</option>
                    <option value="full">Evento lotado</option>
                  </Select>
                )}
              </Field>
            </Can>
          </div>
        )}
      </Modal>
    </>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, History, LayoutDashboard, LogOut, Settings2, Star } from 'lucide-react';
import { eventsService } from '@/services';
import { db } from '@/services';
import { useQuery } from '@/hooks/useQuery';
import { useDocumentTitle } from '@/hooks/dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { topics } from '@/data/taxonomy';
import { Avatar, Chip, Segmented, SmartImage } from '@/components/ui/Misc';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea, Switch } from '@/components/ui/Form';
import { EmptyState, CardSkeleton } from '@/components/ui/States';
import { EventStatusBadge } from '@/components/content/Cards';
import { eventStatus } from '@/services';
import { formatDate, formatTime } from '@/utils/format';
import { isStaff, ROLE_LABEL } from '@/utils/permissions';
import type { EventItem, Registration } from '@/types';

export default function Profile() {
  useDocumentTitle('Meu perfil');
  const { user, logout, updateProfile } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState<'inscricoes' | 'historico' | 'conta'>('inscricoes');
  const [form, setForm] = useState({ name: '', location: '', bio: '', interests: [] as string[], newsletter: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name, location: user.location ?? '', bio: user.bio ?? '', interests: user.interests, newsletter: user.newsletter });
  }, [user]);

  const { data, loading } = useQuery(
    async () => {
      if (!user) return [] as { reg: Registration; event: EventItem }[];
      const [regs, events] = await Promise.all([eventsService.myRegistrations(user.id, user.email), db.events.list()]);
      return regs.map((reg) => ({ reg, event: events.find((e) => e.id === reg.eventId)! })).filter((x) => x.event);
    },
    [user?.id],
    ['registrations', 'events'],
  );

  if (!user)
    return (
      <div className="shell max-w-lg pt-40">
        <EmptyState title="Entre para ver seu perfil" description="Seu perfil reúne inscrições em eventos, histórico de participação e preferências." action={<div className="flex gap-2"><Button to="/login">Entrar</Button><Button to="/cadastro" variant="secondary">Criar conta</Button></div>} />
      </div>
    );

  const now = new Date();
  const active = data?.filter((x) => x.reg.status !== 'cancelled' && new Date(x.event.endsAt) >= now) ?? [];
  const history = data?.filter((x) => new Date(x.event.endsAt) < now || x.reg.status === 'cancelled') ?? [];

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile(form);
    setSaving(false);
    toast({ title: 'Perfil atualizado' });
  };

  const cancel = async (reg: Registration) => {
    if (!(await confirm({ title: 'Cancelar inscrição?', description: 'Sua vaga será liberada para outra pessoa.', confirmLabel: 'Cancelar inscrição' }))) return;
    await eventsService.cancelRegistration(reg);
    toast({ title: 'Inscrição cancelada', variant: 'info' });
  };

  return (
    <div className="shell pt-32 md:pt-40">
      <header className="relative overflow-hidden rounded-[22px] border border-line bg-bg-2 p-6 md:p-10">
        <div className="nebula-bg absolute inset-0" aria-hidden />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <Avatar name={user.name} hue={user.hue} size={84} />
          <div className="flex-1">
            <p className="eyebrow">{ROLE_LABEL[user.role]}</p>
            <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">{user.name}</h1>
            <p className="mt-1 text-sm text-muted">{user.email}{user.location && ` · ${user.location}`}</p>
          </div>
          <div className="flex gap-2">
            {isStaff(user.role) && <Button to="/admin" variant="secondary" icon={<LayoutDashboard className="size-4" />}>Painel</Button>}
            <Button variant="ghost" icon={<LogOut className="size-4" />} onClick={logout}>Sair</Button>
          </div>
        </div>
        <dl className="relative mt-8 grid grid-cols-3 gap-4 border-t border-line pt-6 md:max-w-lg">
          <div><dt className="font-mono text-[10px] tracking-widest text-muted uppercase">Inscrições ativas</dt><dd className="mt-1 font-display text-2xl font-semibold">{active.filter((x) => x.reg.status === 'confirmed').length}</dd></div>
          <div><dt className="font-mono text-[10px] tracking-widest text-muted uppercase">Interesses</dt><dd className="mt-1 font-display text-2xl font-semibold">{active.filter((x) => x.reg.status === 'interested').length}</dd></div>
          <div><dt className="font-mono text-[10px] tracking-widest text-muted uppercase">Participações</dt><dd className="mt-1 font-display text-2xl font-semibold">{history.filter((x) => x.reg.attended).length}</dd></div>
        </dl>
      </header>

      <Segmented layoutId="profile-tabs" value={tab} onChange={setTab} className="mt-10 mb-8 w-fit" options={[
        { value: 'inscricoes', label: <><CalendarCheck className="size-3.5" /> Inscrições</> },
        { value: 'historico', label: <><History className="size-3.5" /> Histórico</> },
        { value: 'conta', label: <><Settings2 className="size-3.5" /> Conta</> },
      ]} />

      {tab !== 'conta' && (loading ? (
        <div className="space-y-3">{[0, 1].map((i) => <CardSkeleton key={i} horizontal />)}</div>
      ) : (tab === 'inscricoes' ? active : history).length === 0 ? (
        <EmptyState title={tab === 'inscricoes' ? 'Nenhuma inscrição ativa' : 'Sem histórico ainda'} description="Explore a agenda e participe de palestras, observações e workshops." action={<Button to="/eventos">Ver eventos</Button>} />
      ) : (
        <ul className="space-y-3">
          {(tab === 'inscricoes' ? active : history).map(({ reg, event }) => (
            <li key={reg.id} className="panel flex flex-col gap-4 p-3 sm:flex-row sm:items-center">
              <SmartImage src={event.cover} alt="" className="aspect-video w-full shrink-0 rounded-lg sm:w-40" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {reg.status === 'interested' ? <Badge tone="warning"><Star className="size-3" /> Interesse</Badge> : reg.status === 'cancelled' ? <Badge>Cancelada</Badge> : <Badge tone="success">Confirmada</Badge>}
                  {tab === 'historico' && reg.attended !== undefined && <Badge tone={reg.attended ? 'accent' : 'neutral'}>{reg.attended ? 'Presente' : 'Ausente'}</Badge>}
                  {tab === 'inscricoes' && <EventStatusBadge status={eventStatus(event)} />}
                </div>
                <Link to={`/eventos/${event.slug}`} className="mt-2 block font-display text-lg font-medium hover:text-primary">{event.title}</Link>
                <p className="font-mono text-xs text-muted">{formatDate(event.startsAt)} · {formatTime(event.startsAt)} · Código {reg.code}</p>
              </div>
              {tab === 'inscricoes' && <Button variant="ghost" size="sm" onClick={() => cancel(reg)}>Cancelar</Button>}
            </li>
          ))}
        </ul>
      ))}

      {tab === 'conta' && (
        <form onSubmit={save} className="panel grid max-w-2xl gap-5 p-6">
          <Field label="Nome">{(id) => <Input id={id} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}</Field>
          <Field label="Cidade">{(id) => <Input id={id} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Ex.: Recife, PE" />}</Field>
          <Field label="Sobre você">{(id) => <Textarea id={id} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Conte o que te fascina no Universo." />}</Field>
          <div>
            <p className="mb-2 text-[13px] font-medium">Interesses</p>
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => <Chip key={t.slug} active={form.interests.includes(t.slug)} onClick={() => setForm({ ...form, interests: form.interests.includes(t.slug) ? form.interests.filter((x) => x !== t.slug) : [...form.interests, t.slug] })}>{t.name}</Chip>)}
            </div>
          </div>
          <Switch checked={form.newsletter} onChange={(v) => setForm({ ...form, newsletter: v })} label="Newsletter semanal" description="Descobertas, artigos e eventos uma vez por semana." />
          <div className="flex justify-end"><Button type="submit" loading={saving}>Salvar alterações</Button></div>
        </form>
      )}
    </div>
  );
}

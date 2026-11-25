import { Link } from 'react-router-dom';
import { CalendarDays, Eye, FileText, Newspaper, Plus, TicketCheck, TrendingUp, Users } from 'lucide-react';
import { statsService } from '@/services';
import { useQuery } from '@/hooks/useQuery';
import { useDocumentTitle } from '@/hooks/dom';
import { useAuth } from '@/contexts/AuthContext';
import { AreaChart, BarList, Sparkline } from '@/components/admin/Charts';
import { AdminPageHeader, Can, StatusBadge } from '@/components/admin/AdminUI';
import { Button } from '@/components/ui/Button';
import { Skeleton, ErrorState } from '@/components/ui/States';
import { formatCompact, formatDate, formatDay, formatMonth, formatTime, relativeTime } from '@/utils/format';

export default function Dashboard() {
  useDocumentTitle('Painel');
  const { user } = useAuth();
  const { data, loading, error, refetch } = useQuery(() => statsService.dashboard(), [], ['articles', 'news', 'events', 'registrations', 'users']);

  if (error) return <ErrorState onRetry={refetch} />;

  const cards = data
    ? [
        { label: 'Artigos', value: data.totals.articles, icon: FileText, to: '/admin/artigos', spark: [4, 5, 5, 6, 8, 9, 12] },
        { label: 'Notícias', value: data.totals.news, icon: Newspaper, to: '/admin/noticias', spark: [6, 7, 9, 8, 11, 13, 15] },
        { label: 'Eventos', value: data.totals.events, icon: CalendarDays, to: '/admin/eventos', spark: [2, 3, 3, 5, 6, 8, 10] },
        { label: 'Usuários', value: data.totals.users, icon: Users, to: '/admin/usuarios', spark: [8, 9, 10, 11, 12, 12.4, 12.5] },
        { label: 'Inscrições', value: data.totals.registrations, icon: TicketCheck, to: '/admin/eventos', spark: [1, 3, 2, 4, 5, 6, 7] },
        { label: 'Visualizações', value: data.totals.views, icon: Eye, to: '/admin/artigos', spark: [3, 4, 4, 6, 5, 7, 9] },
      ]
    : [];

  return (
    <>
      <AdminPageHeader
        title={`Olá, ${user?.name.split(' ')[0]}`}
        description="Visão geral do observatório nos últimos 12 meses."
        actions={
          <Can perm="content:create">
            <Button to="/admin/artigos/novo" icon={<Plus className="size-4" />}>Novo artigo</Button>
          </Can>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {loading || !data
          ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-32 rounded-[14px]" />)
          : cards.map(({ label, value, icon: Icon, to, spark }) => (
              <Link key={label} to={to} className="panel group p-4 transition hover:border-line-strong">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10.5px] tracking-[0.12em] text-muted uppercase">{label}</span>
                  <Icon className="size-4 text-muted group-hover:text-accent" />
                </div>
                <p className="mt-3 font-display text-3xl font-semibold tabular-nums">{formatCompact(value)}</p>
                <div className="mt-2 flex items-end justify-between">
                  <span className="flex items-center gap-1 text-xs text-success"><TrendingUp className="size-3" /> +{Math.round(spark[6]! / spark[0]! * 10)}%</span>
                  <Sparkline values={spark} />
                </div>
              </Link>
            ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="panel p-5 md:p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold">Visualizações por mês</h2>
            <span className="font-mono text-xs text-muted">artigos + notícias</span>
          </div>
          {data ? <AreaChart label="Visualizações por mês" data={data.growth.map((g) => ({ label: g.label, value: g.views }))} /> : <Skeleton className="h-56" />}
        </section>
        <section className="panel p-5 md:p-6">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold">Inscrições por evento</h2>
            <span className="font-mono text-xs text-muted">inscritos / vagas</span>
          </div>
          {data ? <BarList data={data.registrationsByEvent.map((r) => ({ label: r.label, value: r.value, total: r.capacity }))} /> : <Skeleton className="h-56" />}
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="panel p-5 md:p-6">
          <h2 className="mb-5 font-display text-lg font-semibold">Novos usuários por mês</h2>
          {data ? <AreaChart label="Novos usuários por mês" height={180} data={data.growth.map((g) => ({ label: g.label, value: g.users }))} /> : <Skeleton className="h-44" />}
        </section>
        <section className="panel p-5 md:p-6">
          <h2 className="mb-5 font-display text-lg font-semibold">Conteúdos por categoria</h2>
          {data ? <BarList data={[...data.contentByCategory].sort((a, b) => b.value - a.value)} /> : <Skeleton className="h-44" />}
        </section>
        <section className="panel p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Próximos eventos</h2>
            <Link to="/admin/eventos" className="text-xs text-primary hover:underline">Gerenciar</Link>
          </div>
          <ul className="space-y-1">
            {data?.upcoming.map((e) => (
              <li key={e.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-fg/[0.03]">
                <span className="w-10 text-center">
                  <span className="block font-display text-lg leading-none font-semibold">{formatDay(e.startsAt)}</span>
                  <span className="font-mono text-[9px] text-muted">{formatMonth(e.startsAt)}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{e.title}</span>
                  <span className="font-mono text-[11px] text-muted">{formatTime(e.startsAt)} · {e.registeredCount}/{e.capacity}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="panel mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-semibold">Conteúdos recentes</h2>
          <Link to="/admin/artigos" className="text-xs text-primary hover:underline">Ver todos</Link>
        </div>
        <ul>
          {data?.recent.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3 last:border-0">
              <span className="w-16 font-mono text-[10px] tracking-wider text-muted uppercase">{r.kind}</span>
              <Link to={r.kind === 'Artigo' ? `/admin/artigos/${r.id}/editar` : '/admin/noticias'} className="min-w-0 flex-1 truncate text-sm hover:text-primary">{r.title}</Link>
              <StatusBadge status={r.status} />
              <span className="w-28 text-right font-mono text-[11px] text-muted" title={formatDate(r.date)}>{relativeTime(r.date)}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Copy, ExternalLink, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import type { Article, PublishStatus } from '@/types';
import { articlesService } from '@/services';
import { useQuery } from '@/hooks/useQuery';
import { useDebounced, useDocumentTitle } from '@/hooks/dom';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useToast } from '@/contexts/ToastContext';
import { getCategory } from '@/data/taxonomy';
import { getAuthor } from '@/data/authors';
import { AdminPageHeader, Can, IconAction, RowActions, StatusBadge, Table, Td, Th } from '@/components/admin/AdminUI';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Form';
import { Segmented } from '@/components/ui/Misc';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States';
import { formatCompact, formatDate, uid } from '@/utils/format';

export default function AdminArticles() {
  useDocumentTitle('Gerenciar artigos');
  const { can } = useAuth();
  const confirm = useConfirm();
  const toast = useToast();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<PublishStatus | 'all'>('all');
  const [sort, setSort] = useState<'recent' | 'popular'>('recent');
  const dq = useDebounced(q);
  const { data, loading, error, refetch } = useQuery(() => articlesService.list({ q: dq, status, sort, pageSize: 100 }), [dq, status, sort], ['articles']);
  const counts = useQuery(() => articlesService.list({ status: 'all', pageSize: 999 }), [], ['articles']);
  const c = (s: PublishStatus) => counts.data?.items.filter((a) => a.status === s).length ?? 0;

  const remove = async (a: Article) => {
    if (!(await confirm({ title: 'Excluir artigo?', description: `“${a.title}” será removido permanentemente.`, confirmLabel: 'Excluir' }))) return;
    await articlesService.remove(a.id);
    toast({ title: 'Artigo excluído', variant: 'info' });
  };
  const duplicate = async (a: Article) => {
    const copy = { ...a, id: uid('art'), slug: `${a.slug}-copia-${Date.now().toString(36)}`, title: `${a.title} (cópia)`, status: 'draft' as const, featured: false, views: 0 };
    await articlesService.create(copy);
    toast({ title: 'Cópia criada como rascunho' });
  };
  const toggleFeatured = async (a: Article) => {
    await articlesService.update(a.id, { featured: !a.featured });
    toast({ title: a.featured ? 'Removido dos destaques' : 'Marcado como destaque' });
  };

  return (
    <>
      <AdminPageHeader title="Artigos" description="Revista científica: rascunhos, agendamentos e publicações." actions={<Can perm="content:create"><Button to="/admin/artigos/novo" icon={<Plus className="size-4" />}>Novo artigo</Button></Can>} />
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Segmented layoutId="adm-art" value={status} onChange={setStatus} options={[
          { value: 'all', label: 'Todos', count: counts.data?.total },
          { value: 'published', label: 'Publicados', count: c('published') },
          { value: 'scheduled', label: 'Agendados', count: c('scheduled') },
          { value: 'draft', label: 'Rascunhos', count: c('draft') },
        ]} className="w-fit" />
        <div className="grid gap-2 sm:grid-cols-[280px_160px]">
          <Input leading={<Search className="size-4" />} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar artigos" aria-label="Buscar artigos" />
          <Select value={sort} onChange={(e) => setSort(e.target.value as 'recent' | 'popular')} aria-label="Ordenar"><option value="recent">Mais recentes</option><option value="popular">Mais vistos</option></Select>
        </div>
      </div>
      {error ? <ErrorState onRetry={refetch} /> : loading || !data ? (
        <div className="space-y-2">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : data.items.length === 0 ? (
        <EmptyState title="Nenhum artigo" description="Ajuste os filtros ou crie o primeiro artigo." action={<Can perm="content:create"><Button to="/admin/artigos/novo">Criar artigo</Button></Can>} />
      ) : (
        <Table>
          <thead><tr><Th>Artigo</Th><Th>Status</Th><Th>Autor</Th><Th>Data</Th><Th className="text-right">Views</Th><Th /></tr></thead>
          <tbody>
            {data.items.map((a) => (
              <tr key={a.id} className="transition hover:bg-fg/[0.02]">
                <Td>
                  <div className="flex items-center gap-3">
                    <img src={a.cover} alt="" className="size-11 shrink-0 rounded-md object-cover" loading="lazy" />
                    <div className="min-w-0">
                      <Link to={`/admin/artigos/${a.id}/editar`} className="line-clamp-1 font-medium hover:text-primary">{a.title}</Link>
                      <p className="font-mono text-[11px] text-muted">{getCategory(a.categoryId)?.name} {a.featured && <span className="text-accent">· destaque</span>}</p>
                    </div>
                  </div>
                </Td>
                <Td><StatusBadge status={a.status} /></Td>
                <Td className="text-[13px] whitespace-nowrap">{getAuthor(a.authorId).name}</Td>
                <Td className="font-mono text-xs whitespace-nowrap text-muted">{formatDate(a.status === 'scheduled' ? a.scheduledFor ?? a.publishedAt : a.publishedAt)}</Td>
                <Td className="text-right font-mono text-xs">{formatCompact(a.views)}</Td>
                <Td>
                  <RowActions>
                    <IconAction label={a.featured ? 'Remover destaque' : 'Destacar'} onClick={() => toggleFeatured(a)} disabled={!can('content:publish')}><Star className={a.featured ? 'size-4 fill-accent text-accent' : 'size-4'} /></IconAction>
                    <IconAction label="Ver no site" onClick={() => window.open(`/artigos/${a.slug}`, '_blank')}><ExternalLink className="size-4" /></IconAction>
                    <IconAction label="Duplicar" onClick={() => duplicate(a)} disabled={!can('content:create')}><Copy className="size-4" /></IconAction>
                    <IconAction label="Editar" onClick={() => navigate(`/admin/artigos/${a.id}/editar`)} disabled={!can('content:edit')}><Pencil className="size-4" /></IconAction>
                    <IconAction label="Excluir" danger onClick={() => remove(a)} disabled={!can('content:delete')}><Trash2 className="size-4" /></IconAction>
                  </RowActions>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}

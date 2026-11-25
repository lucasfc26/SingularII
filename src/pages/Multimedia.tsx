import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FolderOpen, Image as ImageIcon, LayoutGrid, Search, Video } from 'lucide-react';
import type { MediaCategory, MediaItem } from '@/types';
import { mediaService } from '@/services';
import { useQuery } from '@/hooks/useQuery';
import { useDebounced, useDocumentTitle } from '@/hooks/dom';
import { mediaCategories } from '@/data/media';
import { PageHero } from '@/components/layout/PageHero';
import { MediaCard } from '@/components/content/Cards';
import { MediaViewer } from '@/components/content/MediaViewer';
import { FileRow } from '@/components/content/Downloads';
import { Chip, Segmented } from '@/components/ui/Misc';
import { Input } from '@/components/ui/Form';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States';

type Tab = 'tudo' | 'image' | 'video' | 'file';
const WATCH = ['media', 'articles', 'news', 'events'];

/**
 * Downloads: every image, video and file published anywhere on the site
 * (articles, news, events) plus the media library — searchable by name or
 * by the article/event where it appeared.
 */
export default function Downloads() {
  useDocumentTitle('Downloads');
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>((params.get('aba') as Tab) || 'tudo');
  const [category, setCategory] = useState<MediaCategory | ''>('');
  const [q, setQ] = useState('');
  const dq = useDebounced(q);
  const [index, setIndex] = useState<number | null>(null);

  const { data, loading, error, refetch } = useQuery(() => mediaService.list({ q: dq }), [dq], WATCH);
  const all = data ?? [];
  const visual = useMemo(
    () => all.filter((m) => m.kind !== 'file' && (tab === 'tudo' || m.kind === tab) && (!category || m.category === category)),
    [all, tab, category],
  );
  const files = useMemo(() => all.filter((m) => m.kind === 'file'), [all]);
  const counts = useMemo(() => ({
    image: all.filter((m) => m.kind === 'image').length,
    video: all.filter((m) => m.kind === 'video').length,
    file: files.length,
  }), [all, files]);
  const catCounts = useMemo(() => {
    const c: Record<string, number> = {};
    all.forEach((m) => m.kind !== 'file' && (c[m.category] = (c[m.category] ?? 0) + 1));
    return c;
  }, [all]);

  // deep link from global search: /downloads?item=<id>
  useEffect(() => {
    const id = params.get('item');
    if (!id || !data) return;
    const item = data.find((m) => m.id === id);
    if (!item) return;
    if (item.kind === 'file') {
      setTab('file');
      setQ(item.fileName ?? item.title);
    } else {
      setTab('tudo');
      setCategory('');
      const i = data.filter((m) => m.kind !== 'file').findIndex((m) => m.id === id);
      if (i >= 0) setIndex(i);
    }
  }, [params, data]);

  const close = () => {
    setIndex(null);
    if (params.get('item')) setParams({}, { replace: true });
  };

  const showVisual = tab !== 'file';
  const showFiles = tab === 'file' || tab === 'tudo';

  return (
    <>
      <PageHero
        eyebrow="Downloads"
        title={<>Tudo o que você viu, <span className="text-gradient">num só lugar.</span></>}
        description="Imagens, vídeos, livros, pôsteres e materiais de artigos, notícias e eventos. Esqueceu onde viu um arquivo? Pesquise pelo nome ou pelo título do artigo ou evento."
      />
      <div className="shell">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Segmented
            layoutId="dl-tab"
            value={tab}
            onChange={(t) => setTab(t)}
            className="w-fit"
            options={[
              { value: 'tudo', label: <><LayoutGrid className="size-3.5" /> Tudo</> },
              { value: 'image', label: <><ImageIcon className="size-3.5" /> Imagens</>, count: counts.image },
              { value: 'video', label: <><Video className="size-3.5" /> Vídeos</>, count: counts.video },
              { value: 'file', label: <><FolderOpen className="size-3.5" /> Arquivos</>, count: counts.file },
            ]}
          />
          <div className="md:w-96">
            <Input leading={<Search className="size-4" />} placeholder="Nome do arquivo, artigo ou evento" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar em Downloads" />
          </div>
        </div>

        {showVisual && (
          <div className="no-scrollbar -mx-1 mb-10 flex gap-2 overflow-x-auto px-1 pb-1">
            <Chip active={!category} onClick={() => setCategory('')}>Todas</Chip>
            {mediaCategories.filter((c) => c.id !== 'documentos' && catCounts[c.id]).map((c) => (
              <Chip key={c.id} active={category === c.id} onClick={() => setCategory(category === c.id ? '' : c.id)}>
                {c.label} <span className="font-mono text-[10px] opacity-60">{catCounts[c.id]}</span>
              </Chip>
            ))}
          </div>
        )}

        {error ? (
          <ErrorState onRetry={refetch} />
        ) : loading || !data ? (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">{Array.from({ length: 12 }, (_, i) => <Skeleton key={i} className="mb-4 rounded-[14px]" style={{ height: 200 + ((i * 53) % 160) }} />)}</div>
        ) : (
          <div className="space-y-16">
            {showFiles && (
              <section aria-labelledby="arquivos">
                {tab === 'tudo' && (
                  <h2 id="arquivos" className="mb-5 flex items-center gap-4 font-display text-2xl font-semibold">
                    Arquivos <span className="font-mono text-sm font-normal text-muted">{files.length}</span>
                    <span className="h-px flex-1 bg-line" />
                  </h2>
                )}
                {files.length === 0 ? (
                  <EmptyState title="Nenhum arquivo encontrado" description={dq ? 'Tente o nome do livro, do artigo ou do evento.' : 'Arquivos anexados a artigos, notícias e eventos aparecem aqui automaticamente.'} />
                ) : (
                  <ul className={tab === 'tudo' ? 'grid gap-3 lg:grid-cols-2' : 'space-y-3'}>
                    {(tab === 'tudo' ? files.slice(0, 6) : files).map((f) => <FileRow key={f.id} item={f} />)}
                  </ul>
                )}
                {tab === 'tudo' && files.length > 6 && (
                  <button onClick={() => setTab('file')} className="mt-4 text-sm text-primary hover:underline">Ver todos os {files.length} arquivos</button>
                )}
              </section>
            )}

            {showVisual && (
              <section aria-label="Imagens e vídeos">
                {tab === 'tudo' && (
                  <h2 className="mb-5 flex items-center gap-4 font-display text-2xl font-semibold">
                    Imagens e vídeos <span className="font-mono text-sm font-normal text-muted">{visual.length}</span>
                    <span className="h-px flex-1 bg-line" />
                  </h2>
                )}
                {visual.length === 0 ? (
                  <EmptyState title="Nada encontrado nesta região do céu" description="Tente outra categoria ou termo de busca." />
                ) : (
                  <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
                    {visual.map((m: MediaItem, i) => <MediaCard key={m.id} item={m} index={i} onOpen={() => setIndex(i)} />)}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </div>
      <MediaViewer items={visual} index={index} onClose={close} onIndex={setIndex} />
    </>
  );
}

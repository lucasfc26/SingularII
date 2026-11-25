import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Image as ImageIcon, Search, Video } from 'lucide-react';
import type { MediaCategory } from '@/types';
import { mediaService } from '@/services';
import { useQuery } from '@/hooks/useQuery';
import { useDebounced, useDocumentTitle } from '@/hooks/dom';
import { mediaCategories } from '@/data/media';
import { PageHero } from '@/components/layout/PageHero';
import { MediaCard } from '@/components/content/Cards';
import { MediaViewer } from '@/components/content/MediaViewer';
import { Chip, Segmented } from '@/components/ui/Misc';
import { Skeleton } from '@/components/ui/States';
import { Input } from '@/components/ui/Form';
import { EmptyState, ErrorState } from '@/components/ui/States';

export default function Multimedia() {
  useDocumentTitle('Multimídia');
  const [params, setParams] = useSearchParams();
  const [category, setCategory] = useState<MediaCategory | ''>('');
  const [kind, setKind] = useState<'all' | 'image' | 'video'>('all');
  const [q, setQ] = useState('');
  const dq = useDebounced(q);
  const [index, setIndex] = useState<number | null>(null);

  const { data, loading, error, refetch } = useQuery(() => mediaService.list({ category: category || undefined, kind: kind === 'all' ? undefined : kind, q: dq }), [category, kind, dq], ['media']);
  const all = useQuery(() => mediaService.list(), [], ['media']);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    all.data?.forEach((m) => (c[m.category] = (c[m.category] ?? 0) + 1));
    return c;
  }, [all.data]);

  // deep link from search: /multimidia?item=media-3
  useEffect(() => {
    const id = params.get('item');
    if (!id || !data) return;
    const i = data.findIndex((m) => m.id === id);
    if (i >= 0) setIndex(i);
  }, [params, data]);

  const close = () => {
    setIndex(null);
    if (params.get('item')) setParams({}, { replace: true });
  };

  return (
    <>
      <PageHero eyebrow="Galeria do Universo" title={<>Imagens que mudaram o <span className="text-gradient">que sabemos.</span></>} description="Fotografias astronômicas, registros de telescópios espaciais, simulações e vídeos educativos. Clique em qualquer item para ver em tela cheia." />
      <div className="shell">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Segmented layoutId="mm-kind" value={kind} onChange={setKind} options={[{ value: 'all', label: 'Tudo' }, { value: 'image', label: <><ImageIcon className="size-3.5" /> Imagens</> }, { value: 'video', label: <><Video className="size-3.5" /> Vídeos</> }]} className="w-fit" />
          <div className="md:w-80">
            <Input leading={<Search className="size-4" />} placeholder="Buscar na galeria" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar na galeria" />
          </div>
        </div>
        <div className="no-scrollbar -mx-1 mb-10 flex gap-2 overflow-x-auto px-1 pb-1">
          <Chip active={!category} onClick={() => setCategory('')}>Todas</Chip>
          {mediaCategories.map((c) => (
            <Chip key={c.id} active={category === c.id} onClick={() => setCategory(category === c.id ? '' : c.id)}>
              {c.label} <span className="font-mono text-[10px] opacity-60">{counts[c.id] ?? 0}</span>
            </Chip>
          ))}
        </div>
        {error ? (
          <ErrorState onRetry={refetch} />
        ) : loading || !data ? (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">{Array.from({ length: 12 }, (_, i) => <Skeleton key={i} className="mb-4 rounded-[14px]" style={{ height: 200 + ((i * 53) % 160) }} />)}</div>
        ) : data.length === 0 ? (
          <EmptyState title="Nada encontrado nesta região do céu" description="Tente outra categoria ou termo de busca." />
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
            {data.map((m, i) => <MediaCard key={m.id} item={m} index={i} onOpen={() => setIndex(i)} />)}
          </div>
        )}
      </div>
      <MediaViewer items={data ?? []} index={index} onClose={close} onIndex={setIndex} />
    </>
  );
}

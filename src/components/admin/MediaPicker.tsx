import { useState } from 'react';
import { Search } from 'lucide-react';
import type { MediaItem } from '@/types';
import { mediaService } from '@/services';
import { useQuery } from '@/hooks/useQuery';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Form';
import { Skeleton, EmptyState } from '../ui/States';

/** Choose an image from the media library (used for covers and image blocks). */
export function MediaPicker({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (m: MediaItem) => void }) {
  const [q, setQ] = useState('');
  const { data, loading } = useQuery(() => (open ? mediaService.list({ kind: 'image', q }) : Promise.resolve([])), [open, q], ['media']);
  return (
    <Modal open={open} onClose={onClose} size="xl" title="Biblioteca de mídia" description="Selecione uma imagem.">
      <Input leading={<Search className="size-4" />} placeholder="Buscar imagens" value={q} onChange={(e) => setQ(e.target.value)} className="mb-4" aria-label="Buscar imagens" />
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="aspect-[4/3]" />)}</div>
      ) : !data?.length ? (
        <EmptyState title="Nenhuma imagem" />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {data.map((m) => (
            <button key={m.id} type="button" onClick={() => onSelect(m)} className="group overflow-hidden rounded-lg border border-line text-left transition hover:border-primary focus-visible:border-primary">
              <img src={m.thumb} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover transition group-hover:scale-105" />
              <p className="truncate px-2 py-1.5 text-xs">{m.title}</p>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

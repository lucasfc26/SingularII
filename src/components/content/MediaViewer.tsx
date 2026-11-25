import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, Maximize, Minimize, Pause, Play, Volume2, VolumeX, X } from 'lucide-react';
import type { MediaItem } from '@/types';
import { Link } from 'react-router-dom';
import { mediaCategories } from '@/data/media';
import { useLockBody } from '@/hooks/dom';
import { cn } from '@/utils/cn';

const fmt = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');

export function VideoPlayer({ src, poster, autoPlay }: { src: string; poster?: string; autoPlay?: boolean }) {
  const v = useRef<HTMLVideoElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [muted, setMuted] = useState(false);
  const [vol, setVol] = useState(0.8);
  const [rate, setRate] = useState(1);
  const [fs, setFs] = useState(false);
  const [idle, setIdle] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState(false);
  const idleTimer = useRef<number>();

  const toggle = useCallback(() => {
    const el = v.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => setError(true));
    else el.pause();
  }, []);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === ' ' || e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      }
      if (e.key.toLowerCase() === 'm') setMuted((m) => !m);
      if (e.key === 'ArrowRight' && e.shiftKey && v.current) v.current.currentTime += 5;
    };
    window.addEventListener('keydown', on);
    const onFs = () => setFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => {
      window.removeEventListener('keydown', on);
      document.removeEventListener('fullscreenchange', onFs);
    };
  }, [toggle]);

  useEffect(() => {
    if (v.current) {
      v.current.volume = vol;
      v.current.muted = muted;
      v.current.playbackRate = rate;
    }
  }, [vol, muted, rate]);

  const poke = () => {
    setIdle(false);
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setIdle(true), 2200);
  };

  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else wrap.current?.requestFullscreen?.();
  };

  return (
    <div ref={wrap} onMouseMove={poke} className={cn('group/player relative aspect-video w-full overflow-hidden rounded-xl bg-black', idle && playing && 'cursor-none')}>
      <video
        ref={v}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        playsInline
        preload="metadata"
        onClick={toggle}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onError={() => setError(true)}
        className="size-full object-contain"
      />
      {error && <div className="absolute inset-0 grid place-items-center bg-black/80 text-sm text-white/80">Não foi possível reproduzir este vídeo agora.</div>}
      {buffering && !error && <span className="absolute top-1/2 left-1/2 size-10 -translate-1/2 animate-spin rounded-full border-2 border-white/80 border-t-transparent" aria-label="Carregando" />}
      {!playing && !error && (
        <button onClick={toggle} className="absolute top-1/2 left-1/2 grid size-20 -translate-1/2 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition hover:scale-105 hover:bg-white/20" aria-label="Reproduzir">
          <Play className="ml-1 size-8 fill-current" />
        </button>
      )}
      <div className={cn('absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-4 pt-10 pb-3 text-white transition-opacity duration-300', idle && playing ? 'opacity-0' : 'opacity-100')}>
        <input
          type="range"
          min={0}
          max={dur || 0}
          step={0.1}
          value={time}
          onChange={(e) => v.current && (v.current.currentTime = Number(e.target.value))}
          aria-label="Posição do vídeo"
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-[#53DDF5]"
          style={{ background: `linear-gradient(90deg,#53DDF5 ${(time / (dur || 1)) * 100}%,rgba(255,255,255,.2) 0)` }}
        />
        <div className="mt-2.5 flex items-center gap-3">
          <button onClick={toggle} className="rounded p-1 hover:bg-white/10" aria-label={playing ? 'Pausar' : 'Reproduzir'}>
            {playing ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current" />}
          </button>
          <button onClick={() => setMuted((m) => !m)} className="rounded p-1 hover:bg-white/10" aria-label={muted ? 'Ativar som' : 'Silenciar'}>
            {muted || vol === 0 ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
          </button>
          <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : vol} onChange={(e) => { setVol(Number(e.target.value)); setMuted(false); }} aria-label="Volume" className="hidden w-20 accent-white sm:block" />
          <span className="font-mono text-xs text-white/80 tabular-nums">{fmt(time)} / {fmt(dur)}</span>
          <span className="flex-1" />
          <button onClick={() => setRate((r) => (r >= 2 ? 0.5 : r + 0.5))} className="rounded px-1.5 py-0.5 font-mono text-xs hover:bg-white/10" aria-label="Velocidade de reprodução">
            {rate}×
          </button>
          <button onClick={fullscreen} className="rounded p-1 hover:bg-white/10" aria-label={fs ? 'Sair da tela cheia' : 'Tela cheia'}>
            {fs ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Lightbox for images and modal player for videos, with navigation between items. */
export function MediaViewer({ items, index, onClose, onIndex }: { items: MediaItem[]; index: number | null; onClose: () => void; onIndex: (i: number) => void }) {
  const open = index !== null && !!items[index];
  useLockBody(open);
  const item = open ? items[index!]! : null;
  const prev = useCallback(() => index !== null && onIndex((index - 1 + items.length) % items.length), [index, items.length, onIndex]);
  const next = useCallback(() => index !== null && onIndex((index + 1) % items.length), [index, items.length, onIndex]);

  useEffect(() => {
    if (!open) return;
    const on = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (item?.kind === 'image') {
        if (e.key === 'ArrowLeft') prev();
        if (e.key === 'ArrowRight') next();
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [open, onClose, prev, next, item?.kind]);

  const cat = item && mediaCategories.find((c) => c.id === item.category);

  return createPortal(
    <AnimatePresence>
      {open && item && (
        <motion.div className="fixed inset-0 z-[140] flex flex-col bg-[#03040a]/95 text-[#F4F6FC] backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={item.title}>
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <p className="font-mono text-xs text-white/60 tabular-nums">{index! + 1} / {items.length}</p>
            <div className="flex items-center gap-1">
              {item.kind === 'image' && (
                <a href={item.src} target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Abrir imagem original em nova aba">
                  <Download className="size-5" />
                </a>
              )}
              <button onClick={onClose} className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Fechar">
                <X className="size-6" />
              </button>
            </div>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-16">
            <AnimatePresence mode="wait">
              <motion.div key={item.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }} className="flex size-full items-center justify-center">
                {item.kind === 'video' ? (
                  <div className="w-full max-w-5xl">
                    <VideoPlayer src={item.src} poster={item.thumb} autoPlay />
                  </div>
                ) : (
                  <img src={item.src} alt={item.title} className="max-h-full max-w-full rounded-lg object-contain shadow-2xl" />
                )}
              </motion.div>
            </AnimatePresence>
            {items.length > 1 && (
              <>
                <button onClick={prev} className="absolute top-1/2 left-2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/5 text-white backdrop-blur transition hover:bg-white/15 sm:left-4" aria-label="Anterior">
                  <ChevronLeft className="size-5" />
                </button>
                <button onClick={next} className="absolute top-1/2 right-2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/5 text-white backdrop-blur transition hover:bg-white/15 sm:right-4" aria-label="Próximo">
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </div>
          <div className="mx-auto w-full max-w-4xl px-5 py-5 sm:py-6">
            <p className="font-mono text-[10px] tracking-[0.16em] text-[#53DDF5] uppercase">{cat?.label}</p>
            <h2 className="mt-1.5 font-display text-xl font-semibold sm:text-2xl">{item.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/70">{item.description}</p>
            <p className="mt-3 font-mono text-[11px] text-white/50">Fonte: {item.credit}</p>
            {item.sources?.length ? (
              <p className="mt-2 text-xs text-white/60">
                Aparece em:{' '}
                {item.sources.map((s, i) => (
                  <span key={s.to}>
                    {i > 0 && ' · '}
                    <Link to={s.to} onClick={onClose} className="text-[#53DDF5] hover:underline">{s.type} “{s.title}”</Link>
                  </span>
                ))}
              </p>
            ) : null}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

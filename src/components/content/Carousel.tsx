import { useEffect, useRef, useState, type ReactNode } from 'react';
import { animate, motion, useMotionValue } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * Drag + arrow + pagination carousel. Item width adapts to the viewport;
 * snapping happens on drag end based on velocity and offset.
 */
export function Carousel<T>({ items, render, label, perView = { base: 1.1, sm: 1.6, lg: 2.6 } }: { items: T[]; render: (item: T, i: number) => ReactNode; label: string; perView?: { base: number; sm: number; lg: number } }) {
  const viewport = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const x = useMotionValue(0);
  const dragged = useRef(false);
  const gap = 20;

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pv = width >= 1024 ? perView.lg : width >= 640 ? perView.sm : perView.base;
  const itemW = width ? (width - gap * (Math.ceil(pv) - 1)) / pv : 0;
  const maxIndex = Math.max(0, items.length - Math.floor(pv));
  const step = itemW + gap;

  const go = (i: number) => {
    const next = Math.max(0, Math.min(maxIndex, i));
    setIndex(next);
    animate(x, -next * step, { type: 'spring', stiffness: 260, damping: 34 });
  };

  useEffect(() => {
    x.set(-Math.min(index, maxIndex) * step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, maxIndex]);

  return (
    <div role="region" aria-roledescription="carrossel" aria-label={label} onKeyDown={(e) => {
      if (e.key === 'ArrowRight') go(index + 1);
      if (e.key === 'ArrowLeft') go(index - 1);
    }}>
      <div ref={viewport} className="overflow-visible">
        <motion.ul
          className="flex cursor-grab touch-pan-y active:cursor-grabbing"
          style={{ x, gap }}
          drag="x"
          dragConstraints={{ left: -maxIndex * step, right: 0 }}
          dragElastic={0.12}
          onDragStart={() => (dragged.current = true)}
          onDragEnd={(_, info) => {
            const projected = -x.get() - info.velocity.x * 0.25;
            go(Math.round(projected / step));
            setTimeout(() => (dragged.current = false), 50);
          }}
          onClickCapture={(e) => {
            if (dragged.current) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          {items.map((it, i) => (
            <li
              key={i}
              className={cn('shrink-0 transition-opacity duration-500', i < index || i > index + Math.ceil(pv) - 1 ? 'opacity-40' : 'opacity-100')}
              style={{ width: itemW || '85%' }}
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${items.length}`}
            >
              {render(it, i)}
            </li>
          ))}
        </motion.ul>
      </div>
      <div className="mt-8 flex items-center justify-between gap-6">
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Paginação do carrossel">
          {Array.from({ length: maxIndex + 1 }, (_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === index}
              aria-label={`Ir para o item ${i + 1}`}
              onClick={() => go(i)}
              className={cn('h-1.5 rounded-full transition-all duration-500', i === index ? 'w-8 bg-fg' : 'w-1.5 bg-fg/20 hover:bg-fg/40')}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted tabular-nums">
            {String(index + 1).padStart(2, '0')} / {String(maxIndex + 1).padStart(2, '0')}
          </span>
          <button onClick={() => go(index - 1)} disabled={index === 0} className="grid size-11 place-items-center rounded-full border border-line text-fg transition hover:border-line-strong hover:bg-fg/5 disabled:opacity-30" aria-label="Anterior">
            <ArrowLeft className="size-4" />
          </button>
          <button onClick={() => go(index + 1)} disabled={index >= maxIndex} className="grid size-11 place-items-center rounded-full border border-line text-fg transition hover:border-line-strong hover:bg-fg/5 disabled:opacity-30" aria-label="Próximo">
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

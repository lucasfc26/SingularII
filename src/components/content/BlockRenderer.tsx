import { Info, Quote } from 'lucide-react';
import type { Block } from '@/types';
import { RichText, TeX } from './Math';
import { BarChart } from './BarChart';
import { SmartImage } from '../ui/Misc';
import { slugify } from '@/utils/format';

export const headingId = (text: string) => slugify(text).slice(0, 60);

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose-cosmos">
      {blocks.map((b) => {
        switch (b.type) {
          case 'heading':
            return b.level === 2 ? (
              <h2 key={b.id} id={headingId(b.text)} className="scroll-mt-28">{b.text}</h2>
            ) : (
              <h3 key={b.id} id={headingId(b.text)} className="scroll-mt-28">{b.text}</h3>
            );
          case 'paragraph':
            return <RichText key={b.id} html={b.html} />;
          case 'list': {
            const Tag = b.ordered ? 'ol' : 'ul';
            return (
              <Tag key={b.id}>
                {b.items.map((it, i) => <RichText key={i} as="li" html={it} />)}
              </Tag>
            );
          }
          case 'quote':
            return (
              <blockquote key={b.id} className="relative my-10 border-l-2 border-accent/60 py-1 pl-6">
                <Quote className="absolute -top-2 -left-3 size-5 rounded bg-bg p-0.5 text-accent" aria-hidden />
                <p className="font-display text-[1.35rem] leading-snug text-fg">{b.text}</p>
                {b.cite && <footer className="mt-3 font-mono text-xs tracking-wide text-muted">— {b.cite}</footer>}
              </blockquote>
            );
          case 'image':
            return (
              <figure key={b.id} className="my-10 -mx-1 sm:-mx-8">
                <SmartImage src={b.src} alt={b.caption ?? ''} className="aspect-[16/9] rounded-xl" />
                {(b.caption || b.credit) && (
                  <figcaption className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 px-1 text-[13px] leading-snug text-muted sm:px-8">
                    <span>{b.caption}</span>
                    {b.credit && <span className="font-mono text-[11px]">Crédito: {b.credit}</span>}
                  </figcaption>
                )}
              </figure>
            );
          case 'video':
            return (
              <figure key={b.id} className="my-10 -mx-1 sm:-mx-8">
                <video src={b.src} poster={b.poster} controls preload="none" playsInline className="aspect-video w-full rounded-xl bg-black" />
                {b.caption && <figcaption className="mt-3 px-1 text-[13px] text-muted sm:px-8">{b.caption}</figcaption>}
              </figure>
            );
          case 'formula':
            return (
              <figure key={b.id} className="panel my-8 overflow-hidden px-5 py-6 text-center text-fg">
                <TeX tex={b.tex} block />
                {b.caption && <figcaption className="mt-4 text-[13px] leading-snug text-muted">{b.caption}</figcaption>}
              </figure>
            );
          case 'chart':
            return <div key={b.id} className="my-10"><BarChart title={b.title} data={b.data} unit={b.unit} /></div>;
          case 'callout':
            return (
              <aside key={b.id} className="my-8 rounded-xl border border-primary/25 bg-primary/[0.07] p-5">
                <p className="mb-1.5 flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-primary uppercase">
                  <Info className="size-3.5" aria-hidden /> {b.title ?? 'Nota'}
                </p>
                <p className="text-[15px] leading-relaxed text-fg/90">{b.text}</p>
              </aside>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

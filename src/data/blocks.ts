import type { Block, Reference } from '@/types';

/* Tiny builders that keep the mock content readable. */
let n = 0;
const id = () => `b${++n}`;

export const h2 = (text: string): Block => ({ id: id(), type: 'heading', level: 2, text });
export const h3 = (text: string): Block => ({ id: id(), type: 'heading', level: 3, text });
export const p = (html: string): Block => ({ id: id(), type: 'paragraph', html });
export const ul = (...items: string[]): Block => ({ id: id(), type: 'list', ordered: false, items });
export const ol = (...items: string[]): Block => ({ id: id(), type: 'list', ordered: true, items });
export const quote = (text: string, cite?: string): Block => ({ id: id(), type: 'quote', text, cite });
export const img = (src: string, caption?: string, credit = 'NASA'): Block => ({ id: id(), type: 'image', src, caption, credit });
export const video = (src: string, poster?: string, caption?: string): Block => ({ id: id(), type: 'video', src, poster, caption });
export const tex = (t: string, caption?: string): Block => ({ id: id(), type: 'formula', tex: t, caption });
export const chart = (title: string, data: { label: string; value: number }[], unit?: string): Block => ({ id: id(), type: 'chart', title, data, unit });
export const callout = (text: string, title?: string): Block => ({ id: id(), type: 'callout', text, title });

let r = 0;
export const ref = (authors: string, title: string, source: string, year: number, url?: string): Reference => ({
  id: `r${++r}`,
  authors,
  title,
  source,
  year,
  url,
});

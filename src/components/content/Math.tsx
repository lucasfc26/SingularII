import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { sanitizeHtml } from '@/utils/sanitize';

/* KaTeX integration. Display formulas render via <TeX block>, and inline
   `$...$` segments inside rich text are expanded by `renderInlineMath`. */

export function TeX({ tex, block }: { tex: string; block?: boolean }) {
  const html = useMemo(() => katex.renderToString(tex, { throwOnError: false, displayMode: !!block, strict: 'ignore' }), [tex, block]);
  return block ? <div className="katex-wrap" dangerouslySetInnerHTML={{ __html: html }} /> : <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export function renderInlineMath(html: string) {
  const safe = sanitizeHtml(html);
  return safe.replace(/\$([^$]+)\$/g, (_, expr: string) => {
    const decoded = expr.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    return katex.renderToString(decoded, { throwOnError: false, strict: 'ignore' });
  });
}

export function RichText({ html, className, as: Tag = 'p' }: { html: string; className?: string; as?: 'p' | 'span' | 'li' }) {
  const out = useMemo(() => renderInlineMath(html), [html]);
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: out }} />;
}

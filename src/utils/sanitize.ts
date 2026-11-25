/** Minimal allow-list sanitizer for editor HTML (bold, italic, links, code). */
const ALLOWED = new Set(['B', 'STRONG', 'I', 'EM', 'A', 'CODE', 'BR', 'SUB', 'SUP', 'U', 'SPAN']);

export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') return html;
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  const walk = (node: Node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        if (!ALLOWED.has(el.tagName)) {
          if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT'].includes(el.tagName)) {
            el.remove();
            return;
          }
          walk(el);
          el.replaceWith(...el.childNodes);
          return;
        }
        [...el.attributes].forEach((attr) => {
          const keep = el.tagName === 'A' && attr.name === 'href' && /^(https?:|mailto:|\/)/i.test(attr.value);
          if (!keep) el.removeAttribute(attr.name);
        });
        if (el.tagName === 'A') {
          el.setAttribute('target', '_blank');
          el.setAttribute('rel', 'noopener noreferrer');
        }
        walk(el);
      } else if (child.nodeType !== Node.TEXT_NODE) {
        child.remove();
      }
    });
  };
  walk(tpl.content);
  return tpl.innerHTML;
}

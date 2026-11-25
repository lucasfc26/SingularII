import type { Paginated } from '@/types';

export function normalize(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function matches(q: string | undefined, ...fields: (string | undefined | string[])[]) {
  if (!q?.trim()) return true;
  const needle = normalize(q.trim());
  return fields.some((f) => (Array.isArray(f) ? f.some((x) => normalize(x).includes(needle)) : f && normalize(f).includes(needle)));
}

export function paginate<T>(items: T[], page = 1, pageSize = 12): Paginated<T> {
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const p = Math.min(Math.max(1, page), pages);
  return { items: items.slice((p - 1) * pageSize, p * pageSize), total: items.length, page: p, pages };
}

export const byDate = <T,>(get: (x: T) => string, dir: 'recent' | 'oldest' = 'recent') => (a: T, b: T) =>
  dir === 'recent' ? +new Date(get(b)) - +new Date(get(a)) : +new Date(get(a)) - +new Date(get(b));

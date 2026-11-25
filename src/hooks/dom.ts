import { useEffect, useState, type RefObject } from 'react';

export function useMediaQuery(query: string) {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');

export function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > threshold);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [threshold]);
  return scrolled;
}

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    if (!title) return;
    const prev = document.title;
    document.title = `${title} · SingularII`;
    return () => {
      document.title = prev;
    };
  }, [title]);
}

export function useDebounced<T>(value: T, ms = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function useLockBody(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    const pad = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${pad}px`;
    return () => {
      document.body.style.overflow = prev;
      document.body.style.paddingRight = '';
    };
  }, [locked]);
}

export function useClickOutside(ref: RefObject<HTMLElement>, cb: () => void, active = true) {
  useEffect(() => {
    if (!active) return;
    const on = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && cb();
    document.addEventListener('mousedown', on);
    return () => document.removeEventListener('mousedown', on);
  }, [ref, cb, active]);
}

/** Sets --mx / --my on the element for the cursor spotlight effect. */
export function spotlightHandler(e: React.MouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
}

export function useInView<T extends Element>(ref: RefObject<T>, rootMargin = '200px') {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

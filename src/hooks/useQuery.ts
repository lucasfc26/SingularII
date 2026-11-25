import { useCallback, useEffect, useRef, useState } from 'react';
import { CHANGE_EVENT } from '@/services/store';

interface QueryState<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Minimal data-fetching hook. `deps` re-run the query; `watch` lists
 * collections whose mutations should trigger a silent refetch (so the UI
 * stays in sync after CRUD actions). Swap for TanStack Query when a real
 * backend is introduced.
 */
export function useQuery<T>(fn: () => Promise<T>, deps: unknown[], watch: string[] = []): QueryState<T> {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const reqId = useRef(0);

  const run = useCallback((silent = false) => {
    const id = ++reqId.current;
    if (!silent) setLoading(true);
    setError(null);
    fnRef
      .current()
      .then((d) => id === reqId.current && setData(d))
      .catch((e: Error) => id === reqId.current && setError(e))
      .finally(() => id === reqId.current && setLoading(false));
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    run();
  }, deps);

  const watchKey = watch.join('|');
  useEffect(() => {
    if (!watchKey) return;
    const keys = watchKey.split('|');
    const onChange = (e: Event) => keys.includes((e as CustomEvent<string>).detail) && run(true);
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, [watchKey, run]);

  return { data, loading, error, refetch: () => run() };
}

export function useMutation<A extends unknown[], R>(fn: (...args: A) => Promise<R>) {
  const [loading, setLoading] = useState(false);
  const mutate = useCallback(
    async (...args: A) => {
      setLoading(true);
      try {
        return await fn(...args);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return { mutate, loading };
}

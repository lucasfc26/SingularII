import { delay, ApiError } from './http';

const PREFIX = 'horizonte:v1:';
export const CHANGE_EVENT = 'horizonte:change';

export function emitChange(collection: string) {
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: collection }));
}

function read<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* ignore corrupt storage */
  }
  return seed;
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    throw new ApiError('Armazenamento local cheio. Remova arquivos grandes da biblioteca de mídia.', 507);
  }
}

/** A persisted collection with async, network-like semantics. */
export function createCollection<T extends { id: string }>(name: string, seed: T[]) {
  let cache: T[] | null = null;
  const all = () => (cache ??= read<T[]>(name, seed));
  const commit = (next: T[]) => {
    cache = next;
    write(name, next);
    emitChange(name);
  };
  const clone = <V,>(v: V): V => structuredClone(v);

  return {
    name,
    /** Synchronous snapshot — for derived, non-UI computations only. */
    snapshot: () => clone(all()),
    async list() {
      await delay();
      return clone(all());
    },
    async get(id: string) {
      await delay(120, 300);
      const item = all().find((x) => x.id === id);
      if (!item) throw new ApiError('Não encontrado', 404);
      return clone(item);
    },
    async find(pred: (x: T) => boolean) {
      await delay(120, 320);
      const item = all().find(pred);
      if (!item) throw new ApiError('Não encontrado', 404);
      return clone(item);
    },
    async create(item: T) {
      await delay(250, 600);
      commit([item, ...all()]);
      return clone(item);
    },
    async update(id: string, patch: Partial<T>) {
      await delay(200, 500);
      let updated: T | undefined;
      commit(all().map((x) => (x.id === id ? (updated = { ...x, ...patch }) : x)));
      if (!updated) throw new ApiError('Não encontrado', 404);
      return clone(updated);
    },
    async remove(id: string) {
      await delay(200, 450);
      commit(all().filter((x) => x.id !== id));
    },
    async replaceAll(items: T[]) {
      commit(items);
    },
  };
}

export function resetAllData() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => localStorage.removeItem(k));
}

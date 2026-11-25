/* ------------------------------------------------------------------
   Transport layer. Today every service resolves against a local
   repository; to integrate a backend, implement `request` with fetch
   and point the services at it — the UI only depends on the service
   function signatures.
------------------------------------------------------------------- */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export class ApiError extends Error {
  constructor(message: string, public status = 500) {
    super(message);
  }
}

export const delay = (min = 180, max = 520) =>
  new Promise<void>((r) => setTimeout(r, min + Math.random() * (max - min)));

/** Example of the HTTP implementation the mocks stand in for. */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) throw new ApiError(res.statusText, res.status);
  return res.json() as Promise<T>;
}

import type {
  Article, Category, EventItem, EventStatus, ListParams, MediaItem, NewsItem,
  Paginated, PlatformSettings, Registration, Subscriber, User,
} from '@/types';
import { articles as articleSeed } from '@/data/articles';
import { news as newsSeed } from '@/data/news';
import { events as eventSeed } from '@/data/events';
import { media as mediaSeed } from '@/data/media';
import { users as userSeed, registrations as regSeed, DEMO_PASSWORD } from '@/data/users';
import { categories as categorySeed, topics } from '@/data/taxonomy';
import { createCollection } from './store';
import { matches, paginate, byDate } from './query';
import { ApiError, delay } from './http';
import { uid } from '@/utils/format';

/* ---------------- Collections ---------------- */
export const db = {
  articles: createCollection<Article>('articles', articleSeed),
  news: createCollection<NewsItem>('news', newsSeed),
  events: createCollection<EventItem>('events', eventSeed),
  media: createCollection<MediaItem>('media', mediaSeed),
  users: createCollection<User>('users', userSeed),
  registrations: createCollection<Registration>('registrations', regSeed),
  categories: createCollection<Category>('categories', categorySeed),
  subscribers: createCollection<Subscriber>('subscribers', []),
  settings: createCollection<PlatformSettings>('settings', [
    {
      id: 'settings', name: 'SingularII', tagline: 'Observatório digital de divulgação científica',
      contactEmail: 'contato@singularii.ciencia', defaultTheme: 'dark', registrationsEnabled: true,
      newsletterEnabled: true, commentsEnabled: false, maintenanceMode: false,
    },
  ]),
};

const isLive = (x: { status: string; publishedAt: string }) =>
  x.status === 'published' || (x.status === 'scheduled' && new Date(x.publishedAt) <= new Date());

/* ---------------- Articles ---------------- */
export const articlesService = {
  async list(params: ListParams & { featured?: boolean; seriesId?: string } = {}): Promise<Paginated<Article>> {
    const all = await db.articles.list();
    let items = all.filter((a) => (params.status === 'all' ? true : params.status ? a.status === params.status : isLive(a)));
    if (params.categoryId) items = items.filter((a) => a.categoryId === params.categoryId);
    if (params.topic) items = items.filter((a) => a.topics.includes(params.topic!));
    if (params.tag) items = items.filter((a) => a.tags.includes(params.tag!));
    if (params.featured) items = items.filter((a) => a.featured);
    if (params.seriesId) items = items.filter((a) => a.series?.id === params.seriesId);
    items = items.filter((a) => matches(params.q, a.title, a.excerpt, a.tags));
    items.sort(params.sort === 'popular' ? (a, b) => b.views - a.views : byDate((a) => a.publishedAt, params.sort === 'oldest' ? 'oldest' : 'recent'));
    return paginate(items, params.page, params.pageSize ?? 100);
  },
  getBySlug: (slug: string) => db.articles.find((a) => a.slug === slug),
  get: (id: string) => db.articles.get(id),
  async related(article: Article, limit = 3) {
    const all = (await db.articles.list()).filter((a) => a.id !== article.id && isLive(a));
    const score = (a: Article) => a.topics.filter((t) => article.topics.includes(t)).length * 2 + (a.categoryId === article.categoryId ? 1 : 0);
    return all.sort((a, b) => score(b) - score(a)).slice(0, limit);
  },
  async tags() {
    const all = await db.articles.list();
    return [...new Set(all.flatMap((a) => a.tags))].sort();
  },
  create: (a: Article) => db.articles.create(a),
  update: (id: string, patch: Partial<Article>) => db.articles.update(id, { ...patch, updatedAt: new Date().toISOString() }),
  remove: (id: string) => db.articles.remove(id),
};

/* ---------------- News ---------------- */
export const newsService = {
  async list(params: ListParams = {}): Promise<Paginated<NewsItem>> {
    const all = await db.news.list();
    let items = all.filter((n) => (params.status === 'all' ? true : params.status ? n.status === params.status : isLive(n)));
    if (params.categoryId) items = items.filter((n) => n.categoryId === params.categoryId);
    if (params.topic) items = items.filter((n) => n.topics.includes(params.topic!));
    items = items.filter((n) => matches(params.q, n.title, n.excerpt, n.source.name));
    items.sort(params.sort === 'popular' ? (a, b) => b.views - a.views : byDate((n) => n.publishedAt, params.sort === 'oldest' ? 'oldest' : 'recent'));
    return paginate(items, params.page, params.pageSize ?? 100);
  },
  getBySlug: (slug: string) => db.news.find((n) => n.slug === slug),
  async related(item: NewsItem, limit = 3) {
    const all = (await db.news.list()).filter((n) => n.id !== item.id && isLive(n));
    return all.sort((a, b) => Number(b.categoryId === item.categoryId) - Number(a.categoryId === item.categoryId)).slice(0, limit);
  },
  create: (n: NewsItem) => db.news.create(n),
  update: (id: string, patch: Partial<NewsItem>) => db.news.update(id, patch),
  remove: (id: string) => db.news.remove(id),
};

/* ---------------- Events ---------------- */
export function eventStatus(e: EventItem, now = new Date()): EventStatus {
  if (new Date(e.endsAt) < now) return 'completed';
  if (e.statusOverride) return e.statusOverride;
  if (e.registeredCount >= e.capacity) return 'full';
  if (e.registrationDeadline && new Date(e.registrationDeadline) < now) return 'closed';
  return 'open';
}

export const eventsService = {
  async list(params: { q?: string; type?: string; modality?: string; status?: EventStatus | 'all'; when?: 'upcoming' | 'past' | 'all'; topic?: string } = {}) {
    const all = await db.events.list();
    const now = new Date();
    let items = all;
    if (params.when === 'upcoming') items = items.filter((e) => new Date(e.endsAt) >= now);
    if (params.when === 'past') items = items.filter((e) => new Date(e.endsAt) < now);
    if (params.type) items = items.filter((e) => e.type === params.type);
    if (params.modality) items = items.filter((e) => e.modality === params.modality);
    if (params.topic) items = items.filter((e) => e.topics.includes(params.topic!));
    if (params.status && params.status !== 'all') items = items.filter((e) => eventStatus(e) === params.status);
    items = items.filter((e) => matches(params.q, e.title, e.summary, e.tags, e.location?.city));
    items.sort(byDate((e) => e.startsAt, params.when === 'past' ? 'recent' : 'oldest'));
    return items;
  },
  getBySlug: (slug: string) => db.events.find((e) => e.slug === slug),
  get: (id: string) => db.events.get(id),
  create: (e: EventItem) => db.events.create(e),
  update: (id: string, patch: Partial<EventItem>) => db.events.update(id, patch),
  remove: (id: string) => db.events.remove(id),

  async registrations(eventId: string) {
    return (await db.registrations.list()).filter((r) => r.eventId === eventId).sort(byDate((r) => r.createdAt));
  },
  async myRegistrations(userId?: string, email?: string) {
    return (await db.registrations.list()).filter((r) => (userId && r.userId === userId) || (email && r.email === email));
  },
  async register(event: EventItem, input: { name: string; email: string; userId?: string; status: 'confirmed' | 'interested' }) {
    const settings = await settingsService.get();
    if (!settings.registrationsEnabled) throw new ApiError('As inscrições estão temporariamente desativadas.', 403);
    const fresh = await db.events.get(event.id);
    const status = eventStatus(fresh);
    if (input.status === 'confirmed' && status !== 'open') {
      throw new ApiError(status === 'full' ? 'Este evento atingiu o limite de participantes.' : 'As inscrições para este evento estão encerradas.', 409);
    }
    const existing = (await db.registrations.list()).find(
      (r) => r.eventId === event.id && r.status !== 'cancelled' && (r.email === input.email || (input.userId && r.userId === input.userId)),
    );
    if (existing && existing.status === input.status) throw new ApiError('Você já está inscrito neste evento.', 409);
    const reg: Registration = existing
      ? { ...existing, status: input.status }
      : { id: uid('reg'), eventId: event.id, createdAt: new Date().toISOString(), code: `HZ-${Math.random().toString(36).slice(2, 7).toUpperCase()}`, ...input };
    if (existing) await db.registrations.update(existing.id, { status: input.status });
    else await db.registrations.create(reg);
    if (input.status === 'confirmed' && existing?.status !== 'confirmed') {
      await db.events.update(event.id, { registeredCount: fresh.registeredCount + 1 });
    }
    return reg;
  },
  async cancelRegistration(reg: Registration) {
    await db.registrations.update(reg.id, { status: 'cancelled' });
    if (reg.status === 'confirmed') {
      const ev = await db.events.get(reg.eventId);
      await db.events.update(ev.id, { registeredCount: Math.max(0, ev.registeredCount - 1) });
    }
  },
  setAttendance: (regId: string, attended: boolean) => db.registrations.update(regId, { attended }),
};

/* ---------------- Media ---------------- */
export const mediaService = {
  async list(params: { q?: string; category?: string; kind?: 'image' | 'video'; topic?: string } = {}) {
    let items = await db.media.list();
    if (params.category) items = items.filter((m) => m.category === params.category);
    if (params.kind) items = items.filter((m) => m.kind === params.kind);
    if (params.topic) items = items.filter((m) => m.topics.includes(params.topic!));
    return items.filter((m) => matches(params.q, m.title, m.description, m.credit)).sort(byDate((m) => m.createdAt));
  },
  create: (m: MediaItem) => db.media.create(m),
  update: (id: string, patch: Partial<MediaItem>) => db.media.update(id, patch),
  remove: (id: string) => db.media.remove(id),
};

/* ---------------- Users & auth ---------------- */
export const usersService = {
  async list(params: { q?: string; role?: string; status?: string } = {}) {
    let items = await db.users.list();
    if (params.role) items = items.filter((u) => u.role === params.role);
    if (params.status) items = items.filter((u) => u.status === params.status);
    return items.filter((u) => matches(params.q, u.name, u.email, u.location)).sort(byDate((u) => u.createdAt));
  },
  get: (id: string) => db.users.get(id),
  update: (id: string, patch: Partial<User>) => db.users.update(id, patch),
  create: (u: User) => db.users.create(u),
  remove: (id: string) => db.users.remove(id),
};

export const authService = {
  async login(email: string, password: string) {
    await delay(400, 800);
    const user = db.users.snapshot().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || password !== DEMO_PASSWORD) throw new ApiError('E-mail ou senha incorretos.', 401);
    if (user.status === 'suspended') throw new ApiError('Esta conta está suspensa. Entre em contato com a equipe.', 403);
    return user;
  },
  async register(input: { name: string; email: string; interests: string[]; newsletter: boolean }) {
    await delay(500, 900);
    if (db.users.snapshot().some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new ApiError('Já existe uma conta com este e-mail.', 409);
    }
    const now = new Date().toISOString();
    const user: User = {
      id: uid('u'), name: input.name, email: input.email, role: 'leitor', status: 'active',
      createdAt: now, lastSeenAt: now, interests: input.interests, newsletter: input.newsletter, hue: '#6C8CFF',
    };
    return db.users.create(user);
  },
};

/* ---------------- Newsletter ---------------- */
export const newsletterService = {
  async subscribe(email: string) {
    const all = await db.subscribers.list();
    if (all.some((s) => s.email === email.toLowerCase())) throw new ApiError('Este e-mail já está inscrito na newsletter.', 409);
    return db.subscribers.create({ id: uid('sub'), email: email.toLowerCase(), createdAt: new Date().toISOString() });
  },
};

/* ---------------- Taxonomy ---------------- */
export const categoriesService = {
  list: () => db.categories.list(),
  create: (c: Category) => db.categories.create(c),
  remove: (id: string) => db.categories.remove(id),
};
export const topicsService = {
  list: async () => {
    await delay(100, 250);
    return topics;
  },
};

/* ---------------- Settings ---------------- */
export const settingsService = {
  get: () => db.settings.get('settings'),
  update: (patch: Partial<PlatformSettings>) => db.settings.update('settings', patch),
};

/* ---------------- Global search ---------------- */
export type SearchHit = { kind: 'artigo' | 'notícia' | 'evento' | 'mídia' | 'tema'; title: string; subtitle: string; to: string; image?: string };

export async function searchAll(q: string): Promise<SearchHit[]> {
  if (!q.trim()) return [];
  const [a, n, e, m] = await Promise.all([
    articlesService.list({ q, pageSize: 5 }),
    newsService.list({ q, pageSize: 5 }),
    eventsService.list({ q }),
    mediaService.list({ q }),
  ]);
  const t = topics.filter((x) => matches(q, x.name, x.tagline, x.description));
  return [
    ...t.slice(0, 3).map((x) => ({ kind: 'tema' as const, title: x.name, subtitle: x.tagline, to: `/categorias/${x.slug}`, image: x.cover })),
    ...a.items.map((x) => ({ kind: 'artigo' as const, title: x.title, subtitle: x.excerpt, to: `/artigos/${x.slug}`, image: x.cover })),
    ...n.items.map((x) => ({ kind: 'notícia' as const, title: x.title, subtitle: x.excerpt, to: `/noticias/${x.slug}`, image: x.cover })),
    ...e.slice(0, 4).map((x) => ({ kind: 'evento' as const, title: x.title, subtitle: x.summary, to: `/eventos/${x.slug}`, image: x.cover })),
    ...m.slice(0, 4).map((x) => ({ kind: 'mídia' as const, title: x.title, subtitle: x.description, to: `/multimidia?item=${x.id}`, image: x.thumb })),
  ];
}

/* ---------------- Dashboard ---------------- */
export const statsService = {
  async dashboard() {
    const [arts, nws, evs, usr, regs, med] = await Promise.all([
      db.articles.list(), db.news.list(), db.events.list(), db.users.list(), db.registrations.list(), db.media.list(),
    ]);
    const views = [...arts, ...nws].reduce((s, x) => s + x.views, 0);
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      return d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    });
    // deterministic growth curves for charts
    const growth = months.map((m, i) => ({ label: m, views: Math.round(62000 + i * 9800 + Math.sin(i * 1.3) * 7000), users: Math.round(820 + i * 140 + Math.cos(i) * 60) }));
    return {
      totals: {
        articles: arts.length,
        news: nws.length,
        events: evs.length,
        users: usr.length + 12480,
        registrations: evs.reduce((s, e) => s + e.registeredCount, 0),
        views,
        media: med.length,
      },
      growth,
      registrationsByEvent: evs
        .filter((e) => new Date(e.endsAt) >= new Date())
        .slice(0, 6)
        .map((e) => ({ label: e.title.split(':')[0]!.slice(0, 22), value: e.registeredCount, capacity: e.capacity })),
      contentByCategory: categorySeed.map((c) => ({
        label: c.name, hue: c.hue,
        value: arts.filter((a) => a.categoryId === c.id).length + nws.filter((n) => n.categoryId === c.id).length,
      })),
      recent: [...arts.map((a) => ({ kind: 'Artigo', id: a.id, title: a.title, status: a.status, date: a.updatedAt })),
        ...nws.map((n) => ({ kind: 'Notícia', id: n.id, title: n.title, status: n.status, date: n.publishedAt }))]
        .sort(byDate((x) => x.date)).slice(0, 7),
      upcoming: evs.filter((e) => new Date(e.startsAt) > new Date()).sort(byDate((e) => e.startsAt, 'oldest')).slice(0, 5),
      recentRegistrations: regs.sort(byDate((r) => r.createdAt)).slice(0, 5),
    };
  },
};

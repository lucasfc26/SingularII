/* ------------------------------------------------------------------
   Domain types. Mirror the contract a future REST/GraphQL API would
   return, so services can swap mocks for HTTP calls without touching UI.
------------------------------------------------------------------- */

export type ID = string;
export type ISODate = string;

export type PublishStatus = 'draft' | 'published' | 'scheduled';

export type Role = 'superadmin' | 'admin' | 'editor' | 'colaborador' | 'leitor';
export type AccountStatus = 'active' | 'pending' | 'suspended';

export interface Category {
  id: ID;
  slug: string;
  name: string;
  description: string;
  hue: string; // css color used for accents
}

export interface Topic {
  id: ID;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  cover: string;
  visual: TopicVisualKind;
  keyFigure: { label: string; value: string };
  span?: 'wide' | 'tall' | 'normal';
}

export type TopicVisualKind =
  | 'pendulum'
  | 'wave'
  | 'spacetime'
  | 'star'
  | 'cosmos'
  | 'telescope'
  | 'particles'
  | 'blackhole'
  | 'darkmatter'
  | 'darkenergy';

export interface Author {
  id: ID;
  name: string;
  role: string;
  affiliation: string;
  bio: string;
  hue: string;
}

/* ---------- Rich content blocks ---------- */
export type Block =
  | { id: ID; type: 'heading'; level: 2 | 3; text: string }
  | { id: ID; type: 'paragraph'; html: string }
  | { id: ID; type: 'list'; ordered: boolean; items: string[] }
  | { id: ID; type: 'quote'; text: string; cite?: string }
  | { id: ID; type: 'image'; src: string; caption?: string; credit?: string }
  | { id: ID; type: 'video'; src: string; poster?: string; caption?: string }
  | { id: ID; type: 'formula'; tex: string; caption?: string }
  | { id: ID; type: 'chart'; title: string; unit?: string; data: { label: string; value: number }[] }
  | { id: ID; type: 'callout'; title?: string; text: string };

export type BlockType = Block['type'];

export interface Reference {
  id: ID;
  authors: string;
  title: string;
  source: string;
  year: number;
  url?: string;
}

export interface Article {
  id: ID;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  cover: string;
  categoryId: ID;
  topics: string[]; // topic slugs
  tags: string[];
  authorId: ID;
  publishedAt: ISODate;
  updatedAt: ISODate;
  readingTime: number;
  featured: boolean;
  views: number;
  series?: { id: ID; title: string; part: number; total: number };
  status: PublishStatus;
  scheduledFor?: ISODate;
  content: Block[];
  references: Reference[];
}

export interface NewsItem {
  id: ID;
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  categoryId: ID;
  topics: string[];
  authorId: ID;
  publishedAt: ISODate;
  readingTime: number;
  highlight: boolean;
  views: number;
  source: { name: string; url: string };
  status: PublishStatus;
  scheduledFor?: ISODate;
  body: Block[];
}

export type EventType =
  | 'palestra'
  | 'congresso'
  | 'workshop'
  | 'observacao'
  | 'live'
  | 'seminario'
  | 'encontro';

export type Modality = 'presencial' | 'online' | 'hibrido';
export type EventStatus = 'open' | 'closed' | 'full' | 'completed';

export interface Speaker {
  id: ID;
  name: string;
  role: string;
  affiliation: string;
  hue: string;
}

export interface ScheduleItem {
  id: ID;
  time: string; // HH:mm
  title: string;
  description?: string;
  speakerId?: ID;
}

export interface EventItem {
  id: ID;
  slug: string;
  title: string;
  summary: string;
  description: string;
  cover: string;
  type: EventType;
  modality: Modality;
  startsAt: ISODate;
  endsAt: ISODate;
  location?: { venue: string; address: string; city: string };
  streamUrl?: string;
  organizer: { name: string; about: string; contact: string };
  capacity: number;
  registeredCount: number;
  registrationDeadline?: ISODate;
  statusOverride?: EventStatus; // admin can force a status
  speakers: Speaker[];
  schedule: ScheduleItem[];
  topics: string[];
  tags: string[];
  featured?: boolean;
}

export type MediaCategory =
  | 'fotografias'
  | 'telescopios'
  | 'galaxias'
  | 'nebulosas'
  | 'planetas'
  | 'simulacoes'
  | 'documentarios'
  | 'educativos';

export interface MediaItem {
  id: ID;
  title: string;
  description: string;
  category: MediaCategory;
  kind: 'image' | 'video';
  src: string;
  thumb: string;
  credit: string;
  aspect: number; // width / height, for masonry
  duration?: string;
  createdAt: ISODate;
  topics: string[];
}

export interface User {
  id: ID;
  name: string;
  email: string;
  role: Role;
  status: AccountStatus;
  createdAt: ISODate;
  lastSeenAt: ISODate;
  location?: string;
  bio?: string;
  interests: string[];
  newsletter: boolean;
  hue: string;
}

export interface Registration {
  id: ID;
  eventId: ID;
  userId?: ID;
  name: string;
  email: string;
  createdAt: ISODate;
  status: 'confirmed' | 'interested' | 'cancelled';
  attended?: boolean;
  code: string;
}

export interface Subscriber {
  id: ID;
  email: string;
  createdAt: ISODate;
}

export interface PlatformSettings {
  id: 'settings';
  name: string;
  tagline: string;
  contactEmail: string;
  defaultTheme: 'dark' | 'light';
  registrationsEnabled: boolean;
  newsletterEnabled: boolean;
  commentsEnabled: boolean;
  maintenanceMode: boolean;
}

/* ---------- Query helpers ---------- */
export interface ListParams {
  q?: string;
  categoryId?: string;
  topic?: string;
  tag?: string;
  status?: PublishStatus | 'all';
  sort?: 'recent' | 'oldest' | 'popular';
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

import type { EventItem } from '@/types';

export function downloadFile(filename: string, content: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function toCSV(rows: Record<string, string | number | boolean | undefined>[]) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]!);
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n');
}

const icsDate = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

export function eventToICS(e: EventItem) {
  const where = e.modality === 'online' ? e.streamUrl ?? 'Online' : `${e.location?.venue ?? ''} — ${e.location?.city ?? ''}`;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SingularII//Eventos//PT',
    'BEGIN:VEVENT',
    `UID:${e.id}@singularii.ciencia`,
    `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${icsDate(e.startsAt)}`,
    `DTEND:${icsDate(e.endsAt)}`,
    `SUMMARY:${e.title}`,
    `DESCRIPTION:${e.summary.replace(/\n/g, ' ')}`,
    `LOCATION:${where}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function googleCalendarUrl(e: EventItem) {
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: `${icsDate(e.startsAt)}/${icsDate(e.endsAt)}`,
    details: e.summary,
    location: e.modality === 'online' ? e.streamUrl ?? 'Online' : `${e.location?.venue ?? ''}, ${e.location?.city ?? ''}`,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

/** Downscale an uploaded image so it fits comfortably in localStorage. */
export async function compressImage(file: File, maxSide = 1400, quality = 0.82, format: 'image/jpeg' | 'image/png' = 'image/jpeg'): Promise<{ dataUrl: string; aspect: number }> {
  const src = await readFileAsDataURL(file);
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return { dataUrl: canvas.toDataURL(format, quality), aspect: img.width / img.height };
}

/* ---------- file helpers ---------- */
export type FileFamily = 'pdf' | 'doc' | 'sheet' | 'slides' | 'archive' | 'image' | 'video' | 'audio' | 'book' | 'text' | 'link';

export function fileFamily(name: string, mime = '', url = ''): FileFamily {
  const ext = (name.split('.').pop() ?? '').toLowerCase();
  if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (mime.startsWith('video/') || ['mp4', 'webm', 'mov'].includes(ext)) return 'video';
  if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg'].includes(ext)) return 'audio';
  if (mime === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (['epub', 'mobi'].includes(ext)) return 'book';
  if (['doc', 'docx', 'odt', 'rtf'].includes(ext)) return 'doc';
  if (['xls', 'xlsx', 'ods', 'csv'].includes(ext)) return 'sheet';
  if (['ppt', 'pptx', 'odp', 'key'].includes(ext)) return 'slides';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive';
  if (['txt', 'md', 'tex'].includes(ext) || mime.startsWith('text/')) return 'text';
  if (/^https?:/.test(url) && !ext) return 'link';
  return 'doc';
}

export const FILE_FAMILY_LABEL: Record<FileFamily, string> = {
  pdf: 'PDF', doc: 'Documento', sheet: 'Planilha', slides: 'Apresentação', archive: 'Arquivo compactado',
  image: 'Imagem', video: 'Vídeo', audio: 'Áudio', book: 'Livro', text: 'Texto', link: 'Link externo',
};

export function formatBytes(n?: number) {
  if (!n) return '';
  const u = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (n >= 1024 && i < u.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i ? 1 : 0).replace('.', ',')} ${u[i]}`;
}

export const textFile = (content: string) => `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;

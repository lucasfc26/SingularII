import { Link } from 'react-router-dom';
import { Archive, BookOpen, Download, ExternalLink, FileSpreadsheet, FileText, FileType2, Film, Image as ImageIcon, Link2, Music, Presentation } from 'lucide-react';
import type { Attachment, MediaItem, MediaSource } from '@/types';
import { fileFamily, FILE_FAMILY_LABEL, formatBytes, type FileFamily } from '@/utils/files';
import { cn } from '@/utils/cn';

const ICON: Record<FileFamily, typeof FileText> = {
  pdf: FileType2, doc: FileText, sheet: FileSpreadsheet, slides: Presentation, archive: Archive, image: ImageIcon,
  video: Film, audio: Music, book: BookOpen, text: FileText, link: Link2,
};

export function FileIcon({ family, className }: { family: FileFamily; className?: string }) {
  const Icon = ICON[family];
  return (
    <span className={cn('grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-bg-2 text-accent', className)} aria-hidden>
      <Icon className="size-[18px]" />
    </span>
  );
}

const isRemotePage = (url: string) => /^https?:/.test(url) && !/\.(pdf|epub|zip|docx?|xlsx?|pptx?|txt|mp4|jpe?g|png)(\?|$)/i.test(url);

/** Anchor that downloads data:/blob: files and opens remote files in a new tab. */
export function DownloadLink({ url, name, className, children }: { url: string; name: string; className?: string; children: React.ReactNode }) {
  const local = url.startsWith('data:') || url.startsWith('blob:');
  return (
    <a href={url} {...(local ? { download: name } : { target: '_blank', rel: 'noopener noreferrer' })} className={className}>
      {children}
    </a>
  );
}

export function SourceLinks({ sources, className }: { sources?: MediaSource[]; className?: string }) {
  if (!sources?.length) return null;
  return (
    <p className={cn('text-xs text-muted', className)}>
      Em:{' '}
      {sources.map((s, i) => (
        <span key={s.to}>
          {i > 0 && ' · '}
          <Link to={s.to} className="text-primary hover:underline">
            {s.type} “{s.title}”
          </Link>
        </span>
      ))}
    </p>
  );
}

/** Compact list used in the right-hand frame of events, and under articles/news. */
export function AttachmentList({ files, compact }: { files: Attachment[]; compact?: boolean }) {
  return (
    <ul className={cn('space-y-2', !compact && 'space-y-3')}>
      {files.map((f) => {
        const fam = fileFamily(f.name, f.mime, f.url);
        const remote = isRemotePage(f.url);
        return (
          <li key={f.id}>
            <DownloadLink url={f.url} name={f.name} className={cn('group flex items-center gap-3 rounded-xl border border-line transition hover:border-line-strong hover:bg-fg/[0.03]', compact ? 'p-2' : 'p-3')}>
              <FileIcon family={fam} className={compact ? 'size-9' : undefined} />
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 block text-[13px] leading-snug font-medium text-fg">{f.name}</span>
                <span className="block font-mono text-[10.5px] text-muted">
                  {FILE_FAMILY_LABEL[fam]}
                  {f.size ? ` · ${formatBytes(f.size)}` : ''}
                  {remote ? ' · link externo' : ''}
                </span>
                {!compact && f.description && <span className="mt-0.5 block text-xs text-muted">{f.description}</span>}
              </span>
              {remote ? <ExternalLink className="size-4 shrink-0 text-muted group-hover:text-fg" aria-label="Abrir" /> : <Download className="size-4 shrink-0 text-muted group-hover:text-fg" aria-label="Baixar" />}
            </DownloadLink>
          </li>
        );
      })}
    </ul>
  );
}

/** Row for the public Downloads page (files tab). */
export function FileRow({ item }: { item: MediaItem }) {
  const name = item.fileName ?? item.title;
  const fam = fileFamily(name, item.mime, item.src);
  const remote = isRemotePage(item.src);
  return (
    <li className="panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <FileIcon family={fam} className="size-12" />
        <div className="min-w-0">
          <p className="font-medium text-fg">{name}</p>
          <p className="font-mono text-[11px] text-muted">
            {FILE_FAMILY_LABEL[fam]}
            {item.size ? ` · ${formatBytes(item.size)}` : ''}
          </p>
          {item.description && <p className="mt-1 text-sm text-muted">{item.description}</p>}
          <SourceLinks sources={item.sources} className="mt-1.5" />
        </div>
      </div>
      <DownloadLink url={item.src} name={name} className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-fg px-4 text-[13px] font-medium text-bg transition hover:opacity-90">
        {remote ? <ExternalLink className="size-4" /> : <Download className="size-4" />}
        {remote ? 'Abrir' : 'Baixar'}
      </DownloadLink>
    </li>
  );
}

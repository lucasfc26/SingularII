import { Link2, Linkedin, MessageCircle, Twitter } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { cn } from '@/utils/cn';

export function ShareButtons({ title, className, vertical }: { title: string; className?: string; vertical?: boolean }) {
  const toast = useToast();
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const enc = encodeURIComponent;
  const items = [
    { label: 'Compartilhar no X', icon: Twitter, href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}` },
    { label: 'Compartilhar no LinkedIn', icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { label: 'Compartilhar no WhatsApp', icon: MessageCircle, href: `https://wa.me/?text=${enc(`${title} ${url}`)}` },
  ];
  const copy = async () => {
    try {
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copiado', description: 'Cole onde quiser compartilhar.', variant: 'info' });
    } catch {
      toast({ title: 'Não foi possível copiar o link', variant: 'error' });
    }
  };
  const btn = 'grid size-9 place-items-center rounded-full border border-line text-muted transition hover:-translate-y-0.5 hover:border-line-strong hover:text-fg';
  return (
    <div className={cn('flex gap-2', vertical && 'flex-col', className)}>
      <button onClick={copy} className={btn} aria-label="Copiar link">
        <Link2 className="size-4" />
      </button>
      {items.map(({ label, icon: Icon, href }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={btn}>
          <Icon className="size-4" />
        </a>
      ))}
    </div>
  );
}

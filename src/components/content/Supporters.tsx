import type { Supporter } from '@/types';
import { supportersService } from '@/services';
import { useQuery } from '@/hooks/useQuery';
import { cn } from '@/utils/cn';

export function SupporterLogo({ s, className }: { s: Supporter; className?: string }) {
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noopener noreferrer"
      title={`${s.name} — ${s.description}`}
      className={cn('group flex flex-col items-center gap-2 rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]', className)}
    >
      <img src={s.logo} alt={s.name} loading="lazy" className="h-20 w-full object-contain" />
      <span className="text-center text-[11px] font-medium text-[#334] opacity-70 group-hover:opacity-100">{s.name}</span>
    </a>
  );
}

/** “Realização” and “Apoio” logo walls; each logo links to the institution. */
export function SupportersShowcase({ organizers = [], supporters = [] }: { organizers?: string[]; supporters?: string[] }) {
  const { data } = useQuery(() => supportersService.list(), [], ['supporters']);
  if (!data || (!organizers.length && !supporters.length)) return null;
  const pick = (ids: string[]) => ids.map((id) => data.find((s) => s.id === id)).filter(Boolean) as Supporter[];
  const groups = [
    { title: 'Realização', items: pick(organizers) },
    { title: 'Apoio', items: pick(supporters) },
  ].filter((g) => g.items.length);
  return (
    <div className="space-y-8">
      {groups.map((g) => (
        <div key={g.title}>
          <h3 className="mb-4 flex items-center gap-4 font-display text-lg font-semibold">
            {g.title}
            <span className="h-px flex-1 bg-line" />
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {g.items.map((s) => <SupporterLogo key={s.id} s={s} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

import { motion } from 'framer-motion';
import { formatNumber } from '@/utils/format';

/** Horizontal bar chart for article data blocks (single series, direct labels). */
export function BarChart({ title, data, unit }: { title: string; data: { label: string; value: number }[]; unit?: string }) {
  const max = Math.max(...data.map((d) => d.value), 0.0001);
  return (
    <figure className="panel not-prose p-5 sm:p-6">
      <figcaption className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-display text-[15px] font-semibold text-fg">{title}</span>
        {unit && <span className="font-mono text-[11px] text-muted">{unit}</span>}
      </figcaption>
      <ul className="space-y-3">
        {data.map((d, i) => (
          <li key={d.label} className="grid grid-cols-[minmax(84px,30%)_1fr] items-center gap-3 text-sm">
            <span className="truncate text-muted" title={d.label}>{d.label}</span>
            <span className="flex items-center gap-2.5">
              <span className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-fg/[0.06]">
                <motion.span
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: d.value / max }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 origin-left rounded-full bg-primary"
                />
              </span>
              <span className="w-14 text-right font-mono text-xs text-fg tabular-nums">{formatNumber(d.value)}</span>
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

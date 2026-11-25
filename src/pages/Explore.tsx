import { motion } from 'framer-motion';
import { topics, categories } from '@/data/taxonomy';
import { PageHero } from '@/components/layout/PageHero';
import { TopicCard } from '@/components/cosmic/TopicVisual';
import { fadeUp, inViewProps, stagger } from '@/animations/variants';
import { useDocumentTitle } from '@/hooks/dom';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/cn';

const layout = ['md:col-span-4 md:row-span-2', 'md:col-span-2 md:row-span-2', 'md:col-span-2', 'md:col-span-2', 'md:col-span-2', 'md:col-span-3', 'md:col-span-3', 'md:col-span-2', 'md:col-span-2 md:row-span-2', 'md:col-span-2'];

export default function Explore() {
  useDocumentTitle('Explorar');
  return (
    <>
      <PageHero
        eyebrow="Exploração científica"
        title={<>Dez fronteiras do <span className="text-gradient">conhecimento.</span></>}
        description="Cada área reúne artigos, notícias, eventos e imagens. Escolha uma porta de entrada — as conexões entre elas aparecem pelo caminho."
      />
      <section className="shell" aria-label="Áreas da ciência">
        <motion.div variants={stagger} {...inViewProps} className="grid auto-rows-[minmax(300px,auto)] gap-4 md:grid-cols-6">
          {topics.map((t, i) => (
            <motion.div key={t.slug} variants={fadeUp} className={cn(layout[i])}>
              <TopicCard topic={t} size={i < 2 || i === 8 ? 'large' : 'normal'} className="h-full" />
            </motion.div>
          ))}
        </motion.div>
      </section>
      <section className="shell mt-28" aria-labelledby="cats">
        <div className="mb-8 flex items-end justify-between">
          <h2 id="cats" className="font-display text-3xl font-semibold md:text-4xl">Por categoria editorial</h2>
        </div>
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => (
            <li key={c.id} className="bg-bg">
              <Link to={`/categorias/${c.slug}`} className="group flex h-full flex-col justify-between gap-8 p-6 transition hover:bg-surface/60">
                <span className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-muted">{String(i + 1).padStart(2, '0')}</span>
                  <ArrowUpRight className="size-4 text-muted transition group-hover:text-fg" />
                </span>
                <span>
                  <span className="mb-3 block h-px w-10" style={{ background: c.hue, boxShadow: `0 0 12px ${c.hue}` }} />
                  <span className="block font-display text-xl font-semibold">{c.name}</span>
                  <span className="mt-1.5 block text-sm text-muted">{c.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

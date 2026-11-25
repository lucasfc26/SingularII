import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { EASE } from '@/animations/variants';
import { cn } from '@/utils/cn';

export function PageHero({ eyebrow, title, description, image, children, className, align = 'left' }: { eyebrow?: string; title: ReactNode; description?: ReactNode; image?: string; children?: ReactNode; className?: string; align?: 'left' | 'center' }) {
  return (
    <header className={cn('relative overflow-hidden pt-36 pb-14 md:pt-44 md:pb-20', className)}>
      {image && (
        <div className="absolute inset-0" aria-hidden>
          <img src={image} alt="" className="size-full object-cover opacity-30 dark:opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/80 to-bg" />
        </div>
      )}
      <div className="nebula-bg absolute inset-0" aria-hidden />
      <div className="star-dust absolute inset-0 opacity-40" aria-hidden />
      <div className={cn('shell relative', align === 'center' && 'text-center')}>
        {eyebrow && (
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="eyebrow mb-5">
            {eyebrow}
          </motion.p>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, delay: 0.05, ease: EASE }}
          className={cn('max-w-4xl font-display text-[clamp(2.5rem,6.4vw,5rem)] leading-[0.98] font-semibold tracking-[-0.04em]', align === 'center' && 'mx-auto')}
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease: EASE }} className={cn('mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg', align === 'center' && 'mx-auto')}>
            {description}
          </motion.p>
        )}
        {children && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25, ease: EASE }} className="mt-10">
            {children}
          </motion.div>
        )}
      </div>
    </header>
  );
}

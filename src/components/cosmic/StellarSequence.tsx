import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { StellarRenderer } from '@/animations/stellarRenderer';
import { EASE } from '@/animations/variants';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile, usePrefersReducedMotion } from '@/hooks/dom';
import { Button } from '../ui/Button';

gsap.registerPlugin(ScrollTrigger);

const INDICATORS = [
  ['T · CMB', '2,725 K'],
  ['H₀', '≈ 70 km/s/Mpc'],
  ['z máx.', '14,32'],
  ['Idade', '13,8 Ga'],
];

/**
 * Fixed full-viewport canvas behind the home page. Scroll progress across
 * `track` (the whole home content) drives the star's life cycle: star →
 * pulses → supergiant → collapse → black hole (dark) / white dwarf (light).
 * The page content simply scrolls over it.
 */
export function StellarBackdrop({ track }: { track: RefObject<HTMLElement> }) {
  const { theme } = useTheme();
  const mobile = useIsMobile();
  const reduced = usePrefersReducedMotion();
  const canvas = useRef<HTMLCanvasElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const renderer = useRef<StellarRenderer | null>(null);

  useLayoutEffect(() => {
    if (!canvas.current || !track.current) return;
    const r = new StellarRenderer(canvas.current, { quality: mobile ? 'low' : 'high', reducedMotion: reduced });
    r.setTheme((document.documentElement.getAttribute('data-theme') as 'dark' | 'light') ?? 'dark');
    r.start();
    renderer.current = r;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: track.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => r.setTarget(self.progress),
      });
      // once the hero leaves, dim the scene slightly so content stays legible
      gsap.fromTo(
        veil.current,
        { opacity: 0 },
        { opacity: 1, ease: 'none', scrollTrigger: { trigger: track.current, start: 'top top', end: () => `+=${window.innerHeight * 0.9}`, scrub: true } },
      );
    });

    return () => {
      ctx.revert();
      r.destroy();
      renderer.current = null;
    };
  }, [mobile, reduced, track]);

  useEffect(() => {
    renderer.current?.setTheme(theme);
  }, [theme]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <canvas ref={canvas} className="size-full" />
      <div ref={veil} className="absolute inset-0 bg-bg/40 opacity-0" />
    </div>
  );
}

export function HomeHero() {
  const hero = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(content.current, {
        autoAlpha: 0,
        y: -80,
        filter: 'blur(6px)',
        ease: 'power1.in',
        scrollTrigger: { trigger: hero.current, start: 'top top', end: 'bottom 20%', scrub: 0.4 },
      });
    }, hero);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={hero} aria-label="Explore os mistérios do Universo" className="relative h-svh min-h-[600px]">
      <div ref={content} className="shell relative flex h-full flex-col items-center pt-[17vh] text-center sm:pt-[18vh]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8, ease: EASE }} className="glass mb-7 inline-flex items-center gap-2.5 rounded-full px-3.5 py-1.5">
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative size-2 rounded-full bg-accent" />
          </span>
          <span className="font-mono text-[11px] tracking-[0.14em] text-fg/80 uppercase">Observatório digital · ciência aberta</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.6, duration: 1.2, ease: EASE }}
          className="max-w-5xl font-display text-[clamp(2.7rem,8.2vw,6.6rem)] leading-[0.95] font-semibold tracking-[-0.045em]"
        >
          Explore os mistérios <span className="text-gradient">do Universo.</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, duration: 1, ease: EASE }} className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted sm:text-lg">
          Da escala quântica à imensidão do cosmos. Conhecimento, descobertas e ciência para quem nunca deixou de questionar.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 1, ease: EASE }} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button to="/explorar" size="lg" variant="glow" iconRight={<ArrowRight className="size-4" />}>
            Explorar conteúdos
          </Button>
          <Button to="/eventos" size="lg" variant="secondary" icon={<CalendarDays className="size-4" />} className="glass">
            Próximos eventos
          </Button>
        </motion.div>

        <dl className="absolute bottom-8 left-5 hidden gap-6 md:left-8 md:flex">
          {INDICATORS.map(([k, v]) => (
            <div key={k} className="text-left">
              <dt className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase">{k}</dt>
              <dd className="mt-1 font-mono text-[13px] text-fg/90">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3" aria-hidden>
          <span className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">Role para explorar</span>
          <span className="relative h-10 w-px overflow-hidden bg-line-strong">
            <span className="absolute inset-x-0 top-0 h-1/2 bg-accent [animation:scroll-cue_2s_ease-in-out_infinite]" />
          </span>
        </div>
      </div>
    </section>
  );
}

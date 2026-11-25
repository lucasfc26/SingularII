import { Suspense, useEffect } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BlackHoleLoader } from '@/components/loaders/BlackHoleLoader';

export function RouteFallback() {
  return <BlackHoleLoader fullscreen={false} />;
}

export function PublicLayout() {
  const outlet = useOutlet();
  const { pathname } = useLocation();

  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div className="relative min-h-dvh">
      <Header />
      <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })}>
        <motion.main
          id="conteudo"
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="relative"
        >
          <Suspense fallback={<RouteFallback />}>{outlet}</Suspense>
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
}

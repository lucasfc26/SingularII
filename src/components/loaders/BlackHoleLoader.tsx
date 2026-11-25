import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Logo } from '../layout/Logo';
import { cn } from '@/utils/cn';

const MESSAGES = [
  'Calculando trajetórias orbitais...',
  'Observando o horizonte de eventos...',
  'Explorando novas fronteiras...',
  'Organizando o espaço-tempo...',
  'Alinhando os espelhos do telescópio...',
  'Medindo o desvio para o vermelho...',
];

/** Rotating black hole: tilted accretion disk, photon ring, lensed halo and orbiting particles. */
export function BlackHole({ size = 220, className }: { size?: number; className?: string }) {
  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }} aria-hidden>
      {/* halo */}
      <div className="absolute -inset-1/3 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--secondary)_28%,transparent),transparent_62%)] blur-xl" />
      {/* lensed back side of the disk (vertical ring) */}
      <div
        className="absolute inset-[18%] rounded-full [animation:spin-slow_5s_linear_infinite]"
        style={{
          background: 'conic-gradient(from 0deg, #ffd9a3, #ff8a3d 20%, transparent 32%, #fff3dc 50%, #ff9d4d 66%, transparent 80%, #ffd9a3)',
          mask: 'radial-gradient(circle, transparent 54%, black 57%, black 66%, transparent 72%)',
          WebkitMask: 'radial-gradient(circle, transparent 54%, black 57%, black 66%, transparent 72%)',
          filter: 'blur(1.5px)',
        }}
      />
      {/* accretion disk (tilted) */}
      <div className="absolute inset-0 [perspective:600px]">
        <div className="absolute inset-0 [transform:rotateX(76deg)] [transform-style:preserve-3d]">
          <div
            className="absolute inset-0 rounded-full [animation:spin-slow_3.2s_linear_infinite]"
            style={{
              background: 'conic-gradient(from 90deg, #fff6e6, #ffb562 12%, #ff6a2b 28%, #7a2bff33 45%, #ffb562 60%, #fff1d6 75%, #ff8a3d 88%, #fff6e6)',
              mask: 'radial-gradient(circle, transparent 30%, black 33%, black 58%, transparent 70%)',
              WebkitMask: 'radial-gradient(circle, transparent 30%, black 33%, black 58%, transparent 70%)',
              filter: 'blur(0.6px) drop-shadow(0 0 12px #ff8a3d)',
            }}
          />
        </div>
      </div>
      {/* shadow */}
      <div className="absolute inset-[31%] rounded-full bg-[#020205] shadow-[0_0_0_1.5px_#ffe2b8,0_0_18px_4px_#ff9d4d88,inset_0_0_20px_#000]" />
      {/* front half of the disk over the shadow */}
      <div className="absolute inset-0 [perspective:600px] [clip-path:inset(50%_0_0_0)]">
        <div className="absolute inset-0 [transform:rotateX(76deg)]">
          <div
            className="absolute inset-0 rounded-full [animation:spin-slow_3.2s_linear_infinite]"
            style={{
              background: 'conic-gradient(from 90deg, #fff6e6, #ffb562 12%, #ff6a2b 28%, #7a2bff33 45%, #ffb562 60%, #fff1d6 75%, #ff8a3d 88%, #fff6e6)',
              mask: 'radial-gradient(circle, transparent 30%, black 33%, black 58%, transparent 70%)',
              WebkitMask: 'radial-gradient(circle, transparent 30%, black 33%, black 58%, transparent 70%)',
            }}
          />
        </div>
      </div>
      {/* orbiting particles */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="absolute inset-0 [animation:spin-slow_linear_infinite]" style={{ animationDuration: `${4 + i * 1.7}s`, animationDirection: i % 2 ? 'reverse' : 'normal', transform: `rotate(${i * 60}deg)` }}>
          <span
            className="absolute top-1/2 left-1/2 rounded-full bg-[#cfe6ff]"
            style={{ width: 2 + (i % 3), height: 2 + (i % 3), transform: `translate(${size * (0.38 + i * 0.03)}px, -50%)`, boxShadow: '0 0 8px #9cc2ff', opacity: 0.85 }}
          />
        </div>
      ))}
    </div>
  );
}

export function BlackHoleLoader({ fullscreen = true, onDone }: { fullscreen?: boolean; onDone?: () => void }) {
  const [msg, setMsg] = useState(() => Math.floor(Math.random() * MESSAGES.length));
  useEffect(() => {
    const t = setInterval(() => setMsg((m) => (m + 1) % MESSAGES.length), 1400);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (!onDone) return;
    const t = setTimeout(onDone, 1900);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={cn('z-[300] flex flex-col items-center justify-center gap-10 bg-[#05060A] text-[#F4F6FC]', fullscreen ? 'fixed inset-0' : 'min-h-[70vh] w-full bg-transparent text-fg')}
      role="status"
      aria-live="polite"
    >
      {fullscreen && <div className="star-dust absolute inset-0 opacity-50" aria-hidden />}
      <BlackHole size={fullscreen ? 230 : 150} />
      <div className="relative flex flex-col items-center gap-4">
        {fullscreen && <Logo forceDark />}
        <motion.p key={msg} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-xs tracking-wider text-[#929BB0]">
          {MESSAGES[msg]}
        </motion.p>
      </div>
    </motion.div>
  );
}

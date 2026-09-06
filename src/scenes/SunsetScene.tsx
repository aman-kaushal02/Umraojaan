import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { RevealText } from '../components/RevealText';
import { gardenConfig } from '../data/config';
import { EASE_SILK, riseIn } from '../animations/motion';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useIsCompact } from '../hooks/useMediaQuery';

/**
 * Last light. Petals come loose and drift down through the frame.
 */
export function SunsetScene() {
  const reducedMotion = usePrefersReducedMotion();
  const isCompact = useIsCompact();

  /* Deterministic per mount so the fall doesn't reshuffle on re-render. */
  const petals = useMemo(() => {
    const tints = ['#f79bb0', '#ea6f8c', '#ffc6d3', '#ffe0b8', '#e06a58', '#ffd3e3'];
    const count = isCompact ? 12 : 20;

    return Array.from({ length: count }, (_, i) => {
      const seed = (i * 9301 + 49297) % 233280;
      const rnd = seed / 233280;
      return {
        tint: tints[i % tints.length],
        left: (rnd * 100 + i * 4.5) % 100,
        size: 9 + ((i * 7) % 11),
        duration: 13 + ((i * 3) % 7),
        delay: i * 0.9,
        sway: 30 + ((i * 13) % 55),
        spin: 200 + ((i * 37) % 220),
      };
    });
  }, [isCompact]);

  return (
    <section className="scene-frame">
      {/* Falling petals. */}
      {!reducedMotion && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {petals.map((p, i) => (
            <motion.span
              key={i}
              className="absolute block"
              style={{
                left: `${p.left}%`,
                top: '-8%',
                width: p.size,
                height: p.size * 1.5,
                /* A petal silhouette rather than a circle. */
                borderRadius: '50% 50% 50% 50% / 62% 62% 38% 38%',
                background: `linear-gradient(150deg, ${p.tint}, ${p.tint}00)`,
                filter: 'blur(0.4px)',
              }}
              animate={{
                y: ['0vh', '112vh'],
                x: [0, p.sway, -p.sway * 0.6, 0],
                rotate: [0, p.spin],
                opacity: [0, 0.55, 0.45, 0],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: 'linear',
                times: [0, 0.25, 0.7, 1],
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        <RevealText
          as="h2"
          text={gardenConfig.sunset.line}
          delay={0.5}
          className="font-display text-[clamp(2rem,7vw,3.2rem)] font-light leading-[1.12] tracking-[-0.025em] text-paper-50"
        />

        <motion.span
          aria-hidden="true"
          className="mt-10 block h-px w-32 origin-center bg-gradient-to-r from-transparent via-petal-200/70 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.4, delay: 1.5, ease: EASE_SILK }}
        />

        <motion.p
          className="mt-9 font-display text-[clamp(1.5rem,5.5vw,2.2rem)] font-light text-paper-50"
          variants={riseIn}
          initial="hidden"
          animate="show"
          transition={{ delay: 1.8 }}
        >
          {gardenConfig.countdown}
        </motion.p>

        <motion.p
          className="mt-6 font-label text-[0.6rem] uppercase tracking-wide2 text-paper-100/45"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 2.3 }}
        >
          {gardenConfig.sunset.cta}
        </motion.p>

        <motion.p
          className="mt-14 font-body text-[clamp(1.3rem,4.5vw,1.75rem)] italic text-paper-100/80"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 2.7, ease: EASE_SILK }}
        >
          For {gardenConfig.name}
        </motion.p>
      </div>

      <div role="status" aria-live="polite" className="sr-only">
        Last light. {gardenConfig.countdown}. {gardenConfig.sunset.cta}.
      </div>
    </section>
  );
}

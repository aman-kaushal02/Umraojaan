import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { EASE_SILK } from '@/animations/motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useIsCompact } from '@/hooks/useMediaQuery';
import SafeImage from './SafeImage';
import type { Memory } from '@/data/config';

interface MemoryCardProps {
  memory: Memory;
  /** Which side the photo sits on (desktop only). */
  side?: 'left' | 'right';
  /** Depth of the parallax drift, in px. */
  parallax?: number;
  /** Load this photo eagerly — use for the first card only. */
  priority?: boolean;
}

/**
 * A memory as a physical object: a polaroid, taped down, with a note beside it.
 *
 * Fully self-contained and reusable — photo, date, title, description and an
 * optional handwritten quote all come from one `Memory` entry in the config.
 */
export function MemoryCard({
  memory,
  side = 'left',
  parallax = 40,
  priority = false,
}: MemoryCardProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const compact = useIsCompact();
  const still = reducedMotion || compact;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  /* Photo and text drift at different speeds — depth without a scroll library. */
  const photoY = useTransform(scrollYProgress, [0, 1], [parallax, -parallax]);
  const textY = useTransform(scrollYProgress, [0, 1], [parallax * 0.4, -parallax * 0.4]);

  const tilt = memory.tilt ?? -3;
  const photoFirst = side === 'left';

  return (
    <article
      ref={containerRef}
      className="relative grid items-center gap-8 sm:gap-10 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] md:gap-14 lg:gap-20"
    >
      {/* ---------------- Polaroid ---------------- */}
      <motion.div
        className={[
          'flex justify-center md:justify-start',
          photoFirst ? 'md:order-1' : 'md:order-2 md:justify-end',
        ].join(' ')}
        style={still ? undefined : { y: photoY }}
        initial={
          reducedMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 46, scale: 0.94, rotate: tilt * 2.4, filter: 'blur(14px)' }
        }
        whileInView={
          reducedMotion
            ? { opacity: 1 }
            : { opacity: 1, y: 0, scale: 1, rotate: tilt, filter: 'blur(0px)' }
        }
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: reducedMotion ? 0.3 : 1.5, ease: EASE_SILK }}
      >
        <div className="group relative w-[16rem] xs:w-[18rem] sm:w-[20rem] lg:w-[22rem]">
          {/* Warm halo behind the print */}
          <div
            aria-hidden="true"
            className="absolute -inset-6 -z-10 rounded-full opacity-70 blur-2xl"
            style={{
              background:
                'radial-gradient(circle, rgba(224,190,134,0.22) 0%, rgba(238,191,200,0.10) 45%, transparent 72%)',
            }}
          />

          <div
            className="paper paper-fibers rounded-[3px] p-3 pb-4 shadow-paper transition-transform duration-700 ease-silk
                       hover:rotate-0 hover:scale-[1.02] focus-within:rotate-0 motion-reduce:transition-none"
          >
            {/* Washi tape */}
            <span
              aria-hidden="true"
              className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-3 rounded-[2px] bg-champagne-200/45
                         shadow-[0_1px_3px_rgba(0,0,0,0.18)] backdrop-blur-[1px]"
            />

            <SafeImage
              src={memory.image}
              alt={memory.alt ?? memory.title}
              priority={priority}
              className="aspect-[4/5] w-full rounded-[2px]"
            />

            <div className="px-1 pt-4 text-center">
              {memory.quote ? (
                <p className="font-script text-[1.15rem] leading-snug text-rose-600/90">
                  {memory.quote}
                </p>
              ) : null}
              {memory.date ? (
                <p className="mt-2 font-sans text-[0.58rem] uppercase tracking-[0.26em] text-rose-500/60">
                  {memory.date}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ---------------- Note beside it ---------------- */}
      <motion.div
        className={[
          'text-center md:text-left',
          photoFirst ? 'md:order-2' : 'md:order-1 md:text-right',
        ].join(' ')}
        style={still ? undefined : { y: textY }}
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 30, filter: 'blur(8px)' }}
        whileInView={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: reducedMotion ? 0.3 : 1.2, delay: 0.16, ease: EASE_SILK }}
      >
        <div
          className={[
            'mx-auto flex items-center gap-3 md:mx-0',
            photoFirst ? '' : 'md:flex-row-reverse',
          ].join(' ')}
        >
          <span aria-hidden="true" className="gold-rule w-10 shrink-0" />
          <p className="kicker text-champagne-300/80">{memory.chapter}</p>
        </div>

        <h3 className="mt-4 font-serif text-[2rem] leading-[1.1] text-ivory-100 xs:text-[2.35rem] lg:text-[2.9rem]">
          {memory.title}
        </h3>

        <p className="mx-auto mt-5 max-w-[34ch] font-sans text-[0.95rem] leading-[1.85] text-ivory-100/70 sm:text-base md:mx-0">
          {memory.description}
        </p>
      </motion.div>
    </article>
  );
}

export default MemoryCard;

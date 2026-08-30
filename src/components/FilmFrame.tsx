import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { EASE_GATE } from '@/animations/motion';
import { useIsCompact } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import SafeImage from './SafeImage';
import type { FilmScene } from '@/data/config';

interface FilmFrameProps {
  frame: FilmScene;
  /** Which side the strip sits on (desktop only). */
  side?: 'left' | 'right';
  /** Depth of the parallax drift, in px. */
  parallax?: number;
  /** Load this frame eagerly — use for the first one only. */
  priority?: boolean;
}

/** Sprocket column: perforations punched down one edge of the stock. */
function Sprockets() {
  return (
    <span
      aria-hidden="true"
      className="block w-[11px] shrink-0 sm:w-[13px]"
      style={{
        backgroundImage:
          'linear-gradient(to bottom, rgba(4,5,4,0.95) 0 11px, transparent 11px 24px)',
        backgroundSize: '100% 24px',
        backgroundRepeat: 'repeat-y',
        backgroundPosition: '0 6px',
      }}
    />
  );
}

/**
 * One photograph, presented as a single frame of film.
 *
 * The stock runs vertically because the prints are portrait: perforations down
 * both edges, edge markings along the side, and the image itself coming up like
 * a print in the developer as it enters the viewport.
 *
 * Fully self-contained and reusable — every field comes from one entry in the
 * config.
 */
export function FilmFrame({
  frame,
  side = 'left',
  parallax = 40,
  priority = false,
}: FilmFrameProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const compact = useIsCompact();
  const still = reducedMotion || compact;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  /* Strip and caption drift at different rates — depth without a scroll library. */
  const stripY = useTransform(scrollYProgress, [0, 1], [parallax, -parallax]);
  const textY = useTransform(scrollYProgress, [0, 1], [parallax * 0.4, -parallax * 0.4]);

  const stripFirst = side === 'left';

  return (
    <article
      ref={containerRef}
      className="relative grid items-center gap-9 sm:gap-11 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] md:gap-14 lg:gap-20"
    >
      {/* ---------------- the strip ---------------- */}
      <motion.div
        className={[
          'flex justify-center md:justify-start',
          stripFirst ? 'md:order-1' : 'md:order-2 md:justify-end',
        ].join(' ')}
        style={still ? undefined : { y: stripY }}
        initial={
          reducedMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 44, filter: 'blur(16px) brightness(0.3) contrast(0.7)' }
        }
        whileInView={
          reducedMotion
            ? { opacity: 1 }
            : { opacity: 1, y: 0, filter: 'blur(0px) brightness(1) contrast(1)' }
        }
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: reducedMotion ? 0.3 : 1.7, ease: EASE_GATE }}
      >
        <div className="relative w-[15rem] xs:w-[16.5rem] sm:w-[18rem] lg:w-[19.5rem]">
          {/* the lamp behind the gate */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-8 -z-10 opacity-80 blur-2xl"
            style={{
              background:
                'radial-gradient(circle, rgba(227,185,114,0.2) 0%, rgba(243,233,212,0.08) 46%, transparent 74%)',
            }}
          />

          <div
            className={[
              'celluloid flex gap-1.5 rounded-[2px] p-1.5 shadow-frame sm:gap-2 sm:p-2',
              reducedMotion ? '' : 'animate-weave',
            ].join(' ')}
          >
            <Sprockets />

            <div className="relative min-w-0 flex-1">
              <SafeImage
                src={frame.image}
                alt={frame.alt ?? frame.title}
                priority={priority}
                className="aspect-[9/16] w-full rounded-[1px] print-warm"
              />

              {/* frame line between exposures */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 -bottom-[3px] h-[2px] bg-theatre-950/80"
              />
            </div>

            <Sprockets />
          </div>

          {/* edge marking, printed along the stock */}
          <span
            aria-hidden="true"
            className="slug absolute -left-[1.6rem] top-1/2 hidden -translate-y-1/2 text-brass-300/40 sm:block"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            {frame.slate}
          </span>

          {frame.footnote ? (
            <p className="slug mt-4 text-center text-brass-300/45">{frame.footnote}</p>
          ) : null}
        </div>
      </motion.div>

      {/* ---------------- the note beside it ---------------- */}
      <motion.div
        className={[
          'text-center md:text-left',
          stripFirst ? 'md:order-2' : 'md:order-1 md:text-right',
        ].join(' ')}
        style={still ? undefined : { y: textY }}
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 28, filter: 'blur(8px)' }}
        whileInView={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: reducedMotion ? 0.3 : 1.2, delay: 0.16, ease: EASE_GATE }}
      >
        <div
          className={[
            'mx-auto flex items-center gap-3 md:mx-0',
            stripFirst ? '' : 'md:flex-row-reverse',
          ].join(' ')}
        >
          <span aria-hidden="true" className="brass-rule w-8 shrink-0" />
          <p className="slate-label text-lamp-300/80">{frame.slate}</p>
        </div>

        {/* the slug line, exactly as it would be typed in a script */}
        <p className="slug mt-4 text-beam-200/45">{frame.slug}</p>

        <h3 className="mt-3 font-display text-[1.9rem] leading-[1.1] text-beam-50 xs:text-[2.2rem] lg:text-[2.7rem]">
          {frame.title}
        </h3>

        <p className="mx-auto mt-5 max-w-[36ch] font-script text-[0.85rem] leading-[1.95] text-beam-200/65 sm:text-[0.92rem] md:mx-0">
          {frame.note}
        </p>
      </motion.div>
    </article>
  );
}

export default FilmFrame;

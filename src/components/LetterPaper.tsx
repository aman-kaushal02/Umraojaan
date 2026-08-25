import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { EASE_SILK } from '@/animations/motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface LetterPaperProps {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before the card settles into frame. */
  delay?: number;
  /** Keep the slow idle float. Disable when the card is very tall. */
  float?: boolean;
}

/**
 * A physical sheet of paper: warm stock, visible fibres, a soft cast shadow
 * and the faintest fold down the middle.
 *
 * Reused by the first letter and the closing note so both feel like the same
 * stationery set.
 */
export function LetterPaper({
  children,
  className = '',
  delay = 0,
  float = true,
}: LetterPaperProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      initial={
        reducedMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 44, rotateX: 9, scale: 0.96, filter: 'blur(12px)' }
      }
      animate={
        reducedMotion
          ? { opacity: 1 }
          : { opacity: 1, y: 0, rotateX: 0, scale: 1, filter: 'blur(0px)' }
      }
      transition={{ duration: reducedMotion ? 0.3 : 1.4, delay, ease: EASE_SILK }}
      className={[
        'relative w-full',
        float && !reducedMotion ? 'animate-drift-slow' : '',
        className,
      ].join(' ')}
      style={{ perspective: '1200px' }}
    >
      {/* Glow beneath the sheet */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[40px] opacity-80 blur-2xl"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgba(247,231,201,0.22) 0%, rgba(238,191,200,0.10) 46%, transparent 74%)',
        }}
      />

      <div className="paper paper-fibers relative overflow-hidden rounded-[4px] shadow-paper">
        {/* Deckled top/bottom edges */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/80"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-rose-600/10"
        />

        {/* The centre fold */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-full w-8 -translate-x-1/2"
          style={{
            background:
              'linear-gradient(to right, rgba(122,17,48,0) 0%, rgba(122,17,48,0.045) 48%, rgba(255,255,255,0.5) 52%, rgba(122,17,48,0) 100%)',
          }}
        />

        {/* Light falling across the page from the top-left */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(146deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 34%), radial-gradient(circle at 88% 96%, rgba(122,17,48,0.07), transparent 46%)',
          }}
        />

        <div className="relative">{children}</div>
      </div>
    </motion.div>
  );
}

export default LetterPaper;

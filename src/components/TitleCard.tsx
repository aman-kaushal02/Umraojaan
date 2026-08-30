import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { EASE_GATE } from '@/animations/motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface TitleCardProps {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before the card resolves on the screen. */
  delay?: number;
  /** Keep the gate weave. Disable for very tall cards. */
  weave?: boolean;
}

/**
 * A title card, projected rather than printed.
 *
 * The woven screen surface, a hot centre where the lamp is strongest,
 * registration marks at the corners, and the faint unsteadiness of film in the
 * gate. Reused by the opening titles and the tail so both read as the same
 * print.
 */
export function TitleCard({
  children,
  className = '',
  delay = 0,
  weave = true,
}: TitleCardProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      initial={
        reducedMotion
          ? { opacity: 0 }
          : { opacity: 0, scale: 1.04, filter: 'blur(14px) brightness(1.6)' }
      }
      animate={
        reducedMotion
          ? { opacity: 1 }
          : { opacity: 1, scale: 1, filter: 'blur(0px) brightness(1)' }
      }
      transition={{ duration: reducedMotion ? 0.3 : 1.5, delay, ease: EASE_GATE }}
      className={['relative w-full', className].join(' ')}
    >
      {/* light spilling off the edges of the screen */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-8 -z-10 opacity-80 blur-2xl"
        style={{
          background:
            'radial-gradient(circle at 50% 42%, rgba(243,233,212,0.16) 0%, rgba(227,185,114,0.08) 46%, transparent 74%)',
        }}
      />

      <div
        className={[
          'screen-panel relative overflow-hidden rounded-[2px]',
          'shadow-[0_24px_60px_-28px_rgba(0,0,0,0.95)]',
          weave && !reducedMotion ? 'animate-weave' : '',
        ].join(' ')}
      >
        {/* the frame edge */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[2px] border border-brass-400/25"
        />

        {/* registration marks */}
        {(
          [
            'left-2 top-2 border-l border-t',
            'right-2 top-2 border-r border-t',
            'bottom-2 left-2 border-b border-l',
            'bottom-2 right-2 border-b border-r',
          ] as const
        ).map((position) => (
          <span
            key={position}
            aria-hidden="true"
            className={`pointer-events-none absolute h-3 w-3 border-beam-200/25 ${position}`}
          />
        ))}

        {/* the hot spot, where the lamp is strongest */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(110% 80% at 50% 38%, rgba(243,233,212,0.07) 0%, transparent 60%)',
          }}
        />

        <div className="relative">{children}</div>
      </div>
    </motion.div>
  );
}

export default TitleCard;

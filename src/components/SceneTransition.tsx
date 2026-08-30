import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { sceneVariants, sceneVariantsCalm } from '@/animations/motion';
import { useExperience } from '@/hooks/useExperience';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Swaps one scene for another as a single cinematic dissolve.
 *
 * `mode="wait"` guarantees the outgoing scene finishes leaving before the next
 * one arrives — no overlap, no double scrollbars, and only one scene's
 * animations running at a time.
 */
export function SceneTransition({ children }: { children: ReactNode }) {
  const { scene, direction, mood } = useExperience();
  const reducedMotion = usePrefersReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false} custom={direction}>
      <motion.main
        /* The picture area. Letterboxing sits above this, in TheatreStage. */
        key={scene}
        custom={direction}
        variants={reducedMotion ? sceneVariantsCalm : sceneVariants}
        initial="enter"
        animate="center"
        exit="exit"
        className={[
          'relative z-10 w-full',
          /**
           * Fixed-height scenes still allow an internal scroll as a safety
           * valve: on a short phone in landscape, content that would otherwise
           * be clipped stays reachable instead of disappearing.
           */
          mood.scrolls
            ? ''
            : 'h-[var(--app-height)] overflow-y-auto overscroll-contain hide-scrollbar',
        ].join(' ')}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}

export default SceneTransition;

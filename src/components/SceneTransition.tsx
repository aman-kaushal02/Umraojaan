import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { sceneShift, sceneShiftCalm } from '../animations/motion';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface SceneTransitionProps {
  children: ReactNode;
  sceneKey: string;
}

/**
 * One scene leaves before the next arrives (`mode="wait"`), so only a single
 * scene's timelines are ever running and there is no overlap flash.
 */
export function SceneTransition({ children, sceneKey }: SceneTransitionProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main
        key={sceneKey}
        variants={reducedMotion ? sceneShiftCalm : sceneShift}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative w-full"
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}

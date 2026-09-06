import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface SceneTransitionProps {
  children: ReactNode;
  sceneKey: string;
}

export function SceneTransition({ children, sceneKey }: SceneTransitionProps) {
  const reducedMotion = usePrefersReducedMotion();

  const variants = reducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, y: 20, filter: 'blur(10px)' },
        animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
        exit: { opacity: 0, y: -20, filter: 'blur(10px)' },
      };

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={sceneKey}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className="relative z-10 w-full min-h-screen"
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}

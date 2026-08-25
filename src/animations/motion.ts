import type { Transition, Variants } from 'framer-motion';

/* Shared easing curves so every scene moves with the same hand. */
export const EASE_SILK = [0.22, 1, 0.36, 1] as const;
export const EASE_DRAPE = [0.65, 0, 0.35, 1] as const;

export const springSoft: Transition = {
  type: 'spring',
  stiffness: 140,
  damping: 20,
  mass: 0.9,
};

export const tweenSilk = (duration = 0.9, delay = 0): Transition => ({
  duration,
  delay,
  ease: EASE_SILK,
});

/** Cross-fade + drift used between full scenes. */
export const sceneVariants: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    scale: direction > 0 ? 1.04 : 0.98,
    filter: 'blur(10px)',
  }),
  center: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 1.05, ease: EASE_SILK },
  },
  exit: (direction: number) => ({
    opacity: 0,
    scale: direction > 0 ? 0.985 : 1.03,
    filter: 'blur(8px)',
    transition: { duration: 0.62, ease: EASE_DRAPE },
  }),
};

/** Reduced-motion counterpart: a plain, quick cross-fade. */
export const sceneVariantsCalm: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.28, ease: 'linear' } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'linear' } },
};

/** Staggered container for lists of lines/cards. */
export const staggerParent = (stagger = 0.14, delay = 0.1): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

export const riseChild: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1, ease: EASE_SILK },
  },
};

export const calmChild: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
};

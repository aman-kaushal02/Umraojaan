import type { Transition, Variants } from 'framer-motion';

/* Shared curves, so every scene moves with the same hand. */
export const EASE_GATE = [0.22, 1, 0.36, 1] as const;
export const EASE_CUT = [0.85, 0, 0.15, 1] as const;

export const springSoft: Transition = {
  type: 'spring',
  stiffness: 150,
  damping: 21,
  mass: 0.9,
};

export const tweenGate = (duration = 0.9, delay = 0): Transition => ({
  duration,
  delay,
  ease: EASE_GATE,
});

/**
 * Scene changes are cut on a dissolve: the outgoing scene loses focus and
 * brightness as the lamp swings away, the incoming one resolves as the gate
 * settles.
 */
export const sceneVariants: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    scale: direction > 0 ? 1.035 : 0.985,
    filter: 'blur(12px) brightness(1.5)',
  }),
  center: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px) brightness(1)',
    transition: { duration: 1.05, ease: EASE_GATE },
  },
  exit: (direction: number) => ({
    opacity: 0,
    scale: direction > 0 ? 0.99 : 1.025,
    filter: 'blur(9px) brightness(0.6)',
    transition: { duration: 0.6, ease: EASE_CUT },
  }),
};

/** Reduced-motion counterpart: a plain, quick cross-fade. */
export const sceneVariantsCalm: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.28, ease: 'linear' } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'linear' } },
};

/** Staggered container for credit rolls and lists of frames. */
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
    transition: { duration: 1, ease: EASE_GATE },
  },
};

export const calmChild: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
};

/** A print coming up in the developer: dark and soft, then sharp. */
export const developIn: Variants = {
  hidden: { opacity: 0, filter: 'blur(14px) brightness(0.3) contrast(0.7)', scale: 1.06 },
  show: {
    opacity: 1,
    filter: 'blur(0px) brightness(1) contrast(1)',
    scale: 1,
    transition: { duration: 1.7, ease: EASE_GATE },
  },
};

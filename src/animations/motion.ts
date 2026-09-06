import type { Variants } from 'framer-motion';

/* ------------------------------------------------------------------ *
 * Easing. Long, decelerating curves — the signature of unhurried,
 * expensive-feeling motion. Nothing here uses a linear or plain
 * ease-out ramp.
 * ------------------------------------------------------------------ */
export const EASE_SILK = [0.16, 1, 0.3, 1] as const;
export const EASE_SWIFT = [0.22, 1, 0.36, 1] as const;
export const EASE_DRAW = [0.65, 0, 0.35, 1] as const;
export const EASE_OUT_SOFT = [0.33, 1, 0.68, 1] as const;

/** Fades a container in and hands timing to its children. */
export const stagger = (children = 0.1, delay = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: children, delayChildren: delay },
  },
});

/** The default arrival: up, into focus, settling. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 34, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.15, ease: EASE_SILK },
  },
};

/** For plates and cards: arrives with a little depth. */
export const plateIn: Variants = {
  hidden: { opacity: 0, y: 48, scale: 0.965, rotateX: 6 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: { duration: 1.35, ease: EASE_SILK },
  },
};

/** Scene-level cross-dissolve with a whisper of scale. */
export const sceneShift: Variants = {
  initial: { opacity: 0, scale: 1.018, filter: 'blur(10px)' },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 1.15, ease: EASE_SILK },
  },
  exit: {
    opacity: 0,
    scale: 0.99,
    filter: 'blur(10px)',
    transition: { duration: 0.62, ease: EASE_SWIFT },
  },
};

export const sceneShiftCalm: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

/** A hairline that draws itself outward from the centre. */
export const ruleDraw: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 1.4, ease: EASE_SILK },
  },
};

/** Buttons: lift and settle, never bounce. */
export const control = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.025, y: -3, transition: { duration: 0.5, ease: EASE_SILK } },
  press: { scale: 0.985, y: 0, transition: { duration: 0.16 } },
} as const;

import type { Variants } from 'framer-motion';

/**
 * Premium easing curves — crafted for luxury feel.
 * Smooth, confident, never rushed.
 */
export const EASE_PREMIUM = [0.25, 0.1, 0.25, 1.0]; // cubic-bezier
export const EASE_SILK = [0.19, 1.0, 0.22, 1.0];
export const EASE_ENTRANCE = [0.16, 1.0, 0.3, 1.0];
export const EASE_EXIT = [0.7, 0.0, 0.84, 0.0];

/**
 * Staggered reveal for luxury typography.
 * Each word arrives with intention, never rushed.
 */
export const textRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    filter: 'blur(12px)',
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    scale: 1,
    transition: {
      duration: 1.2,
      ease: EASE_ENTRANCE,
    },
  },
};

/**
 * Scene transitions — cross-dissolve with depth.
 */
export const sceneTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 1.03,
    filter: 'blur(20px)',
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 1.4,
      ease: EASE_SILK,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    filter: 'blur(20px)',
    transition: {
      duration: 0.9,
      ease: EASE_EXIT,
    },
  },
};

/**
 * Floating animation for ambient elements.
 */
export const floatVariants: Variants = {
  animate: {
    y: [0, -12, 0],
    x: [0, 6, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Glow pulse for interactive elements.
 */
export const glowVariants: Variants = {
  idle: {
    boxShadow: '0 0 20px rgba(255, 182, 193, 0.3)',
  },
  hover: {
    boxShadow: '0 0 40px rgba(255, 182, 193, 0.6), 0 0 80px rgba(255, 192, 203, 0.3)',
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

/**
 * Premium button interaction.
 */
export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.04,
    y: -2,
    transition: {
      duration: 0.4,
      ease: EASE_SILK,
    },
  },
  tap: {
    scale: 0.98,
    y: 0,
    transition: {
      duration: 0.15,
      ease: 'easeOut',
    },
  },
};

/**
 * Card entrance with depth.
 */
export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
    rotateX: 15,
    scale: 0.94,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: EASE_ENTRANCE,
    },
  },
};

/**
 * Stagger container for sequential reveals.
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

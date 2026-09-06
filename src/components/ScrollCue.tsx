import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface ScrollCueProps {
  label?: string;
  onClick?: () => void;
}

export function ScrollCue({ label = 'Continue', onClick }: ScrollCueProps) {
  const reducedMotion = usePrefersReducedMotion();

  const chevron = (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );

  const content = (
    <>
      <span className="text-xs tracking-[0.25em] uppercase font-light opacity-90">
        {label}
      </span>
      <motion.div
        animate={reducedMotion ? {} : { y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {chevron}
      </motion.div>
    </>
  );

  if (onClick) {
    return (
      <motion.button
        onClick={onClick}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center gap-3 text-white/70 hover:text-white transition-colors duration-300"
        aria-label={label}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 1 }}
      className="flex flex-col items-center gap-3 text-white/70"
      role="img"
      aria-label="Scroll to continue"
    >
      {content}
    </motion.div>
  );
}

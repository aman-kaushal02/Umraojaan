import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface ScrollCueProps {
  label?: string;
  onClick?: () => void;
}

export function ScrollCue({ label = 'Continue', onClick }: ScrollCueProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (onClick) {
    return (
      <motion.button
        onClick={onClick}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors"
        aria-label={label}
      >
        <span className="text-xs uppercase tracking-widest">{label}</span>
        <motion.svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={reducedMotion ? {} : { y: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="flex flex-col items-center gap-2 text-white/70"
      role="img"
      aria-label="Scroll to continue"
    >
      <span className="text-xs uppercase tracking-widest">{label}</span>
      <motion.svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={reducedMotion ? {} : { y: [0, 4, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </motion.svg>
    </motion.div>
  );
}

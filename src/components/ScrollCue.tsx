import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { EASE_SILK } from '../animations/motion';

interface ScrollCueProps {
  label?: string;
  onClick?: () => void;
}

/**
 * The forward control: a label over a hairline that a bead of light keeps
 * travelling down. Restrained enough to sit under a photograph without
 * competing with it.
 */
export function ScrollCue({ label = 'Continue', onClick }: ScrollCueProps) {
  const reducedMotion = usePrefersReducedMotion();

  const body = (
    <>
      <span className="font-label text-[0.6rem] uppercase tracking-wide2 text-paper-100/60 transition-colors duration-500 group-hover:text-paper-50">
        {label}
      </span>

      <span aria-hidden="true" className="relative block h-12 w-px overflow-hidden bg-white/15">
        <motion.span
          className="absolute inset-x-0 h-4 rounded-full"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(255,226,232,0.95), transparent)',
          }}
          initial={{ y: -16 }}
          animate={reducedMotion ? { y: 16 } : { y: [-16, 48] }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: 2.1, repeat: Infinity, ease: EASE_SILK, repeatDelay: 0.35 }
          }
        />
      </span>
    </>
  );

  const shell = 'group flex flex-col items-center gap-3';

  if (!onClick) {
    return (
      <motion.div
        className={shell}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.1, delay: 0.6 }}
        role="img"
        aria-label={label}
      >
        {body}
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`${shell} focus:outline-none focus-visible:ring-2 focus-visible:ring-petal-200 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.1, delay: 0.5, ease: EASE_SILK }}
      whileHover={reducedMotion ? undefined : { y: -2 }}
      whileTap={{ scale: 0.97 }}
    >
      {body}
    </motion.button>
  );
}

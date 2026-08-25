import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * A whisper rather than a signpost: a thin line of light that keeps falling,
 * hinting that the page continues.
 */
export function ScrollCue({ label = 'Scroll' }: { label?: string }) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.6, duration: 1.2 }}
      className="flex flex-col items-center gap-3"
    >
      <span className="kicker text-champagne-200/45">{label}</span>
      <span
        aria-hidden="true"
        className="relative block h-12 w-px overflow-hidden bg-champagne-200/15"
      >
        {!reducedMotion && (
          <motion.span
            className="absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-transparent via-champagne-200/90 to-transparent"
            animate={{ y: ['-100%', '340%'] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </span>
    </motion.div>
  );
}

export default ScrollCue;

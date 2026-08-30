import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * The film advancing: a short run of sprocket holes pulling downward.
 *
 * A hint rather than a signpost — it says "there's more strip" without asking
 * for a click.
 */
export function ScrollCue({ label = 'Keep watching' }: { label?: string }) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.6, duration: 1.2 }}
      className="flex flex-col items-center gap-3"
    >
      <span className="slate-label text-brass-300/45">{label}</span>
      <span
        aria-hidden="true"
        className="relative block h-14 w-[9px] overflow-hidden rounded-[1px] border-x border-brass-400/20"
      >
        <span
          className={[
            'absolute inset-x-0 -top-[68px] h-[240px]',
            reducedMotion ? '' : 'animate-sprocket-run',
          ].join(' ')}
          style={{
            backgroundImage:
              'linear-gradient(to bottom, rgba(227,185,114,0.55) 0 8px, transparent 8px 17px)',
            backgroundSize: '100% 17px',
            backgroundRepeat: 'repeat-y',
          }}
        />
      </span>
    </motion.div>
  );
}

export default ScrollCue;

import { motion } from 'framer-motion';
import { useMusic } from '../hooks/useMusic';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { EASE_SILK } from '../animations/motion';

/**
 * The soundtrack control, sitting quietly in the corner.
 *
 * While playing it shows a four-bar level meter rather than a pause glyph, so
 * the state is legible at a glance without a label.
 */
export function MusicController() {
  const { isPlaying, toggle } = useMusic();
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay: 1.4, ease: EASE_SILK }}
      className="fixed z-50 bottom-[max(1.5rem,calc(env(safe-area-inset-bottom)+1rem))] right-[max(1.25rem,env(safe-area-inset-right))]"
    >
      <button
        type="button"
        onClick={toggle}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? 'Pause the music' : 'Play the music'}
        className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.07] backdrop-blur-xl ring-1 ring-inset ring-white/20 transition-colors duration-500 hover:bg-white/[0.14] focus:outline-none focus-visible:ring-2 focus-visible:ring-petal-200"
      >
        {isPlaying ? (
          <span aria-hidden="true" className="flex items-end gap-[3px]">
            {[0, 1, 2, 3].map((i) => (
              <motion.span
                key={i}
                className="w-[2.5px] rounded-full bg-paper-50/90"
                initial={{ height: 5 }}
                animate={reducedMotion ? { height: 9 } : { height: [5, 15, 7, 12, 5] }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { duration: 1.25, repeat: Infinity, ease: 'easeInOut', delay: i * 0.13 }
                }
              />
            ))}
          </span>
        ) : (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="ml-0.5 h-4 w-4 text-paper-50/90"
            fill="currentColor"
          >
            <path d="M8 5.5v13l11-6.5z" />
          </svg>
        )}
      </button>
    </motion.div>
  );
}

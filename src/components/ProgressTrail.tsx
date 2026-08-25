import { AnimatePresence, motion } from 'framer-motion';
import { EASE_SILK } from '@/animations/motion';
import { SCENE_ORDER, sceneLabels } from '@/data/scenes';
import { useExperience } from '@/hooks/useExperience';

/**
 * Not a navbar — a bookmark ribbon.
 *
 * Seven hairlines that fill in as the story unfolds. Chapters she has already
 * reached become buttons so she can go back and read a part again; the rest
 * stay dark, because the whole point is not knowing what's next.
 *
 * Deliberately hidden during the intro and the envelope to protect the mystery.
 */
export function ProgressTrail() {
  const { scene, index, reached, go } = useExperience();
  const visible = index >= SCENE_ORDER.indexOf('letter');

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          aria-label="Chapters"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.9, ease: EASE_SILK }}
          className="fixed bottom-[max(1.15rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-50
                     flex items-center gap-[7px] rounded-full glass-pill px-3 py-2.5"
        >
          {SCENE_ORDER.map((id) => {
            const isCurrent = id === scene;
            const isReached = reached.includes(id);

            return (
              <button
                key={id}
                type="button"
                onClick={() => isReached && go(id)}
                disabled={!isReached}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={sceneLabels[id]}
                title={isReached ? sceneLabels[id] : undefined}
                className={[
                  'h-[3px] rounded-full transition-all duration-700 ease-silk',
                  isCurrent
                    ? 'w-6 bg-champagne-300'
                    : isReached
                      ? 'w-2.5 bg-champagne-200/45 hover:bg-champagne-200/80 cursor-pointer'
                      : 'w-2.5 bg-ivory-100/12 cursor-default',
                ].join(' ')}
              />
            );
          })}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

export default ProgressTrail;

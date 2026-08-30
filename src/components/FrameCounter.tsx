import { AnimatePresence, motion } from 'framer-motion';
import { EASE_GATE } from '@/animations/motion';
import { SCENE_ORDER, sceneLabels } from '@/data/scenes';
import { useExperience } from '@/hooks/useExperience';

/**
 * Not a navbar — a frame counter on the projector.
 *
 * Seven frames of film that expose as the reel runs. Scenes she has already
 * seen become buttons so she can go back and watch one again; the rest stay
 * dark, because not knowing what's next is the whole point.
 *
 * Hidden during the auditorium and the reel so nothing spoils the opening.
 */
export function FrameCounter() {
  const { scene, index, reached, go } = useExperience();
  const visible = index >= SCENE_ORDER.indexOf('titles');

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          aria-label="Scenes"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.9, ease: EASE_GATE }}
          className="housing-pill fixed bottom-[max(2.2rem,calc(env(safe-area-inset-bottom)+1.4rem))]
                     left-[max(1rem,env(safe-area-inset-left))] z-50 flex items-center gap-[5px] rounded-[3px] px-2.5 py-2"
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
                  'relative flex h-[13px] flex-col justify-between rounded-[1px] border transition-all duration-700 ease-gate',
                  isCurrent
                    ? 'w-6 border-lamp-300/80 bg-lamp-300/25'
                    : isReached
                      ? 'w-3.5 border-brass-300/40 bg-brass-300/10 hover:border-brass-200/80 hover:bg-brass-300/25 cursor-pointer'
                      : 'w-3.5 border-beam-100/10 bg-transparent cursor-default',
                ].join(' ')}
              >
                {/* sprocket holes, top and bottom */}
                <span
                  aria-hidden="true"
                  className={[
                    'mx-auto mt-[1px] h-[2px] w-[2px] rounded-[0.5px] transition-colors duration-700',
                    isCurrent ? 'bg-lamp-200' : isReached ? 'bg-brass-300/60' : 'bg-beam-100/15',
                  ].join(' ')}
                />
                <span
                  aria-hidden="true"
                  className={[
                    'mx-auto mb-[1px] h-[2px] w-[2px] rounded-[0.5px] transition-colors duration-700',
                    isCurrent ? 'bg-lamp-200' : isReached ? 'bg-brass-300/60' : 'bg-beam-100/15',
                  ].join(' ')}
                />
              </button>
            );
          })}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

export default FrameCounter;

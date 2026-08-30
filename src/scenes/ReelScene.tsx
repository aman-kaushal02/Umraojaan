import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CountdownLeader from '@/components/CountdownLeader';
import FilmReel from '@/components/FilmReel';
import { EASE_GATE } from '@/animations/motion';
import { reelConfig } from '@/data/config';
import { useExperience } from '@/hooks/useExperience';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Scene 2 — threading up.
 *
 * The reel comes into frame, waits, and gets out of the way the moment she
 * starts it. Once the film is threaded the Academy leader takes the screen and
 * counts the picture in, which is what hands off to the titles.
 */
export function ReelScene() {
  const { advance } = useExperience();
  const { reel } = reelConfig;
  const reducedMotion = usePrefersReducedMotion();
  const [threading, setThreading] = useState(false);
  const [counting, setCounting] = useState(false);

  return (
    <section className="scene-frame" aria-label="A loaded film reel">
      <div className="flex w-full max-w-3xl flex-col items-center">
        {/* ---- tease ---- */}
        <AnimatePresence>
          {!threading && (
            <motion.div
              key="tease"
              className="flex flex-col items-center text-center"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18, filter: 'blur(6px)' }}
              transition={{ duration: reducedMotion ? 0.3 : 1.1, delay: 0.35, ease: EASE_GATE }}
            >
              <p className="max-w-md font-display text-xl italic leading-snug text-beam-100/80 xs:text-2xl sm:text-[1.7rem]">
                {reel.tease}
              </p>
              <span aria-hidden="true" className="brass-rule mt-6 w-20" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---- the reel ---- */}
        <motion.div
          className="mt-10 flex w-full justify-center sm:mt-12"
          initial={
            reducedMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 70, scale: 0.84, rotate: -12, filter: 'blur(14px)' }
          }
          animate={{ opacity: 1, y: 0, scale: 1, rotate: 0, filter: 'blur(0px)' }}
          transition={{
            duration: reducedMotion ? 0.35 : 1.7,
            delay: reducedMotion ? 0 : 0.5,
            ease: EASE_GATE,
          }}
        >
          <FilmReel
            monogram={reel.monogram}
            canLabel={reel.canLabel}
            label={`${reel.prompt} — start the film`}
            onThreading={() => setThreading(true)}
            onThreaded={() => setCounting(true)}
          />
        </motion.div>

        {/* ---- prompt ---- */}
        <AnimatePresence>
          {!threading && (
            <motion.div
              key="prompt"
              className="mt-8 flex flex-col items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 1, delay: reducedMotion ? 0 : 1.9, ease: EASE_GATE }}
            >
              <span
                aria-hidden="true"
                className={[
                  'h-1.5 w-1.5 rounded-full bg-lamp-300',
                  reducedMotion ? '' : 'animate-blink',
                ].join(' ')}
              />
              <p className="slate-label text-brass-300/60">{reel.prompt}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ---- the leader, counting the picture in ---- */}
      {counting && <CountdownLeader onDone={advance} />}
    </section>
  );
}

export default ReelScene;

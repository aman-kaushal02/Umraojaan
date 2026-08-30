import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AnimatedText from '@/components/AnimatedText';
import Clapperboard from '@/components/Clapperboard';
import { EASE_GATE } from '@/animations/motion';
import { reelConfig } from '@/data/config';
import { useExperience } from '@/hooks/useExperience';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Scene 5 — one more take.
 *
 * A deliberate pause before the climax. Two short lines, one board, and the
 * strong implication that she should hit it.
 */
export function SlateScene() {
  const { advance } = useExperience();
  const { slate } = reelConfig;
  const reducedMotion = usePrefersReducedMotion();
  const [clapping, setClapping] = useState(false);

  /* Stagger the two beats so they land like spoken lines. */
  const lineDelays = useMemo(
    () => slate.lines.map((_, index) => 0.4 + index * 1.15),
    [slate.lines],
  );

  return (
    <section className="scene-frame" aria-label="One more take">
      <div className="flex w-full max-w-2xl flex-col items-center">
        <AnimatePresence>
          {!clapping && (
            <motion.div
              key="lines"
              className="flex flex-col items-center gap-3 text-center"
              exit={{ opacity: 0, y: -18, filter: 'blur(6px)' }}
              transition={{ duration: 0.6, ease: EASE_GATE }}
            >
              {slate.lines.map((line, index) => (
                <AnimatedText
                  key={line}
                  text={line}
                  mode="words"
                  delay={lineDelays[index]}
                  stagger={0.07}
                  className={
                    index === 0
                      ? 'font-display text-[1.7rem] italic leading-tight text-beam-100/85 xs:text-[2rem] sm:text-[2.3rem]'
                      : 'font-display text-[1.35rem] leading-tight text-lamp-200/85 xs:text-[1.55rem] sm:text-[1.75rem]'
                  }
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clapperboard reserves its own headroom for the swung stick. */}
        <motion.div
          className="mt-6 flex w-full justify-center sm:mt-8"
          initial={
            reducedMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 56, scale: 0.86, filter: 'blur(12px)' }
          }
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          transition={{
            duration: reducedMotion ? 0.35 : 1.5,
            delay: reducedMotion ? 0 : 2.3,
            ease: EASE_GATE,
          }}
        >
          <Clapperboard
            board={slate.board}
            label={`${slate.prompt} — cut to the last scene`}
            onClapping={() => setClapping(true)}
            onClapped={advance}
          />
        </motion.div>

        <AnimatePresence>
          {!clapping && (
            <motion.div
              key="prompt"
              className="mt-8 flex flex-col items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, delay: reducedMotion ? 0 : 3.4, ease: EASE_GATE }}
            >
              <span
                aria-hidden="true"
                className={[
                  'h-1.5 w-1.5 rounded-full bg-lamp-300',
                  reducedMotion ? '' : 'animate-blink',
                ].join(' ')}
              />
              <p className="slate-label text-brass-300/60">{slate.prompt}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default SlateScene;

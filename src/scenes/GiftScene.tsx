import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AnimatedText from '@/components/AnimatedText';
import GiftBox from '@/components/GiftBox';
import { EASE_SILK } from '@/animations/motion';
import { birthdayConfig } from '@/data/config';
import { useExperience } from '@/hooks/useExperience';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Scene 5 — "but wait".
 *
 * A deliberate pause before the climax. Two short lines, one box, and the
 * strong implication that she should touch it.
 */
export function GiftScene() {
  const { advance } = useExperience();
  const { gift } = birthdayConfig;
  const reducedMotion = usePrefersReducedMotion();
  const [opening, setOpening] = useState(false);

  /* Stagger the "but wait…" beats so they land like spoken lines. */
  const lineDelays = useMemo(
    () => gift.lines.map((_, index) => 0.4 + index * 1.15),
    [gift.lines],
  );

  return (
    <section className="scene-frame" aria-label="One more gift">
      <div className="flex w-full max-w-2xl flex-col items-center">
        <AnimatePresence>
          {!opening && (
            <motion.div
              key="lines"
              className="flex flex-col items-center gap-3 text-center"
              exit={{ opacity: 0, y: -18, filter: 'blur(6px)' }}
              transition={{ duration: 0.7, ease: EASE_SILK }}
            >
              {gift.lines.map((line, index) => (
                <AnimatedText
                  key={line}
                  text={line}
                  mode="words"
                  delay={lineDelays[index]}
                  stagger={0.07}
                  className={
                    index === 0
                      ? 'font-serif text-[1.75rem] italic leading-tight text-ivory-100/85 xs:text-[2.1rem] sm:text-[2.4rem]'
                      : 'font-serif text-[1.4rem] leading-tight text-blush-200/80 xs:text-[1.65rem] sm:text-[1.85rem]'
                  }
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="mt-12 flex w-full justify-center sm:mt-16"
          initial={
            reducedMotion ? { opacity: 0 } : { opacity: 0, y: 60, scale: 0.85, filter: 'blur(12px)' }
          }
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          transition={{
            duration: reducedMotion ? 0.35 : 1.5,
            delay: reducedMotion ? 0 : 2.3,
            ease: EASE_SILK,
          }}
        >
          <GiftBox
            label={gift.prompt}
            onOpening={() => setOpening(true)}
            onOpened={advance}
          />
        </motion.div>

        <AnimatePresence>
          {!opening && (
            <motion.div
              key="prompt"
              className="mt-10 flex flex-col items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, delay: reducedMotion ? 0 : 3.4, ease: EASE_SILK }}
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-champagne-300/80 animate-breathe motion-reduce:animate-none"
              />
              <p className="kicker text-champagne-200/55">{gift.prompt}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default GiftScene;

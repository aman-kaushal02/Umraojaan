import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EASE_SILK } from '@/animations/motion';
import Envelope from '@/components/Envelope';
import { birthdayConfig } from '@/data/config';
import { useExperience } from '@/hooks/useExperience';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Scene 2 — something arrives.
 *
 * The envelope glides into the middle of the room, fidgets, and waits. All the
 * surrounding copy clears out of the way the instant the seal breaks, so
 * nothing competes with the opening animation.
 */
export function EnvelopeScene() {
  const { advance } = useExperience();
  const { envelope } = birthdayConfig;
  const reducedMotion = usePrefersReducedMotion();
  const [opening, setOpening] = useState(false);

  return (
    <section className="scene-frame" aria-label="A sealed envelope">
      <div className="flex w-full max-w-3xl flex-col items-center">
        {/* ---- tease ---- */}
        <AnimatePresence>
          {!opening && (
            <motion.div
              key="tease"
              className="flex flex-col items-center text-center"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18, filter: 'blur(6px)' }}
              transition={{ duration: reducedMotion ? 0.3 : 1.1, delay: 0.35, ease: EASE_SILK }}
            >
              <p className="max-w-md font-serif text-xl italic leading-snug text-ivory-100/80 xs:text-2xl sm:text-[1.75rem]">
                {envelope.tease}
              </p>
              <span aria-hidden="true" className="gold-rule mt-6 w-20" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---- the envelope ---- */}
        <motion.div
          className="mt-10 flex w-full justify-center sm:mt-14"
          initial={
            reducedMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 90, scale: 0.82, rotate: -5, filter: 'blur(14px)' }
          }
          animate={{ opacity: 1, y: 0, scale: 1, rotate: 0, filter: 'blur(0px)' }}
          transition={{ duration: reducedMotion ? 0.35 : 1.7, delay: reducedMotion ? 0 : 0.5, ease: EASE_SILK }}
        >
          <Envelope
            monogram={envelope.sealMonogram}
            addressedTo={envelope.addressedTo}
            label={`${envelope.prompt} — open the letter inside`}
            onOpening={() => setOpening(true)}
            onOpened={advance}
          />
        </motion.div>

        {/* ---- prompt ---- */}
        <AnimatePresence>
          {!opening && (
            <motion.div
              key="prompt"
              className="mt-10 flex flex-col items-center gap-3 sm:mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 1, delay: reducedMotion ? 0 : 1.9, ease: EASE_SILK }}
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-champagne-300/80 animate-breathe motion-reduce:animate-none"
              />
              <p className="kicker text-champagne-200/55">{envelope.prompt}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default EnvelopeScene;

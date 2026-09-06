import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Tulip } from '../components/Tulip';
import { PhotoPlate } from '../components/PhotoPlate';
import { RevealText } from '../components/RevealText';
import { ScrollCue } from '../components/ScrollCue';
import { EASE_SILK, plateIn } from '../animations/motion';
import { useIsCompact } from '../hooks/useMediaQuery';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import type { BloomConfig } from '../data/config';

interface BloomSceneProps {
  bloom: BloomConfig;
  index: number;
  total: number;
  onComplete: () => void;
}

/**
 * One tulip, one memory.
 *
 * The bud opens first and holds the frame alone. Only once it has finished
 * does the photograph arrive, and the flower steps aside to make room for it —
 * so the two never compete, and the reveal has a beat of anticipation.
 */
export function BloomScene({ bloom, index, total, onComplete }: BloomSceneProps) {
  const [opened, setOpened] = useState(false);
  const [showPlate, setShowPlate] = useState(false);
  const isCompact = useIsCompact();
  const reducedMotion = usePrefersReducedMotion();

  /* The photograph follows the bloom by a beat. */
  useEffect(() => {
    if (!opened) return;
    const id = window.setTimeout(() => setShowPlate(true), reducedMotion ? 120 : 520);
    return () => window.clearTimeout(id);
  }, [opened, reducedMotion]);

  const ordinal = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  return (
    <section className="scene-frame">
      {/* The index, set large and nearly invisible behind everything. */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[3.5vh] -translate-x-1/2 select-none font-display text-[24vw] font-light leading-none text-white/[0.028] md:text-[15vw]"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.4, ease: EASE_SILK }}
      >
        {String(index + 1).padStart(2, '0')}
      </motion.span>

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-8 md:gap-12">
        {/* --------------------------- the flower --------------------------- */}
        <motion.div
          className="flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            /* Steps well back once the print is up, so the phone layout still
               fits the caption and the forward control on one screen. */
            height: showPlate ? (isCompact ? '19vh' : '34vh') : isCompact ? '44vh' : '54vh',
          }}
          transition={{
            opacity: { duration: 1, ease: EASE_SILK },
            height: { duration: 1.5, ease: EASE_SILK },
          }}
        >
          <Tulip
            variant={bloom.color}
            open
            delay={0.35}
            onOpened={() => setOpened(true)}
            className="h-full w-auto max-w-none"
          />
        </motion.div>

        {/* -------------------------- the memory ---------------------------- */}
        <AnimatePresence>
          {showPlate && (
            <motion.div
              className="flex w-full flex-col items-center gap-9 md:flex-row md:items-center md:gap-14"
              variants={plateIn}
              initial="hidden"
              animate="show"
            >
              {/* Photograph */}
              <div className="w-full max-w-[14.5rem] shrink-0 xs:max-w-[16rem] md:max-w-[21rem]">
                <PhotoPlate src={bloom.memory} alt={bloom.caption} index={ordinal} priority />
              </div>

              {/* Caption block */}
              <div className="flex w-full max-w-md flex-col items-center text-center md:items-start md:text-left">
                <motion.span
                  aria-hidden="true"
                  className="block h-px w-16 origin-left bg-gradient-to-r from-petal-200/80 to-transparent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.1, delay: 0.5, ease: EASE_SILK }}
                />

                <RevealText
                  as="h2"
                  text={bloom.caption}
                  delay={0.6}
                  className="mt-6 font-display text-[clamp(1.8rem,6.5vw,2.9rem)] font-light leading-[1.1] tracking-[-0.02em] text-paper-50"
                />

                <motion.p
                  className="mt-5 font-body text-[1.08rem] leading-relaxed text-paper-100/70"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, delay: 1.15, ease: EASE_SILK }}
                >
                  {bloom.note}
                </motion.p>

                {/* Forward control lives with the text, in normal flow, so it
                    can never sit on top of the note on a small screen. */}
                <motion.div
                  className="mt-7 md:mt-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 1.7 }}
                >
                  <ScrollCue
                    onClick={onComplete}
                    label={index + 1 === total ? 'The whole garden' : 'Next bloom'}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div role="status" aria-live="polite" className="sr-only">
        {showPlate ? `Bloom ${index + 1} of ${total}. ${bloom.caption}.` : `Bloom ${index + 1} opening.`}
      </div>
    </section>
  );
}

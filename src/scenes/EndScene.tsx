import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import AnimatedText from '@/components/AnimatedText';
import CtaButton from '@/components/CtaButton';
import LastReel from '@/components/LastReel';
import { EASE_GATE } from '@/animations/motion';
import { reelConfig } from '@/data/config';
import { useExperience } from '@/hooks/useExperience';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/** Beats, in seconds. The pauses are doing the work here. */
const BEAT = {
  end: 0.7,
  strike: 2.6,
  replacement: 3.5,
  closing: 5.4,
  extras: 6.8,
  restart: 7.8,
};

/**
 * Scene 7 — the tail.
 *
 * The lamp comes down, the dust thins out, and the film runs out. "The End"
 * arrives and then gets struck through, because it isn't the end — there are
 * still weeks of this to go. That correction is the whole point of the scene,
 * so nothing else moves while it happens.
 */
export function EndScene() {
  const { restart } = useExperience();
  const { end, signature, countdown } = reelConfig;
  const reducedMotion = usePrefersReducedMotion();
  const [stage, setStage] = useState(reducedMotion ? 4 : 0);

  useEffect(() => {
    if (reducedMotion) {
      setStage(4);
      return;
    }

    const timers = [
      window.setTimeout(() => setStage(1), BEAT.strike * 1000),
      window.setTimeout(() => setStage(2), BEAT.replacement * 1000),
      window.setTimeout(() => setStage(3), BEAT.closing * 1000),
      window.setTimeout(() => setStage(4), BEAT.extras * 1000),
    ];

    return () => timers.forEach(window.clearTimeout);
  }, [reducedMotion]);

  return (
    <section aria-label="The tail of the reel" className="relative w-full">
      {/* the house lights coming down further, just for this scene */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] bg-theatre-950/55" />

      <div className="scene-frame relative z-10">
        <div className="flex w-full max-w-2xl flex-col items-center text-center">
          {/* THE END — and the line through it */}
          <div className="relative inline-block">
            <AnimatedText
              as="span"
              text={end.struck}
              mode="chars"
              delay={BEAT.end}
              stagger={0.07}
              className="block font-display text-[2.2rem] uppercase leading-none tracking-[0.14em] text-beam-200/45 xs:text-[2.7rem] sm:text-[3.2rem]"
            />
            <motion.span
              aria-hidden="true"
              className="absolute left-[-6%] top-1/2 block h-[2px] w-[112%] origin-left bg-lamp-300/90"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: stage >= 1 ? 1 : 0, opacity: stage >= 1 ? 1 : 0 }}
              transition={{ duration: reducedMotion ? 0.2 : 0.6, ease: [0.85, 0, 0.15, 1] }}
              style={{ filter: 'blur(0.3px)' }}
            />
          </div>

          {/* what it should say instead */}
          {stage >= 2 && (
            <AnimatedText
              text={end.replacement}
              mode="words"
              delay={0.2}
              stagger={0.12}
              distance={16}
              className="mt-9 font-display text-[2rem] leading-tight text-beam-50 text-screen-glow xs:text-[2.5rem] sm:text-[3rem]"
            />
          )}

          {/* the film physically running out */}
          {stage >= 2 && (
            <motion.div
              aria-hidden="true"
              className="celluloid relative mt-10 h-9 w-full max-w-sm overflow-hidden rounded-[1px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.4, delay: 0.8, ease: EASE_GATE }}
            >
              {/* perforations along the top and bottom */}
              {(['top-[3px]', 'bottom-[3px]'] as const).map((edge) => (
                <span
                  key={edge}
                  className={`absolute inset-x-0 ${edge} h-[6px]`}
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, rgba(4,5,4,0.95) 0 7px, transparent 7px 16px)',
                    backgroundSize: '16px 100%',
                  }}
                />
              ))}
              {/* the last few frames, then clear stock */}
              <span
                className="absolute inset-y-[9px] left-0 w-[62%]"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(220,207,182,0.16) 0 1px, transparent 1px 34px)',
                  backgroundSize: '34px 100%',
                }}
              />
              <span
                className="absolute inset-y-0 right-0 w-[42%]"
                style={{
                  background:
                    'linear-gradient(to right, transparent, rgba(10,12,10,0.96) 72%)',
                }}
              />
            </motion.div>
          )}

          {/* the closing line */}
          {stage >= 3 && (
            <AnimatedText
              text={end.closing}
              mode="words"
              delay={0.3}
              stagger={0.06}
              className="mt-10 max-w-md font-script text-[0.9rem] leading-[1.95] text-beam-200/70 sm:text-[0.98rem]"
            />
          )}

          <motion.p
            className="slug mt-6 text-brass-300/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: stage >= 3 ? 1 : 0 }}
            transition={{ duration: 1.4, delay: 0.7, ease: EASE_GATE }}
          >
            {countdown}
          </motion.p>

          {signature ? (
            <motion.p
              className="slate-label mt-7 text-brass-300/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: stage >= 3 ? 1 : 0 }}
              transition={{ duration: 1.4, delay: 1, ease: EASE_GATE }}
            >
              {signature}
            </motion.p>
          ) : null}

          {/* after the credits */}
          <motion.div
            className="mt-14 w-full"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: stage >= 4 ? 1 : 0, y: stage >= 4 ? 0 : 16 }}
            transition={{ duration: reducedMotion ? 0.25 : 1.2, ease: EASE_GATE }}
            style={{ pointerEvents: stage >= 4 ? 'auto' : 'none' }}
          >
            {stage >= 4 && <LastReel config={end.lastReel} />}
          </motion.div>

          {/* run it again */}
          <motion.div
            className="mt-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: stage >= 4 ? 1 : 0 }}
            transition={{
              duration: 1.2,
              delay: reducedMotion ? 0 : BEAT.restart - BEAT.extras,
              ease: EASE_GATE,
            }}
            style={{ pointerEvents: stage >= 4 ? 'auto' : 'none' }}
          >
            <CtaButton
              variant="quiet"
              onClick={restart}
              disabled={stage < 4}
              icon={<RotateCcw className="h-3 w-3" strokeWidth={1.6} aria-hidden="true" />}
            >
              {end.restart}
            </CtaButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default EndScene;

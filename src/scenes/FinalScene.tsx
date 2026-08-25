import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import AnimatedText from '@/components/AnimatedText';
import CtaButton from '@/components/CtaButton';
import FinalSurprise from '@/components/FinalSurprise';
import { EASE_SILK } from '@/animations/motion';
import { birthdayConfig } from '@/data/config';
import { useExperience } from '@/hooks/useExperience';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/** Beats, in seconds. The silence between them is the point. */
const BEAT = {
  question: 0.8,
  answer: 3.6,
  closing: 6.2,
  surprise: 7.6,
  restart: 8.6,
};

/**
 * Scene 7 — the quiet part.
 *
 * The lights come down, the particles thin out, and there are only three
 * sentences left. The pause between the question and the answer is doing most
 * of the work here, so nothing else moves during it.
 */
export function FinalScene() {
  const { restart } = useExperience();
  const { final, signature } = birthdayConfig;
  const reducedMotion = usePrefersReducedMotion();
  const [stage, setStage] = useState(reducedMotion ? 3 : 0);

  useEffect(() => {
    if (reducedMotion) {
      setStage(3);
      return;
    }

    const timers = [
      window.setTimeout(() => setStage(1), BEAT.answer * 1000),
      window.setTimeout(() => setStage(2), BEAT.closing * 1000),
      window.setTimeout(() => setStage(3), BEAT.surprise * 1000),
    ];

    return () => timers.forEach(window.clearTimeout);
  }, [reducedMotion]);

  return (
    <section aria-label="One last thing" className="relative w-full">
      {/* an extra layer of darkness, just for this scene */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1] bg-ink-950/45"
      />

      <div className="scene-frame relative z-10">
        <div className="flex w-full max-w-2xl flex-col items-center text-center">
          <AnimatedText
            text={final.question}
            mode="words"
            delay={BEAT.question}
            stagger={0.075}
            className="font-serif text-[1.4rem] italic leading-snug text-ivory-100/60 xs:text-[1.7rem] sm:text-[2rem]"
          />

          {/* the pause, made visible */}
          <motion.span
            aria-hidden="true"
            className="my-10 block h-px w-24 bg-champagne-200/25"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: stage >= 1 ? 1 : 0, scaleX: stage >= 1 ? 1 : 0 }}
            transition={{ duration: 1.4, ease: EASE_SILK }}
          />

          {stage >= 1 && (
            <AnimatedText
              text={final.answer}
              mode="words"
              delay={0.2}
              stagger={0.12}
              distance={18}
              className="font-serif text-[2.1rem] leading-tight text-ivory-50 text-glow xs:text-[2.7rem] sm:text-[3.3rem]"
            />
          )}

          {stage >= 2 && (
            <AnimatedText
              text={final.closing}
              mode="words"
              delay={0.35}
              stagger={0.08}
              className="mt-9 font-script text-[1.7rem] leading-snug text-blush-300 xs:text-[2rem] sm:text-[2.4rem]"
            />
          )}

          {signature ? (
            <motion.p
              className="mt-8 font-sans text-[0.62rem] uppercase tracking-[0.32em] text-champagne-200/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: stage >= 2 ? 1 : 0 }}
              transition={{ duration: 1.4, delay: 0.8, ease: EASE_SILK }}
            >
              {signature}
            </motion.p>
          ) : null}

          {/* the hidden last page */}
          <motion.div
            className="mt-16 w-full"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: stage >= 3 ? 1 : 0, y: stage >= 3 ? 0 : 16 }}
            transition={{ duration: reducedMotion ? 0.25 : 1.2, ease: EASE_SILK }}
            style={{ pointerEvents: stage >= 3 ? 'auto' : 'none' }}
          >
            {stage >= 3 && <FinalSurprise config={final.surprise} />}
          </motion.div>

          {/* read it again */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: stage >= 3 ? 1 : 0 }}
            transition={{
              duration: 1.2,
              delay: reducedMotion ? 0 : BEAT.restart - BEAT.surprise,
              ease: EASE_SILK,
            }}
            style={{ pointerEvents: stage >= 3 ? 'auto' : 'none' }}
          >
            <CtaButton
              variant="quiet"
              onClick={restart}
              disabled={stage < 3}
              icon={<RotateCcw className="h-3 w-3" strokeWidth={1.6} aria-hidden="true" />}
            >
              {final.restart}
            </CtaButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default FinalScene;

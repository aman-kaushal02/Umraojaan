import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import AnimatedText from '@/components/AnimatedText';
import CtaButton from '@/components/CtaButton';
import TitleCard from '@/components/TitleCard';
import { EASE_GATE } from '@/animations/motion';
import { reelConfig } from '@/data/config';
import { useExperience } from '@/hooks/useExperience';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const LEAD_IN = 0.9;

/**
 * Scene 3 — opening titles.
 *
 * Credits behave like credits: the billing, then the title, then the lines
 * typed out one at a time, paced by their own length rather than a fixed delay.
 * The button only arrives once the last line has landed.
 */
export function TitlesScene() {
  const { advance } = useExperience();
  const { titles, countdown } = reelConfig;
  const reducedMotion = usePrefersReducedMotion();
  const [finished, setFinished] = useState(reducedMotion);

  /* Each line waits for the one before it — longer lines wait longer. */
  const schedule = useMemo(() => {
    let cursor = LEAD_IN + 2.5;
    return titles.lines.map((line) => {
      const start = cursor;
      cursor += 0.8 + line.split(' ').length * 0.042;
      return { line, start };
    });
  }, [titles.lines]);

  const total = useMemo(
    () => (schedule.length ? schedule[schedule.length - 1].start + 1.5 : LEAD_IN),
    [schedule],
  );

  useEffect(() => {
    if (reducedMotion) {
      setFinished(true);
      return;
    }
    const id = window.setTimeout(() => setFinished(true), total * 1000);
    return () => window.clearTimeout(id);
  }, [reducedMotion, total]);

  return (
    <section className="scene-frame" aria-label="Opening titles">
      <div className="flex w-full max-w-[40rem] flex-col items-center">
        <TitleCard delay={0.15}>
          <div className="px-6 py-8 xs:px-9 sm:px-12 sm:py-12">
            {/* billing */}
            <motion.p
              className="slate-label text-center text-brass-300/65"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.1, delay: LEAD_IN, ease: EASE_GATE }}
            >
              {titles.presents}
            </motion.p>

            {/* the title */}
            <AnimatedText
              as="h1"
              text={titles.title}
              mode="chars"
              delay={LEAD_IN + 0.5}
              stagger={0.07}
              distance={18}
              className="mt-6 text-center font-display text-[2.6rem] uppercase leading-[1.02] tracking-[0.06em] text-beam-50 text-screen-glow xs:text-[3.2rem] sm:text-[4rem]"
            />

            <motion.p
              className="mt-4 text-center font-display text-[0.95rem] italic leading-snug text-beam-200/60 sm:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: LEAD_IN + 1.4, ease: EASE_GATE }}
            >
              {titles.subtitle}
            </motion.p>

            <motion.span
              aria-hidden="true"
              className="brass-rule mx-auto mt-7 block w-28"
              initial={{ opacity: 0, scaleX: 0.3 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 1.4, delay: LEAD_IN + 1.8, ease: EASE_GATE }}
            />

            {/* the screenplay */}
            <div className="mt-7 space-y-4 sm:mt-9 sm:space-y-5">
              {schedule.map(({ line, start }, index) => (
                <AnimatedText
                  key={index}
                  text={line}
                  mode="words"
                  delay={start}
                  stagger={0.026}
                  distance={9}
                  className={
                    index === schedule.length - 1
                      ? 'text-center font-display text-[1.15rem] italic leading-snug text-lamp-200 xs:text-[1.3rem]'
                      : 'text-center font-script text-[0.86rem] leading-[1.95] text-beam-200/72 sm:text-[0.94rem]'
                  }
                />
              ))}
            </div>

            {/* the countdown, stamped like a production date */}
            <motion.p
              className="slug mt-8 text-center text-brass-300/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: finished ? 1 : 0 }}
              transition={{ duration: 1.2, ease: EASE_GATE }}
            >
              {countdown}
            </motion.p>
          </div>
        </TitleCard>

        <motion.div
          className="mt-8 sm:mt-11"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: finished ? 1 : 0, y: finished ? 0 : 14 }}
          transition={{ duration: reducedMotion ? 0.25 : 1, ease: EASE_GATE }}
        >
          {/* Disabled rather than hidden, so it never becomes an invisible tab stop. */}
          <CtaButton
            variant="housing"
            onClick={advance}
            disabled={!finished}
            icon={<ChevronRight className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden="true" />}
          >
            {titles.cta}
          </CtaButton>
        </motion.div>
      </div>
    </section>
  );
}

export default TitlesScene;

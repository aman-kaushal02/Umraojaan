import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import AnimatedText from '@/components/AnimatedText';
import CtaButton from '@/components/CtaButton';
import LetterPaper from '@/components/LetterPaper';
import { EASE_SILK } from '@/animations/motion';
import { birthdayConfig } from '@/data/config';
import { useExperience } from '@/hooks/useExperience';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const LEAD_IN = 0.85;

/**
 * Scene 3 — the letter itself.
 *
 * Lines arrive one at a time, paced by their own length, the way someone
 * actually reads. The last two lines get the emphasis, because they're the
 * hinge of the whole thing: this isn't the end, it's the beginning.
 */
export function LetterScene() {
  const { advance } = useExperience();
  const { letter } = birthdayConfig;
  const reducedMotion = usePrefersReducedMotion();
  const [finished, setFinished] = useState(reducedMotion);

  /* Each line waits for the one before it to land — longer lines wait longer. */
  const schedule = useMemo(() => {
    let cursor = LEAD_IN + 1.1;
    return letter.lines.map((line) => {
      const start = cursor;
      cursor += 0.85 + line.split(' ').length * 0.045;
      return { line, start };
    });
  }, [letter.lines]);

  const total = useMemo(
    () => (schedule.length ? schedule[schedule.length - 1].start + 1.6 : LEAD_IN),
    [schedule],
  );

  /* The button is gated on the reading, not on a hard-coded delay. */
  useEffect(() => {
    if (reducedMotion) {
      setFinished(true);
      return;
    }
    const id = window.setTimeout(() => setFinished(true), total * 1000);
    return () => window.clearTimeout(id);
  }, [reducedMotion, total]);

  const lastIndex = schedule.length - 1;

  return (
    <section className="scene-frame" aria-label="A letter">
      <div className="flex w-full max-w-[38rem] flex-col items-center">
        <LetterPaper delay={0.15} className="max-w-[38rem]">
          <div className="px-6 py-11 xs:px-9 sm:px-12 sm:py-14">
            {/* small wax monogram, as if pressed into the page */}
            <motion.div
              aria-hidden="true"
              className="mx-auto mb-8 flex h-8 w-8 items-center justify-center rounded-full"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: EASE_SILK }}
              style={{
                background:
                  'radial-gradient(circle at 34% 30%, #a8264a 0%, #7a1130 46%, #4d0c20 100%)',
                boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.25), 0 3px 8px -3px rgba(34,5,15,0.6)',
              }}
            >
              <span className="font-serif text-[0.7rem] text-champagne-200/85">
                {birthdayConfig.envelope.sealMonogram}
              </span>
            </motion.div>

            <AnimatedText
              as="h1"
              text={letter.salutation}
              mode="words"
              delay={LEAD_IN}
              stagger={0.07}
              className="text-center font-serif text-[1.6rem] italic leading-tight text-burgundy-600 xs:text-[1.9rem] sm:text-[2.15rem]"
            />

            <div className="mt-8 space-y-6 sm:mt-10">
              {schedule.map(({ line, start }, index) => {
                const emphasised = index >= lastIndex - 1 && schedule.length > 2;

                return (
                  <AnimatedText
                    key={index}
                    text={line}
                    mode="words"
                    delay={start}
                    stagger={0.03}
                    distance={10}
                    className={
                      emphasised
                        ? 'text-center font-serif text-[1.25rem] italic leading-snug text-burgundy-500 xs:text-[1.45rem]'
                        : 'text-center font-sans text-[0.94rem] font-light leading-[1.95] text-[#5a3a46] sm:text-[1rem]'
                    }
                  />
                );
              })}
            </div>

            <motion.span
              aria-hidden="true"
              className="gold-rule mx-auto mt-10 block w-24"
              initial={{ opacity: 0, scaleX: 0.4 }}
              animate={{ opacity: finished ? 1 : 0, scaleX: finished ? 1 : 0.4 }}
              transition={{ duration: 1.1, ease: EASE_SILK }}
            />
          </div>
        </LetterPaper>

        <motion.div
          className="mt-10 sm:mt-12"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: finished ? 1 : 0, y: finished ? 0 : 14 }}
          transition={{ duration: reducedMotion ? 0.25 : 1, ease: EASE_SILK }}
        >
          {/* Disabled rather than hidden, so it never becomes an invisible tab stop. */}
          <CtaButton
            variant="outline"
            onClick={advance}
            disabled={!finished}
            icon={<ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />}
          >
            {letter.cta}
          </CtaButton>
        </motion.div>
      </div>
    </section>
  );
}

export default LetterScene;

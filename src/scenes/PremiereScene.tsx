import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import AnimatedText from '@/components/AnimatedText';
import CtaButton from '@/components/CtaButton';
import LightFlood from '@/components/LightFlood';
import SafeImage from '@/components/SafeImage';
import { EASE_GATE } from '@/animations/motion';
import { reelConfig } from '@/data/config';
import { useExperience } from '@/hooks/useExperience';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Scene 6 — the premiere.
 *
 * Her name lands first, letter by letter, billed the way a lead is billed. The
 * lamp floods a beat later so the two don't fight for attention, and the message
 * unfolds paragraph by paragraph rather than arriving as a wall of text.
 */
export function PremiereScene() {
  const { advance } = useExperience();
  const { premiere, name } = reelConfig;
  const reducedMotion = usePrefersReducedMotion();

  const [flooding, setFlooding] = useState(false);
  const [finished, setFinished] = useState(reducedMotion);

  /* Paragraph timing scales with length, so longer thoughts get room. */
  const schedule = useMemo(() => {
    let cursor = 2.9;
    return premiere.paragraphs.map((paragraph) => {
      const start = cursor;
      cursor += 1.05 + paragraph.split(' ').length * 0.034;
      return { paragraph, start };
    });
  }, [premiere.paragraphs]);

  const total = schedule.length ? schedule[schedule.length - 1].start + 2 : 3;

  useEffect(() => {
    if (reducedMotion) {
      setFlooding(true);
      setFinished(true);
      return;
    }

    const openBeat = window.setTimeout(() => setFlooding(true), 850);
    const closeBeat = window.setTimeout(() => setFinished(true), total * 1000);

    return () => {
      window.clearTimeout(openBeat);
      window.clearTimeout(closeBeat);
    };
  }, [reducedMotion, total]);

  return (
    <section className="scene-frame" aria-label={`The premiere — starring ${name}`}>
      <LightFlood active={flooding} />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
        {/* the lamp at full, right behind the billing */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/3 rounded-full blur-3xl"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 0.8, scale: 1 }}
          transition={{ duration: 2.2, ease: EASE_GATE }}
          style={{
            background:
              'radial-gradient(circle, rgba(243,233,212,0.3) 0%, rgba(227,185,114,0.16) 44%, transparent 72%)',
          }}
        />

        <motion.p
          className="slate-label relative text-[0.6rem] text-brass-300/80 xs:text-[0.68rem]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: EASE_GATE }}
        >
          {premiere.billing}
        </motion.p>

        {/* the name, billed above the title */}
        <h1 className="relative mt-4">
          <AnimatedText
            as="span"
            text={name}
            mode="chars"
            delay={0.6}
            stagger={0.07}
            distance={20}
            /* Solid ink plus layered glow. Deliberately not gradient-clipped
               text: the per-letter blur filters would break the clip in some
               engines and risk an invisible name. */
            className="block font-display text-[2.6rem] uppercase leading-[1.04] tracking-[0.04em] text-beam-50 xs:text-[3.3rem] sm:text-[4.4rem] lg:text-[5.2rem]"
            style={{
              textShadow:
                '0 0 22px rgba(243,233,212,0.45), 0 0 70px rgba(227,185,114,0.34), 0 6px 40px rgba(0,0,0,0.6)',
            }}
          />
        </h1>

        <motion.span
          aria-hidden="true"
          className="brass-rule relative mt-6 block w-36"
          initial={{ opacity: 0, scaleX: 0.2 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1.6, delay: 1.5, ease: EASE_GATE }}
        />

        {/* the final frame */}
        {premiere.photo ? (
          <motion.figure
            className="relative mt-6"
            initial={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 30, scale: 0.9, filter: 'blur(14px) brightness(0.4)' }
            }
            animate={
              reducedMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px) brightness(1)' }
            }
            transition={{ duration: reducedMotion ? 0.3 : 1.6, delay: 1.9, ease: EASE_GATE }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-6 -z-10 rounded-full opacity-80 blur-2xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(227,185,114,0.28) 0%, rgba(243,233,212,0.12) 46%, transparent 74%)',
              }}
            />

            <div className="celluloid flex w-[7.25rem] gap-1.5 rounded-[2px] p-1.5 shadow-frame xs:w-[9rem] sm:w-[11rem]">
              {/* perforations, so it reads as one frame of the same reel */}
              {(['a', 'b'] as const).map((edge) => (
                <span
                  key={edge}
                  aria-hidden="true"
                  className={`block w-[8px] shrink-0 ${edge === 'b' ? 'order-last' : ''}`}
                  style={{
                    backgroundImage:
                      'linear-gradient(to bottom, rgba(4,5,4,0.95) 0 8px, transparent 8px 18px)',
                    backgroundSize: '100% 18px',
                    backgroundRepeat: 'repeat-y',
                    backgroundPosition: '0 5px',
                  }}
                />
              ))}
              <SafeImage
                src={premiere.photo}
                alt={premiere.photoAlt ?? `A photograph of ${name}`}
                priority
                className="aspect-[3/4] min-w-0 flex-1 rounded-[1px] print-warm"
              />
            </div>

            {premiere.photoCaption ? (
              <figcaption className="slug mt-3 text-center text-brass-300/55">
                {premiere.photoCaption}
              </figcaption>
            ) : null}
          </motion.figure>
        ) : null}

        {/* the message */}
        <div className="relative mt-5 flex w-full max-w-[34rem] flex-col gap-3 sm:mt-7 sm:gap-4">
          {schedule.map(({ paragraph, start }, index) => (
            <AnimatedText
              key={index}
              text={paragraph}
              mode="words"
              delay={start}
              stagger={0.02}
              distance={8}
              className={
                index === 0
                  ? 'font-display text-[1.1rem] italic leading-[1.55] text-beam-50/90 sm:text-[1.32rem]'
                  : 'font-script text-[0.82rem] leading-[1.85] text-beam-200/68 sm:text-[0.9rem]'
              }
            />
          ))}
        </div>

        <motion.div
          className="relative mt-8"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: finished ? 1 : 0, y: finished ? 0 : 14 }}
          transition={{ duration: reducedMotion ? 0.25 : 1.1, ease: EASE_GATE }}
        >
          <CtaButton
            variant="housing"
            onClick={advance}
            disabled={!finished}
            icon={<ChevronRight className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden="true" />}
          >
            {premiere.cta}
          </CtaButton>
        </motion.div>
      </div>
    </section>
  );
}

export default PremiereScene;

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import AnimatedText from '@/components/AnimatedText';
import Celebration from '@/components/Celebration';
import CtaButton from '@/components/CtaButton';
import SafeImage from '@/components/SafeImage';
import { EASE_SILK } from '@/animations/motion';
import { birthdayConfig } from '@/data/config';
import { useExperience } from '@/hooks/useExperience';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Scene 6 — the reveal, and the only place the words "Happy Birthday" appear.
 *
 * Her name lands first, letter by letter, and the celebration starts a beat
 * later so the two don't fight for attention. The message then unfolds
 * paragraph by paragraph rather than arriving as a wall of text.
 */
export function BirthdayReveal() {
  const { advance } = useExperience();
  const { reveal, name } = birthdayConfig;
  const reducedMotion = usePrefersReducedMotion();

  const [celebrating, setCelebrating] = useState(false);
  const [finished, setFinished] = useState(reducedMotion);

  /* Paragraph timing scales with length, so long thoughts get room to breathe. */
  const schedule = useMemo(() => {
    let cursor = 2.6;
    return reveal.paragraphs.map((paragraph) => {
      const start = cursor;
      cursor += 1.1 + paragraph.split(' ').length * 0.035;
      return { paragraph, start };
    });
  }, [reveal.paragraphs]);

  const total = schedule.length ? schedule[schedule.length - 1].start + 2 : 3;

  useEffect(() => {
    if (reducedMotion) {
      setCelebrating(true);
      setFinished(true);
      return;
    }

    const openBeat = window.setTimeout(() => setCelebrating(true), 900);
    const closeBeat = window.setTimeout(() => setFinished(true), total * 1000);

    return () => {
      window.clearTimeout(openBeat);
      window.clearTimeout(closeBeat);
    };
  }, [reducedMotion, total]);

  return (
    <section className="scene-frame" aria-label={`A message for ${name}`}>
      <Celebration active={celebrating} />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
        {/* candlelight behind the greeting */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/3 rounded-full blur-3xl"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 0.75, scale: 1 }}
          transition={{ duration: 2.2, ease: EASE_SILK }}
          style={{
            background:
              'radial-gradient(circle, rgba(247,231,201,0.30) 0%, rgba(238,191,200,0.16) 44%, transparent 72%)',
          }}
        />

        <motion.p
          className="relative font-sans text-[0.72rem] uppercase tracking-[0.44em] text-champagne-300/85 xs:text-[0.85rem] sm:tracking-[0.52em]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: EASE_SILK }}
        >
          {reveal.greeting}
        </motion.p>

        {/* the name */}
        <h1 className="relative mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <AnimatedText
            as="span"
            text={name}
            mode="chars"
            delay={0.6}
            stagger={0.07}
            distance={22}
            /* Solid ink + layered warm glow. Deliberately not gradient-clipped
               text: the per-letter blur filters would break the clip in some
               engines and risk an invisible name. */
            className="font-serif text-[3.2rem] leading-[1.02] text-ivory-50 xs:text-[4rem] sm:text-[5.2rem] lg:text-[6rem]"
            style={{
              textShadow:
                '0 0 18px rgba(247,231,201,0.45), 0 0 60px rgba(238,191,200,0.3), 0 6px 40px rgba(122,17,48,0.35)',
            }}
          />
          <motion.span
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 + name.length * 0.07, ease: EASE_SILK }}
            className="inline-flex"
          >
            <Heart
              aria-label="with love"
              className="h-6 w-6 fill-blush-400 text-blush-400 drop-shadow-[0_0_14px_rgba(226,160,173,0.75)] sm:h-9 sm:w-9
                         animate-breathe motion-reduce:animate-none"
              strokeWidth={1}
            />
          </motion.span>
        </h1>

        <motion.span
          aria-hidden="true"
          className="gold-rule relative mt-8 block w-40"
          initial={{ opacity: 0, scaleX: 0.2 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1.6, delay: 1.5, ease: EASE_SILK }}
        />

        {/* what was inside the box */}
        {reveal.photo ? (
          <motion.figure
            className="relative mt-8"
            initial={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 34, scale: 0.86, rotate: -7, filter: 'blur(12px)' }
            }
            animate={
              reducedMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, scale: 1, rotate: -2.5, filter: 'blur(0px)' }
            }
            transition={{ duration: reducedMotion ? 0.3 : 1.5, delay: 1.9, ease: EASE_SILK }}
          >
            {/* warm halo, as if it's still catching the light from the box */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-7 -z-10 rounded-full opacity-80 blur-2xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(247,231,201,0.34) 0%, rgba(238,191,200,0.16) 46%, transparent 74%)',
              }}
            />

            <div className="paper paper-fibers w-[8.5rem] rounded-[3px] p-2.5 pb-3 shadow-paper xs:w-[10rem] sm:w-[11.5rem]">
              <SafeImage
                src={reveal.photo}
                alt={reveal.photoAlt ?? `A photograph for ${name}`}
                priority
                className="aspect-[4/5] w-full rounded-[2px]"
              />
              {reveal.photoCaption ? (
                <figcaption className="pt-2.5 text-center font-script text-[0.95rem] leading-none text-rose-600/85">
                  {reveal.photoCaption}
                </figcaption>
              ) : null}
            </div>
          </motion.figure>
        ) : null}

        {/* the message */}
        <div className="relative mt-8 flex w-full max-w-[34rem] flex-col gap-5">
          {schedule.map(({ paragraph, start }, index) => (
            <AnimatedText
              key={index}
              text={paragraph}
              mode="words"
              delay={start}
              stagger={0.022}
              distance={9}
              className={
                index === 0
                  ? 'font-serif text-[1.15rem] italic leading-[1.6] text-ivory-50/90 sm:text-[1.4rem]'
                  : 'font-sans text-[0.9rem] font-light leading-[1.9] text-ivory-100/65 sm:text-[0.98rem]'
              }
            />
          ))}
        </div>

        <motion.div
          className="relative mt-12"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: finished ? 1 : 0, y: finished ? 0 : 14 }}
          transition={{ duration: reducedMotion ? 0.25 : 1.1, ease: EASE_SILK }}
        >
          <CtaButton
            variant="outline"
            onClick={advance}
            disabled={!finished}
            icon={<Heart className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />}
          >
            {reveal.cta}
          </CtaButton>
        </motion.div>
      </div>
    </section>
  );
}

export default BirthdayReveal;

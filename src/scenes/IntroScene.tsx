import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import AnimatedText from '@/components/AnimatedText';
import CtaButton from '@/components/CtaButton';
import { EASE_SILK } from '@/animations/motion';
import { birthdayConfig } from '@/data/config';
import { useExperience } from '@/hooks/useExperience';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Scene 1 — the invitation.
 *
 * No name, no greeting, no confetti. Just a dark room, a little light, and a
 * question. The only job of this scene is to make her want to tap the button.
 */
export function IntroScene() {
  const { advance } = useExperience();
  const { intro } = birthdayConfig;
  const reducedMotion = usePrefersReducedMotion();

  const fade = (delay: number) => ({
    initial: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reducedMotion ? 0.3 : 1.2, delay: reducedMotion ? 0 : delay, ease: EASE_SILK },
  });

  return (
    <section className="scene-frame" aria-label="An invitation">
      <div className="relative flex w-full max-w-2xl flex-col items-center text-center">
        {/* A single thread of light, drawing itself downward */}
        <motion.span
          aria-hidden="true"
          className="mb-8 block w-px bg-gradient-to-b from-transparent via-champagne-300/70 to-champagne-300/10"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: reducedMotion ? 40 : 74, opacity: 1 }}
          transition={{ duration: reducedMotion ? 0.3 : 1.6, ease: EASE_SILK, delay: 0.2 }}
        />

        <motion.p {...fade(0.7)} className="kicker text-champagne-300/70">
          {intro.kicker}
        </motion.p>

        <AnimatedText
          as="h1"
          text={intro.line}
          mode="words"
          delay={1.15}
          stagger={0.085}
          className="mt-7 font-serif text-[2rem] leading-[1.16] text-ivory-50 text-glow xs:text-[2.5rem] sm:text-[3.1rem] lg:text-[3.6rem]"
        />

        <motion.div
          aria-hidden="true"
          {...fade(2.2)}
          className="mt-9 flex items-center gap-4"
        >
          <span className="gold-rule w-16 sm:w-24" />
          <span className="h-1 w-1 rounded-full bg-champagne-300/80 animate-breathe motion-reduce:animate-none" />
          <span className="gold-rule w-16 sm:w-24" />
        </motion.div>

        <AnimatedText
          text={intro.subline}
          mode="words"
          delay={2.5}
          stagger={0.06}
          className="mt-8 max-w-md font-sans text-[0.95rem] font-light leading-relaxed tracking-wide text-ivory-100/65 sm:text-base"
        />

        <motion.div {...fade(3.4)} className="mt-12 sm:mt-14">
          <CtaButton
            onClick={advance}
            icon={<ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />}
            ariaLabel={`${intro.cta} — begin the surprise`}
          >
            {intro.cta}
          </CtaButton>
        </motion.div>

        <motion.p
          {...fade(4.3)}
          className="mt-9 max-w-xs font-serif text-sm italic text-ivory-100/35"
        >
          {intro.hint}
        </motion.p>
      </div>
    </section>
  );
}

export default IntroScene;

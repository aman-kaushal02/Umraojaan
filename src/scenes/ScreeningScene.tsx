import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import AnimatedText from '@/components/AnimatedText';
import CtaButton from '@/components/CtaButton';
import FilmFrame from '@/components/FilmFrame';
import ScrollCue from '@/components/ScrollCue';
import { EASE_GATE } from '@/animations/motion';
import { reelConfig } from '@/data/config';
import { useExperience } from '@/hooks/useExperience';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Scene 4 — the screening.
 *
 * The only part of the experience that scrolls. Frames alternate sides and
 * drift at different rates so the prints feel like objects passing through a
 * gate rather than cells in a grid. Reveals use IntersectionObserver via
 * Framer's viewport prop — nothing listens to the scroll event directly.
 */
export function ScreeningScene() {
  const { advance } = useExperience();
  const { screening } = reelConfig;
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section aria-label="The screening" className="relative w-full">
      {/* ---------- title, one full screen of its own ---------- */}
      <header className="scene-frame">
        <div className="flex w-full max-w-2xl flex-col items-center text-center">
          <motion.p
            className="slate-label text-brass-300/70"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: EASE_GATE }}
          >
            {screening.label}
          </motion.p>

          <AnimatedText
            as="h1"
            text={screening.heading}
            mode="words"
            delay={0.7}
            stagger={0.1}
            className="mt-6 font-display text-[2.2rem] leading-[1.08] text-beam-50 text-screen-glow xs:text-[2.7rem] sm:text-[3.3rem] lg:text-[3.8rem]"
          />

          <motion.p
            className="slug mt-8 max-w-md text-beam-200/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.6, ease: EASE_GATE }}
          >
            {screening.subheading}
          </motion.p>

          <div className="mt-14">
            <ScrollCue />
          </div>
        </div>
      </header>

      {/* ---------- the frames ---------- */}
      <div className="relative mx-auto w-full max-w-6xl px-5 pb-8 sm:px-8">
        {/* the strip running through the whole scene */}
        {!reducedMotion && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-brass-400/20 to-transparent md:block"
            initial={{ height: 0 }}
            whileInView={{ height: '100%' }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration: 2.4, ease: EASE_GATE }}
          />
        )}

        <div className="flex flex-col gap-28 sm:gap-36 lg:gap-44">
          {screening.frames.map((frame, index) => (
            <FilmFrame
              key={`${frame.slate}-${frame.title}`}
              frame={frame}
              side={index % 2 === 0 ? 'left' : 'right'}
              parallax={index % 2 === 0 ? 44 : 34}
              priority={index === 0}
            />
          ))}
        </div>
      </div>

      {/* ---------- and there's one more take ---------- */}
      <footer className="scene-frame">
        <motion.div
          className="flex flex-col items-center text-center"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 26, filter: 'blur(8px)' }}
          whileInView={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: reducedMotion ? 0.3 : 1.3, ease: EASE_GATE }}
        >
          <span aria-hidden="true" className="brass-rule w-20" />
          <p className="mt-8 max-w-sm font-display text-xl italic leading-snug text-beam-100/75 sm:text-2xl">
            {screening.outro}
          </p>

          <div className="mt-10">
            <CtaButton
              onClick={advance}
              icon={<ChevronDown className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden="true" />}
            >
              {screening.cta}
            </CtaButton>
          </div>
        </motion.div>
      </footer>
    </section>
  );
}

export default ScreeningScene;

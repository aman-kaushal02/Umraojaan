import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import AnimatedText from '@/components/AnimatedText';
import CtaButton from '@/components/CtaButton';
import MemoryCard from '@/components/MemoryCard';
import ScrollCue from '@/components/ScrollCue';
import { EASE_SILK } from '@/animations/motion';
import { birthdayConfig } from '@/data/config';
import { useExperience } from '@/hooks/useExperience';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Scene 4 — their story.
 *
 * The only part of the experience that scrolls. Chapters alternate sides and
 * drift at different speeds so the photographs feel like objects on a table
 * rather than cells in a grid. Reveals use IntersectionObserver via Framer's
 * viewport prop — nothing listens to the scroll event directly.
 */
export function MemoryScene() {
  const { advance } = useExperience();
  const { memories } = birthdayConfig;
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section aria-label="Our story" className="relative w-full">
      {/* ---------- opening title, one full screen of its own ---------- */}
      <header className="scene-frame">
        <div className="flex w-full max-w-2xl flex-col items-center text-center">
          <motion.p
            className="kicker text-champagne-300/70"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: EASE_SILK }}
          >
            {memories.kicker}
          </motion.p>

          <AnimatedText
            as="h1"
            text={memories.heading}
            mode="words"
            delay={0.7}
            stagger={0.1}
            className="mt-6 font-serif text-[2.3rem] leading-[1.1] text-ivory-50 text-glow xs:text-[2.9rem] sm:text-[3.5rem] lg:text-[4rem]"
          />

          <motion.p
            className="mt-8 max-w-md font-sans text-[0.9rem] font-light leading-relaxed text-ivory-100/55 sm:text-[0.95rem]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.6, ease: EASE_SILK }}
          >
            {memories.subheading}
          </motion.p>

          <div className="mt-14">
            <ScrollCue />
          </div>
        </div>
      </header>

      {/* ---------- the chapters ---------- */}
      <div className="relative mx-auto w-full max-w-6xl px-5 pb-8 sm:px-8">
        {/* the thread running through the story */}
        {!reducedMotion && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-champagne-200/20 to-transparent md:block"
            initial={{ height: 0 }}
            whileInView={{ height: '100%' }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration: 2.4, ease: EASE_SILK }}
          />
        )}

        <div className="flex flex-col gap-28 sm:gap-36 lg:gap-44">
          {memories.items.map((memory, index) => (
            <MemoryCard
              key={`${memory.chapter}-${memory.title}`}
              memory={memory}
              side={index % 2 === 0 ? 'left' : 'right'}
              parallax={index % 2 === 0 ? 44 : 34}
              priority={index === 0}
            />
          ))}
        </div>
      </div>

      {/* ---------- and there's more ---------- */}
      <footer className="scene-frame">
        <motion.div
          className="flex flex-col items-center text-center"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 26, filter: 'blur(8px)' }}
          whileInView={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: reducedMotion ? 0.3 : 1.3, ease: EASE_SILK }}
        >
          <span aria-hidden="true" className="gold-rule w-20" />
          <p className="mt-8 max-w-sm font-serif text-xl italic leading-snug text-ivory-100/75 sm:text-2xl">
            {memories.outro}
          </p>

          <div className="mt-10">
            <CtaButton
              onClick={advance}
              icon={<ArrowDown className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />}
            >
              {memories.cta}
            </CtaButton>
          </div>
        </motion.div>
      </footer>
    </section>
  );
}

export default MemoryScene;

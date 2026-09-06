import { motion } from 'framer-motion';
import { RevealText } from '../components/RevealText';
import { CtaButton } from '../components/CtaButton';
import { Tulip } from '../components/Tulip';
import { gardenConfig } from '../data/config';
import { EASE_SILK, riseIn, ruleDraw } from '../animations/motion';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface GateSceneProps {
  onEnter: () => void;
}

/**
 * The title card. A single closed tulip rises behind the type while the
 * garden is still dark.
 */
export function GateScene({ onEnter }: GateSceneProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section className="scene-frame">
      {/* One tall closed bud, behind and below the title. */}
      {/* Sized by width so it stays centred; an SVG with only a height set
          has no definite width to translate against. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[8vh] left-1/2 w-[86vw] max-w-sm -translate-x-1/2"
        initial={{ opacity: 0, y: 70 }}
        animate={{ opacity: 0.42, y: 0 }}
        transition={{ duration: 2.6, delay: 0.4, ease: EASE_SILK }}
      >
        <Tulip
          variant="rose"
          open={false}
          delay={0.5}
          className="h-auto w-full blur-[1.5px]"
        />
      </motion.div>

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        {/* Overline */}
        <motion.p
          className="font-label text-[0.62rem] uppercase tracking-wide2 text-paper-100/55"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.5, ease: EASE_SILK }}
        >
          Week Three
        </motion.p>

        {/* Title */}
        <RevealText
          as="h1"
          text={gardenConfig.gate.title}
          delay={0.75}
          className="mt-5 font-display text-[clamp(3.6rem,17vw,8.5rem)] font-light leading-[0.92] tracking-[-0.03em] text-paper-50"
          lineClassName="text-glow-soft"
        />

        {/* Subtitle */}
        <RevealText
          text={gardenConfig.gate.subtitle}
          delay={1.15}
          className="mt-4 font-body text-[clamp(1.15rem,4vw,1.6rem)] italic text-paper-100/75"
        />

        {/* Hairline */}
        <motion.span
          aria-hidden="true"
          className="mt-9 block h-px w-40 origin-center bg-gradient-to-r from-transparent via-petal-200/70 to-transparent"
          variants={ruleDraw}
          initial="hidden"
          animate="show"
          transition={{ delay: 1.5 }}
        />

        {/* Countdown */}
        <motion.div
          className="mt-8"
          variants={riseIn}
          initial="hidden"
          animate="show"
          transition={{ delay: 1.7 }}
        >
          <p className="font-display text-[clamp(1.5rem,5.5vw,2.3rem)] font-light text-paper-50">
            {gardenConfig.countdown}
          </p>
        </motion.div>

        {/* Line */}
        <RevealText
          text={gardenConfig.gate.line}
          delay={2.05}
          className="mt-6 max-w-md font-body text-[1.05rem] leading-relaxed text-paper-100/65"
        />

        {/* Enter */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 2.4, ease: EASE_SILK }}
        >
          <CtaButton onClick={onEnter} variant="bloom">
            {gardenConfig.gate.cta}
          </CtaButton>
        </motion.div>

        {/* A hint that there is sound, since the track needs her tap. */}
        {!reducedMotion && (
          <motion.p
            className="mt-7 font-label text-[0.56rem] uppercase tracking-wide2 text-paper-100/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 3 }}
          >
            Best with sound
          </motion.p>
        )}
      </div>

      <div role="status" aria-live="polite" className="sr-only">
        {gardenConfig.gate.title}. {gardenConfig.countdown}.
      </div>
    </section>
  );
}

import { motion } from 'framer-motion';
import { Power } from 'lucide-react';
import AnimatedText from '@/components/AnimatedText';
import CtaButton from '@/components/CtaButton';
import { EASE_GATE } from '@/animations/motion';
import { reelConfig } from '@/data/config';
import { useExperience } from '@/hooks/useExperience';
import { useMusic } from '@/hooks/useMusic';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Scene 1 — the auditorium, before anything happens.
 *
 * No name, no greeting, no confetti. A dark room, one seat, and the sense that
 * something is loaded and waiting. The only job of this scene is to make her
 * want to press the button.
 */
export function ProjectorScene() {
  const { advance } = useExperience();
  const { start: startMusic } = useMusic();
  const { projector } = reelConfig;
  const reducedMotion = usePrefersReducedMotion();

  /**
   * Her first tap does two things: starts the projector and starts the sound.
   *
   * Playback is kicked off synchronously here, inside the click handler, which
   * is the one path mobile Safari reliably honours — anything deferred to an
   * effect or a document-level listener can be refused.
   */
  const open = () => {
    startMusic();
    advance();
  };

  const fade = (delay: number) => ({
    initial: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reducedMotion ? 0.3 : 1.2,
      delay: reducedMotion ? 0 : delay,
      ease: EASE_GATE,
    },
  });

  return (
    <section className="scene-frame" aria-label="A dark auditorium">
      <div className="relative flex w-full max-w-2xl flex-col items-center text-center">
        {/* the gate opening: a slit of light widening into a frame */}
        <motion.span
          aria-hidden="true"
          className="mb-10 block h-[3px] rounded-full bg-gradient-to-r from-transparent via-lamp-200 to-transparent"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: reducedMotion ? 120 : 168, opacity: 1 }}
          transition={{ duration: reducedMotion ? 0.3 : 1.8, ease: EASE_GATE, delay: 0.25 }}
          style={{ filter: 'blur(0.4px)' }}
        />

        <motion.p {...fade(0.7)} className="slate-label text-brass-300/70">
          {projector.label}
        </motion.p>

        <AnimatedText
          as="h1"
          text={projector.line}
          mode="words"
          delay={1.15}
          stagger={0.09}
          className="mt-7 font-display text-[2.1rem] leading-[1.1] text-beam-50 text-screen-glow xs:text-[2.6rem] sm:text-[3.2rem] lg:text-[3.7rem]"
        />

        <motion.div aria-hidden="true" {...fade(2.2)} className="mt-9 flex items-center gap-4">
          <span className="brass-rule w-14 sm:w-20" />
          <span
            className={[
              'h-1.5 w-1.5 rounded-full bg-lamp-300',
              reducedMotion ? '' : 'animate-blink',
            ].join(' ')}
          />
          <span className="brass-rule w-14 sm:w-20" />
        </motion.div>

        <AnimatedText
          text={projector.subline}
          mode="words"
          delay={2.5}
          stagger={0.045}
          className="mt-8 max-w-md font-script text-[0.9rem] leading-[1.9] tracking-wide text-beam-200/65 sm:text-[0.98rem]"
        />

        <motion.div {...fade(3.5)} className="mt-12 sm:mt-14">
          <CtaButton
            onClick={open}
            icon={<Power className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden="true" />}
            ariaLabel={`${projector.cta} — begin the screening`}
          >
            {projector.cta}
          </CtaButton>
        </motion.div>

        <motion.p {...fade(4.4)} className="slug mt-9 max-w-xs text-beam-200/35">
          {projector.hint}
        </motion.p>
      </div>
    </section>
  );
}

export default ProjectorScene;

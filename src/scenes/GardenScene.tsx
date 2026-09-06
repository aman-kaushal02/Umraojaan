import { motion } from 'framer-motion';
import { Tulip } from '../components/Tulip';
import { RevealText } from '../components/RevealText';
import { CtaButton } from '../components/CtaButton';
import { gardenConfig } from '../data/config';
import { EASE_SILK, plateIn } from '../animations/motion';

interface GardenSceneProps {
  onContinue: () => void;
}

/**
 * Every bud open at once, with the letter laid over the bed.
 */
export function GardenScene({ onContinue }: GardenSceneProps) {
  const count = gardenConfig.blooms.length;
  const middle = (count - 1) / 2;

  return (
    <section className="scene-frame">
      {/* The full bed, all six in bloom. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center"
      >
        <div className="flex w-[240%] max-w-6xl items-end justify-center gap-[0.5vw] xs:w-[195%] md:w-[120%]">
          {gardenConfig.blooms.map((b, i) => {
            const fromMiddle = Math.abs(i - middle) / middle;

            return (
              <motion.div
                key={i}
                className="min-w-0 flex-1"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 0.94 - fromMiddle * 0.24, y: fromMiddle * 22 }}
                transition={{ duration: 2.1, delay: i * 0.16, ease: EASE_SILK }}
              >
                <Tulip
                  variant={b.color}
                  open
                  instant
                  delay={0.3 + i * 0.16}
                  className="h-auto w-full"
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* The letter. */}
      <motion.article
        className="relative z-10 w-full max-w-xl"
        variants={plateIn}
        initial="hidden"
        animate="show"
        transition={{ delay: 1.1 }}
      >
        <div className="rounded-[26px] bg-white/[0.07] p-8 backdrop-blur-2xl ring-1 ring-inset ring-white/20 shadow-[0_40px_90px_-40px_rgba(11,7,16,0.95)] md:p-11">
          <RevealText
            as="h2"
            text={gardenConfig.garden.lines}
            delay={1.5}
            stagger={0.34}
            className="space-y-2 text-center font-display text-[clamp(1.6rem,5.5vw,2.4rem)] font-light leading-[1.14] tracking-[-0.02em] text-paper-50"
          />

          <motion.span
            aria-hidden="true"
            className="mx-auto mt-8 block h-px w-28 origin-center bg-gradient-to-r from-transparent via-petal-200/70 to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.3, delay: 2.6, ease: EASE_SILK }}
          />

          <motion.div
            className="mt-8 space-y-4 font-body text-[1.06rem] leading-[1.85] text-paper-100/78"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 2.9 }}
          >
            {gardenConfig.message.paragraphs.map((para, i) => (
              <p key={i} className={i === 0 ? 'font-display text-lg text-paper-50' : undefined}>
                {para}
              </p>
            ))}

            <p className="pt-3 text-right font-display italic text-paper-100/70">
              {gardenConfig.signature}
            </p>
          </motion.div>

          <motion.div
            className="mt-10 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.1, delay: 3.6 }}
          >
            <CtaButton onClick={onContinue} variant="glass">
              One last thing
            </CtaButton>
          </motion.div>
        </div>
      </motion.article>

      <div role="status" aria-live="polite" className="sr-only">
        The whole garden is in bloom.
      </div>
    </section>
  );
}

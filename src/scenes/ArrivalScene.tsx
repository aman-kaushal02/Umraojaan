import { motion } from 'framer-motion';
import { RevealText } from '../components/RevealText';
import { CtaButton } from '../components/CtaButton';
import { Tulip } from '../components/Tulip';
import { gardenConfig } from '../data/config';
import { EASE_SILK } from '../animations/motion';

interface ArrivalSceneProps {
  onContinue: () => void;
}

/**
 * The path. Six closed buds rise from the bottom of the frame in a shallow
 * arc — the promise of what is about to open.
 */
export function ArrivalScene({ onContinue }: ArrivalSceneProps) {
  const count = gardenConfig.blooms.length;
  const middle = (count - 1) / 2;

  return (
    <section className="scene-frame">
      {/* The bed of closed buds. Centre stands tallest, the outer ones fall
          away and dim, which gives the row depth instead of a flat line. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center"
      >
        {/* The bed runs wider than a phone screen on purpose: the outer buds
            crop at the edges, which makes the row feel like part of a larger
            field rather than six icons in a line. Tulips are sized by column
            width so all six always fit. */}
        <div className="flex w-[235%] max-w-5xl items-end justify-center gap-[0.6vw] xs:w-[190%] md:w-[115%]">
          {gardenConfig.blooms.map((b, i) => {
            const fromMiddle = Math.abs(i - middle) / middle;
            const dim = 0.92 - fromMiddle * 0.34;

            return (
              <motion.div
                key={i}
                className="min-w-0 flex-1"
                initial={{ opacity: 0, y: 90 }}
                /* Outer buds sit lower, giving the row a shallow arc. */
                animate={{ opacity: dim, y: fromMiddle * 26 }}
                transition={{ duration: 2, delay: 0.35 + i * 0.13, ease: EASE_SILK }}
              >
                <Tulip
                  variant={b.color}
                  open={false}
                  delay={0.4 + i * 0.13}
                  className="h-auto w-full"
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        <motion.p
          className="font-label text-[0.6rem] uppercase tracking-wide2 text-paper-100/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.4 }}
        >
          The path
        </motion.p>

        <RevealText
          as="h2"
          text={gardenConfig.arrival.lines}
          delay={0.7}
          stagger={0.42}
          className="mt-7 space-y-3 font-display text-[clamp(2rem,7.5vw,3.4rem)] font-light leading-[1.08] tracking-[-0.025em] text-paper-50"
        />

        <motion.div
          aria-hidden="true"
          className="mt-10 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 2.2 }}
        >
          <span className="h-px w-14 bg-gradient-to-r from-transparent to-petal-200/50" />
          <span className="h-1 w-1 rounded-full bg-petal-200/80" />
          <span className="h-px w-14 bg-gradient-to-l from-transparent to-petal-200/50" />
        </motion.div>

        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 2.5, ease: EASE_SILK }}
        >
          <CtaButton onClick={onContinue} variant="glass">
            {gardenConfig.arrival.cta}
          </CtaButton>
        </motion.div>
      </div>

      <div role="status" aria-live="polite" className="sr-only">
        The path. Six tulips, still closed.
      </div>
    </section>
  );
}

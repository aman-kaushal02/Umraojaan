import { motion } from 'framer-motion';
import { cosmos } from '../../data/cosmos';
import { SplitText } from '../../components/cosmos/SplitText';
import { StarButton } from '../../components/cosmos/StarButton';

const EASE = [0.16, 1, 0.3, 1] as const;

interface Props {
  onWish: () => void;
  reducedMotion: boolean;
}

/**
 * Sits under the finished tulip. The constellation lifts and shrinks a
 * little when this arrives, so the two never fight for the same pixels.
 */
export function NamedScene({ onWish, reducedMotion }: Props) {
  const t = (delay: number, duration: number) => ({
    duration: reducedMotion ? 0.24 : duration,
    delay: reducedMotion ? 0 : delay,
    ease: EASE,
  });

  return (
    <motion.section
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[35] flex flex-col items-center"
      style={{
        paddingLeft: 'max(1.35rem, env(safe-area-inset-left))',
        paddingRight: 'max(1.35rem, env(safe-area-inset-right))',
        paddingBottom: 'max(1.75rem, calc(env(safe-area-inset-bottom) + 1.25rem))',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: 20, transition: { duration: 0.8, ease: EASE } }}
      transition={{ duration: reducedMotion ? 0.24 : 1.2 }}
    >
      {/* Scrim so the copy always has contrast, whatever the sky is doing. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[190%]"
        style={{
          background:
            'linear-gradient(to top, rgba(4,5,18,0.92) 0%, rgba(4,5,18,0.6) 38%, transparent 100%)',
        }}
      />

      <div className="pointer-events-auto flex w-full max-w-[38rem] flex-col items-center text-center">
        <motion.p
          className="font-label text-[0.55rem] uppercase tracking-[0.44em] text-star-gold/60"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={t(0.3, 1.2)}
        >
          {cosmos.named.eyebrow}
        </motion.p>

        <SplitText
          as="h2"
          text={cosmos.named.title}
          reducedMotion={reducedMotion}
          delay={0.65}
          stagger={0.035}
          duration={1.2}
          className="mt-4 font-display text-[clamp(1.6rem,6.4vw,2.9rem)] font-light leading-[1.1] text-paper-50 text-glow-cool"
        />

        <motion.p
          className="mt-4 max-w-[26rem] font-body text-[clamp(0.95rem,3.6vw,1.1rem)] italic leading-[1.8] text-paper-100/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={t(1.5, 1.6)}
        >
          {cosmos.named.line}
        </motion.p>

        <div className="mt-8">
          <StarButton onClick={onWish} delay={2.1} reducedMotion={reducedMotion}>
            {cosmos.named.cta}
          </StarButton>
        </div>
      </div>
    </motion.section>
  );
}

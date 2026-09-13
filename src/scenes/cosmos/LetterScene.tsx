import { motion } from 'framer-motion';
import { cosmos } from '../../data/cosmos';
import { SplitText } from '../../components/cosmos/SplitText';

const EASE = [0.16, 1, 0.3, 1] as const;

interface Props {
  onLookAgain: () => void;
  reducedMotion: boolean;
}

export function LetterScene({ onLookAgain, reducedMotion }: Props) {
  const t = (delay: number, duration: number) => ({
    duration: reducedMotion ? 0.24 : duration,
    delay: reducedMotion ? 0 : delay,
    ease: EASE,
  });

  const paraDelay = (i: number) => 2.3 + i * 0.85;
  const tailDelay = 2.3 + cosmos.letter.paragraphs.length * 0.85;

  return (
    <motion.section
      className="fixed inset-0 z-[36] overflow-y-auto overscroll-contain"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7 } }}
      transition={{ duration: reducedMotion ? 0.24 : 1.4, ease: EASE }}
    >
      <div
        className="mx-auto flex w-full max-w-[42rem] flex-col items-center text-center"
        style={{
          paddingLeft: 'max(1.5rem, env(safe-area-inset-left))',
          paddingRight: 'max(1.5rem, env(safe-area-inset-right))',
          paddingTop: 'max(4.5rem, calc(env(safe-area-inset-top) + 3.5rem))',
          paddingBottom: 'max(5rem, calc(env(safe-area-inset-bottom) + 4rem))',
        }}
      >
        <motion.p
          className="font-label text-[0.55rem] uppercase tracking-[0.46em] text-star-gold/55"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={t(0.5, 1.3)}
        >
          Nine days to go
        </motion.p>

        <SplitText
          as="h2"
          text={cosmos.name}
          reducedMotion={reducedMotion}
          delay={0.9}
          stagger={0.09}
          duration={1.5}
          className="title-cosmic mt-5"
        />

        <motion.p
          className="mt-3 font-body text-[clamp(0.95rem,3.6vw,1.1rem)] italic tracking-wide text-star-gold/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={t(1.7, 1.6)}
        >
          {cosmos.endearment}
        </motion.p>

        <motion.span
          aria-hidden="true"
          className="rule-cosmic mt-9"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={t(2, 1.8)}
        />

        <div className="mt-10 flex flex-col gap-7">
          {cosmos.letter.paragraphs.map((p, i) => (
            <motion.p
              key={i}
              className="font-body text-[clamp(1rem,3.9vw,1.18rem)] font-light leading-[1.95] text-paper-100/78"
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={t(paraDelay(i), 1.5)}
            >
              {p}
            </motion.p>
          ))}
        </div>

        <motion.p
          className="mt-12 font-display text-[clamp(1.2rem,4.6vw,1.7rem)] font-light leading-snug text-paper-50 text-glow-cool"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={t(tailDelay + 0.4, 1.6)}
        >
          {cosmos.letter.closing}
        </motion.p>

        <motion.p
          className="mt-6 font-body text-[0.98rem] italic tracking-wide text-paper-100/45"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={t(tailDelay + 1.1, 1.6)}
        >
          {cosmos.signature}
        </motion.p>

        <motion.button
          type="button"
          onClick={onLookAgain}
          className="mt-14 font-label text-[0.56rem] uppercase tracking-[0.4em] text-paper-100/30 transition-colors duration-500 hover:text-star-gold/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={t(tailDelay + 1.8, 1.4)}
        >
          Look at it once more
        </motion.button>
      </div>
    </motion.section>
  );
}

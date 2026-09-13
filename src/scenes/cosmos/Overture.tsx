import { motion } from 'framer-motion';
import { cosmos } from '../../data/cosmos';
import { SplitText } from '../../components/cosmos/SplitText';
import { StarButton } from '../../components/cosmos/StarButton';

const EASE = [0.16, 1, 0.3, 1] as const;

interface Props {
  onEnter: () => void;
  reducedMotion: boolean;
}

export function Overture({ onEnter, reducedMotion }: Props) {
  /* With reduced motion the whole card simply arrives, in order, at once. */
  const t = (delay: number, duration: number) => ({
    duration: reducedMotion ? 0.24 : duration,
    delay: reducedMotion ? 0 : delay,
    ease: EASE,
  });

  return (
    <motion.section
      className="scene-frame relative z-20"
      /* Drop out of the hit-testing tree the instant it starts leaving,
         or the fade swallows her first tap at a star. */
      exit={{ opacity: 0, filter: 'blur(14px)', scale: 1.04, pointerEvents: 'none' }}
      transition={{ duration: reducedMotion ? 0.3 : 1.4, ease: EASE }}
    >
      {/* A single lens flare behind the title, doing the work of a spotlight. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(180,196,255,0.14) 0%, rgba(150,120,220,0.08) 38%, transparent 68%)',
          filter: 'blur(30px)',
        }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={t(0, 3.4)}
      />

      <div className="flex w-full max-w-[46rem] flex-col items-center text-center">
        <motion.p
          className="font-label text-[0.58rem] uppercase tracking-[0.46em] text-paper-100/45"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={t(0.5, 1.3)}
        >
          {cosmos.overture.eyebrow}
        </motion.p>

        <SplitText
          as="h1"
          text={cosmos.overture.title}
          reducedMotion={reducedMotion}
          delay={0.95}
          stagger={0.07}
          duration={1.5}
          className="title-cosmic mt-9"
        />

        <motion.span
          aria-hidden="true"
          className="rule-cosmic mt-9"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={t(1.9, 1.8)}
        />

        <motion.p
          className="mt-8 font-body text-[clamp(1.05rem,4.2vw,1.4rem)] font-light leading-[1.75] text-paper-100/80"
          initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={t(2.1, 1.6)}
        >
          {cosmos.overture.subtitle}
        </motion.p>

        <motion.p
          className="mt-5 max-w-[32rem] font-body text-[clamp(0.92rem,3.5vw,1.05rem)] italic leading-[1.85] text-paper-100/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={t(2.6, 1.8)}
        >
          {cosmos.overture.line}
        </motion.p>

        <div className="mt-12">
          <StarButton onClick={onEnter} delay={3.1} reducedMotion={reducedMotion}>
            {cosmos.overture.cta}
          </StarButton>
        </div>

        <motion.p
          className="mt-7 font-label text-[0.55rem] uppercase tracking-[0.4em] text-paper-100/25"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={t(3.9, 1.4)}
        >
          {cosmos.overture.hint}
        </motion.p>
      </div>
    </motion.section>
  );
}

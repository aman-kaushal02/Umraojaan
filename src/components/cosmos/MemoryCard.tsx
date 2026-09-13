import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { StarMemory } from '../../data/cosmos';

/* ------------------------------------------------------------------ *
 * What a star opens into.
 *
 * The layout is deliberately a flex column with three fixed roles —
 * plate, body, footer — where only the body scrolls. On a small phone
 * the photo caps out at 38vh and the action never leaves the bottom of
 * the card, so nothing can end up sitting on top of the writing.
 * ------------------------------------------------------------------ */

interface Props {
  memory: StarMemory;
  index: number;
  total: number;
  isLast: boolean;
  reducedMotion: boolean;
  onClose: () => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function MemoryCard({ memory, index, total, isLast, reducedMotion, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const t = (delay: number, duration: number) => ({
    duration: reducedMotion ? 0.22 : duration,
    delay: reducedMotion ? 0 : delay,
    ease: EASE,
  });

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
        paddingTop: 'max(1rem, calc(env(safe-area-inset-top) + 0.5rem))',
        paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeOut' } }}
    >
      {/* Backdrop — the sky stays visible, just pushed far back. */}
      <motion.button
        type="button"
        aria-label="Close this memory"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
        exit={{ opacity: 0 }}
        transition={{ duration: reducedMotion ? 0.2 : 0.7 }}
        style={{
          background:
            'radial-gradient(120% 90% at 50% 45%, rgba(6,8,26,0.62), rgba(3,4,14,0.9))',
        }}
      />

      <motion.article
        role="dialog"
        aria-modal="true"
        aria-label={memory.title}
        className="memory-card relative flex w-full flex-col overflow-hidden md:flex-row"
        style={{ maxHeight: 'calc(var(--app-height) - 2rem)' }}
        initial={{ opacity: 0, y: 34, scale: 0.955, filter: 'blur(14px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        exit={{
          opacity: 0,
          y: 18,
          scale: 0.975,
          filter: 'blur(8px)',
          transition: { duration: 0.4 },
        }}
        transition={t(0, 1)}
      >
        {/* ---------------- plate ---------------- */}
        <div className="memory-card__plate">
          {/* The photo itself is shown whole, never cropped. These are tall
              9:16 portraits, so a contained photo always leaves space around
              it — filled with a blurred, dimmed copy of the same image rather
              than dead letterbox bars. */}
          <img
            src={memory.photo}
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            className="memory-card__fill"
          />
          <motion.img
            src={memory.photo}
            alt=""
            loading="eager"
            decoding="async"
            className="memory-card__photo"
            initial={{ scale: 1.06, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              opacity: { duration: reducedMotion ? 0.2 : 1.2 },
              scale: { duration: reducedMotion ? 0.2 : 16, ease: 'linear' },
            }}
          />
          <span className="memory-card__leak" aria-hidden="true" />
          {!reducedMotion && (
            <motion.span
              className="memory-card__glint"
              aria-hidden="true"
              initial={{ x: '-160%', opacity: 0 }}
              animate={{ x: '380%', opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.1, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
            />
          )}
          <span className="memory-card__numeral" aria-hidden="true">
            {memory.numeral}
          </span>
        </div>

        {/* ---------------- body ---------------- */}
        <div className="memory-card__side">
          <div className="memory-card__body">
            <motion.p
              className="font-label text-[0.6rem] uppercase tracking-[0.4em] text-star-gold/70"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={t(0.35, 0.9)}
            >
              {memory.label}
            </motion.p>

            <motion.h2
              className="mt-3 font-display text-[clamp(1.5rem,5.2vw,2.35rem)] font-light leading-[1.12] text-paper-50"
              initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={t(0.5, 1.1)}
            >
              {memory.title}
            </motion.h2>

            <motion.span
              className="memory-card__rule"
              aria-hidden="true"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={t(0.75, 1.2)}
            />

            <motion.p
              className="mt-5 font-body text-[clamp(1rem,3.9vw,1.16rem)] leading-[1.85] text-paper-100/85"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={t(0.85, 1.1)}
            >
              {memory.note}
            </motion.p>
          </div>

          {/* ---------------- footer ---------------- */}
          <motion.div
            className="memory-card__footer"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={t(1.05, 0.9)}
          >
            <span className="font-label text-[0.58rem] uppercase tracking-[0.32em] text-paper-100/40">
              {index + 1} / {total}
            </span>
            <button type="button" onClick={onClose} className="cta-quiet">
              <span>{isLast ? 'Step back and look' : 'Back to the sky'}</span>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 12h13m0 0-5-5m5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </motion.div>
        </div>
      </motion.article>
    </motion.div>
  );
}

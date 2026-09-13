import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const EASE = [0.16, 1, 0.3, 1] as const;

interface Props {
  children: ReactNode;
  onClick: () => void;
  delay?: number;
  reducedMotion?: boolean;
}

/**
 * The one button in the piece. A slowly rotating conic ring sits behind a
 * glass pill; on hover the ring speeds up and a specular sweep crosses
 * the face. Everything is transform and opacity, so it stays cheap.
 */
export function StarButton({ children, onClick, delay = 0, reducedMotion = false }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="star-button group"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0.01 : 1, delay: reducedMotion ? 0 : delay, ease: EASE }}
      whileHover={reducedMotion ? undefined : { y: -2 }}
      whileTap={reducedMotion ? undefined : { scale: 0.985 }}
    >
      <span className="star-button__ring" aria-hidden="true" />
      <span className="star-button__face">
        <span className="star-button__sweep" aria-hidden="true" />
        <span className="star-button__label">{children}</span>
        <svg className="star-button__arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 12h13m0 0-5-5m5 5-5 5"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </motion.button>
  );
}

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const EASE = [0.16, 1, 0.3, 1] as const;

interface Props {
  text: string;
  className?: string;
  delay?: number;
  /** Seconds between characters. */
  stagger?: number;
  duration?: number;
  reducedMotion?: boolean;
  as?: 'h1' | 'h2' | 'p' | 'span';
}

/**
 * Per-character reveal that keeps words unbreakable, so a long title
 * still wraps like real typography instead of falling apart mid-word.
 */
export function SplitText({
  text,
  className = '',
  delay = 0,
  stagger = 0.045,
  duration = 1.1,
  reducedMotion = false,
  as = 'span',
}: Props) {
  const Tag = motion[as];
  const words = text.split(' ');
  let charIndex = 0;

  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, w) => {
        const chars: ReactNode[] = Array.from(word).map((ch) => {
          const i = charIndex++;
          return (
            <motion.span
              key={`${w}-${i}`}
              aria-hidden="true"
              className="inline-block will-change-transform"
              initial={{ opacity: 0, y: '0.42em', filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: '0em', filter: 'blur(0px)' }}
              transition={{
                duration: reducedMotion ? 0.01 : duration,
                delay: reducedMotion ? 0 : delay + i * stagger,
                ease: EASE,
              }}
            >
              {ch}
            </motion.span>
          );
        });
        return (
          <span key={w} className="inline-block whitespace-nowrap">
            {chars}
            {w < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        );
      })}
    </Tag>
  );
}

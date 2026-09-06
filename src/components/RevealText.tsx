import { motion, type Variants } from 'framer-motion';
import { type ElementType, useMemo } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { EASE_SILK } from '../animations/motion';

interface RevealTextProps {
  text: string | string[];
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  /** Play on mount, or wait until scrolled into view. */
  trigger?: 'mount' | 'inView';
}

/**
 * Editorial line reveal: each line rides up from behind its own mask.
 *
 * This is the reveal used on high-end type — it reads as one confident
 * movement rather than a shower of individually blurred words. The full
 * sentence is exposed via aria-label; the masked spans are hidden from
 * assistive tech.
 */
export function RevealText({
  text,
  as = 'p',
  className = '',
  lineClassName = '',
  delay = 0,
  stagger = 0.09,
  trigger = 'mount',
}: RevealTextProps) {
  const reducedMotion = usePrefersReducedMotion();
  const Wrapper = motion[as as 'p'] ?? motion.p;

  const lines = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);
  const label = lines.join(' ');

  const container: Variants = {
    hidden: {},
    show: {
      transition: reducedMotion
        ? { staggerChildren: 0, delayChildren: 0 }
        : { staggerChildren: stagger, delayChildren: delay },
    },
  };

  const line: Variants = reducedMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.3 } } }
    : {
        hidden: { y: '115%', opacity: 0, rotate: 1.5 },
        show: {
          y: '0%',
          opacity: 1,
          rotate: 0,
          transition: { duration: 1.25, ease: EASE_SILK },
        },
      };

  const viewProps =
    trigger === 'inView'
      ? ({ whileInView: 'show', viewport: { once: true, amount: 0.4 } } as const)
      : ({ animate: 'show' } as const);

  return (
    <Wrapper
      className={className}
      aria-label={label}
      initial="hidden"
      variants={container}
      {...viewProps}
    >
      {lines.map((l, i) => (
        <span
          key={`${i}-${l.slice(0, 10)}`}
          aria-hidden="true"
          className="block overflow-hidden"
          style={{ paddingBottom: '0.08em' }}
        >
          <motion.span variants={line} className={`block will-change-transform ${lineClassName}`}>
            {l}
          </motion.span>
        </span>
      ))}
    </Wrapper>
  );
}

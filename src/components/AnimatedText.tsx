import { useMemo, type CSSProperties } from 'react';
import { motion, type Variants } from 'framer-motion';
import { EASE_SILK } from '@/animations/motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

type Tag = 'p' | 'h1' | 'h2' | 'h3' | 'div' | 'span' | 'blockquote';

const MOTION_TAGS = {
  p: motion.p,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  div: motion.div,
  span: motion.span,
  blockquote: motion.blockquote,
} as const;

interface AnimatedTextProps {
  /** A single string, or several strings rendered as separate lines. */
  text: string | string[];
  /** Granularity of the reveal. */
  mode?: 'lines' | 'words' | 'chars';
  as?: Tag;
  className?: string;
  style?: CSSProperties;
  /** Applied to each line wrapper when `text` is an array. */
  lineClassName?: string;
  /** Seconds before the first fragment appears. */
  delay?: number;
  /** Seconds between fragments. */
  stagger?: number;
  /** Distance in px each fragment travels. */
  distance?: number;
  /** Play immediately (default) or wait until scrolled into view. */
  trigger?: 'mount' | 'inView';
  onComplete?: () => void;
}

/**
 * Text that arrives instead of appearing.
 *
 * Fragments are `aria-hidden` and the full sentence is exposed through
 * `aria-label`, so assistive tech reads natural prose rather than a
 * stream of disconnected words.
 */
export function AnimatedText({
  text,
  mode = 'words',
  as = 'p',
  className = '',
  style,
  lineClassName = '',
  delay = 0,
  stagger,
  distance = 14,
  trigger = 'mount',
  onComplete,
}: AnimatedTextProps) {
  const reducedMotion = usePrefersReducedMotion();
  const Wrapper = MOTION_TAGS[as];

  const lines = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);
  const label = lines.join(' ');

  const step =
    stagger ?? (mode === 'chars' ? 0.045 : mode === 'words' ? 0.055 : 0.55);

  const parentVariants: Variants = {
    hidden: {},
    show: {
      transition: reducedMotion
        ? { staggerChildren: 0, delayChildren: 0 }
        : { staggerChildren: step, delayChildren: delay },
    },
  };

  const childVariants: Variants = reducedMotion
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.25 } },
      }
    : {
        hidden: { opacity: 0, y: distance, filter: 'blur(8px)' },
        show: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: {
            duration: mode === 'lines' ? 1.15 : 0.9,
            ease: EASE_SILK,
          },
        },
      };

  const fragmentsFor = (line: string) => {
    if (mode === 'lines') return [line];
    if (mode === 'chars') return Array.from(line);
    return line.split(' ');
  };

  const inViewProps =
    trigger === 'inView'
      ? ({ whileInView: 'show', viewport: { once: true, amount: 0.35 } } as const)
      : ({ animate: 'show' } as const);

  return (
    <Wrapper
      className={className}
      style={style}
      aria-label={label}
      initial="hidden"
      variants={parentVariants}
      onAnimationComplete={onComplete}
      {...inViewProps}
    >
      {lines.map((line, lineIndex) => (
        <span
          key={`${lineIndex}-${line.slice(0, 12)}`}
          className={`block ${lineClassName}`}
          aria-hidden="true"
        >
          {fragmentsFor(line).map((fragment, fragmentIndex) => (
            <motion.span
              key={`${lineIndex}-${fragmentIndex}`}
              variants={childVariants}
              className="inline-block will-change-transform"
              style={{ whiteSpace: mode === 'chars' ? 'pre' : undefined }}
            >
              {fragment}
              {mode === 'words' ? '\u00A0' : null}
            </motion.span>
          ))}
        </span>
      ))}
    </Wrapper>
  );
}

export default AnimatedText;

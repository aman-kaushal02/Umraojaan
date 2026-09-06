import { useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { textRevealVariants } from '../animations/motion';

type Tag = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'span';

const MotionTags = {
  p: motion.p,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  div: motion.div,
  span: motion.span,
} as const;

interface AnimatedTextProps {
  text: string | string[];
  as?: Tag;
  className?: string;
  staggerDelay?: number;
  delay?: number;
  mode?: 'words' | 'chars';
}

export function AnimatedText({
  text,
  as = 'p',
  className = '',
  staggerDelay = 0.04,
  delay = 0,
  mode = 'words',
}: AnimatedTextProps) {
  const reducedMotion = usePrefersReducedMotion();
  const Component = MotionTags[as];

  const lines = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);
  const label = lines.join(' ');

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: reducedMotion
        ? { staggerChildren: 0, delayChildren: 0 }
        : { staggerChildren: staggerDelay, delayChildren: delay },
    },
  };

  const fragmentsFor = (line: string) => {
    if (mode === 'chars') return Array.from(line);
    return line.split(' ');
  };

  return (
    <Component
      className={className}
      aria-label={label}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {lines.map((line, lineIndex) => (
        <span
          key={`${lineIndex}-${line.slice(0, 12)}`}
          className="block"
          aria-hidden="true"
        >
          {fragmentsFor(line).map((fragment, fragmentIndex) => (
            <motion.span
              key={`${lineIndex}-${fragmentIndex}`}
              variants={reducedMotion ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : textRevealVariants}
              className="inline-block will-change-transform"
              style={{ whiteSpace: mode === 'chars' ? 'pre' : undefined }}
            >
              {fragment}
              {mode === 'words' ? '\u00A0' : null}
            </motion.span>
          ))}
        </span>
      ))}
    </Component>
  );
}

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

type Variant = 'primary' | 'secondary';

interface CtaButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'text-white bg-gradient-to-b from-pink-400 to-rose-500 shadow-lg shadow-pink-500/30 ' +
    'hover:shadow-xl hover:shadow-pink-500/40',
  secondary:
    'text-gray-700 bg-white/90 backdrop-blur-sm shadow-md ' +
    'hover:bg-white hover:shadow-lg',
};

export function CtaButton({
  children,
  onClick,
  variant = 'primary',
  className = '',
  ariaLabel,
  disabled = false,
}: CtaButtonProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileHover={reducedMotion || disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={[
        'relative inline-flex items-center justify-center',
        'px-8 py-3.5 rounded-full font-medium text-sm tracking-wide',
        'transition-all duration-300 no-select',
        'disabled:opacity-50 disabled:pointer-events-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2',
        VARIANTS[variant],
        className,
      ].join(' ')}
    >
      <span className="relative">{children}</span>
    </motion.button>
  );
}

export default CtaButton;

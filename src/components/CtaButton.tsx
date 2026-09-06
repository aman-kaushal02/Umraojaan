import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { buttonVariants } from '../animations/motion';
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

const variants = {
  primary: {
    base: 'text-white bg-gradient-to-br from-pink-400 via-rose-400 to-pink-500 shadow-xl shadow-pink-500/40',
    hover: 'hover:shadow-2xl hover:shadow-pink-500/50',
  },
  secondary: {
    base: 'text-white glass-panel',
    hover: 'hover:bg-white/15',
  },
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
  const style = variants[variant];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      variants={reducedMotion ? undefined : buttonVariants}
      initial="initial"
      whileHover={disabled ? undefined : "hover"}
      whileTap={disabled ? undefined : "tap"}
      className={[
        'relative inline-flex items-center justify-center overflow-hidden',
        'px-10 py-4 md:px-12 md:py-5 rounded-full',
        'font-light text-base md:text-lg tracking-wider uppercase',
        'transition-all duration-500 no-select',
        'disabled:opacity-50 disabled:pointer-events-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
        style.base,
        style.hover,
        className,
      ].join(' ')}
    >
      {/* Shimmer effect on hover */}
      {variant === 'primary' && !disabled && (
        <motion.div
          className="absolute inset-0 opacity-0"
          initial={{ x: '-100%', opacity: 0 }}
          whileHover={{ x: '100%', opacity: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
          }}
        />
      )}

      <span className="relative z-10">{children}</span>

      {/* Glow pulse for primary */}
      {variant === 'primary' && !disabled && (
        <span
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            boxShadow: '0 0 40px rgba(255, 182, 193, 0.6)',
          }}
        />
      )}
    </motion.button>
  );
}

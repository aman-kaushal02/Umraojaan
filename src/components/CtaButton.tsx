import { useCallback, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useHasFinePointer } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

type Variant = 'gold' | 'outline' | 'quiet';

interface CtaButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  /** Rendered to the right of the label. */
  icon?: ReactNode;
  className?: string;
  /** Overrides the accessible name when the label alone isn't descriptive. */
  ariaLabel?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  gold:
    'text-ink-900 bg-gradient-to-b from-champagne-200 via-champagne-300 to-champagne-500 ' +
    'shadow-[0_10px_30px_-12px_rgba(224,190,134,0.7)]',
  outline:
    'text-ivory-50 border border-champagne-300/60 bg-ink-900/35 backdrop-blur-md ' +
    'shadow-[inset_0_1px_0_rgba(247,231,201,0.14)] hover:border-champagne-200 hover:bg-ink-900/55',
  quiet: 'text-blush-200/85 hover:text-ivory-50 underline decoration-blush-300/30 decoration-1 underline-offset-[6px]',
};

/**
 * The one button style used across the whole experience.
 *
 * Works with mouse, touch and keyboard: the magnetic drift is a pointer-only
 * flourish layered on top of a completely ordinary <button>.
 */
export function CtaButton({
  children,
  onClick,
  variant = 'gold',
  icon,
  className = '',
  ariaLabel,
  disabled = false,
  autoFocus = false,
}: CtaButtonProps) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const finePointer = useHasFinePointer();
  const reducedMotion = usePrefersReducedMotion();
  const magnetic = finePointer && !reducedMotion && !disabled;

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!magnetic) return;
      const node = ref.current;
      if (!node) return;

      const rect = node.getBoundingClientRect();
      const dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
      const dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;

      node.style.setProperty('--mx', `${(dx * 10).toFixed(2)}px`);
      node.style.setProperty('--my', `${(dy * 7).toFixed(2)}px`);
      node.style.setProperty('--gx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    },
    [magnetic],
  );

  const reset = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty('--mx', '0px');
    node.style.setProperty('--my', '0px');
  }, []);

  const isQuiet = variant === 'quiet';

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      disabled={disabled}
      autoFocus={autoFocus}
      aria-label={ariaLabel}
      whileHover={reducedMotion || disabled ? undefined : { scale: isQuiet ? 1 : 1.035 }}
      whileTap={disabled ? undefined : { scale: isQuiet ? 0.99 : 0.965 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className={[
        'group relative isolate inline-flex items-center justify-center gap-2.5',
        'font-sans uppercase no-select',
        isQuiet
          ? 'text-[0.68rem] tracking-[0.28em] px-2 py-2'
          : 'text-[0.7rem] xs:text-xs tracking-[0.3em] px-7 py-4 xs:px-9 rounded-full',
        'transition-colors duration-500 ease-silk',
        'disabled:opacity-40 disabled:pointer-events-none',
        VARIANTS[variant],
        className,
      ].join(' ')}
      style={{
        transform: magnetic ? 'translate3d(var(--mx, 0px), var(--my, 0px), 0)' : undefined,
        transition: 'transform 350ms cubic-bezier(0.22, 1, 0.36, 1), color 500ms',
      }}
    >
      {/* Breathing halo */}
      {!isQuiet && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-[3px] -z-10 rounded-full bg-champagne-300/25 blur-lg animate-breathe motion-reduce:animate-none"
        />
      )}

      {/* Cursor-tracked sheen */}
      {variant === 'gold' && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-[5] overflow-hidden rounded-full"
        >
          <span
            className="absolute inset-y-0 w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-white/55 to-transparent
                       transition-transform duration-700 ease-silk group-hover:translate-x-[150%] group-focus-visible:translate-x-[150%]"
          />
        </span>
      )}

      {/* Expanding ring on the outline variant */}
      {variant === 'outline' && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 rounded-full border border-champagne-300/30 animate-pulse-ring motion-reduce:animate-none"
        />
      )}

      <span className="relative">{children}</span>
      {icon ? (
        <span
          aria-hidden="true"
          className="relative transition-transform duration-500 ease-silk group-hover:translate-x-1 group-focus-visible:translate-x-1"
        >
          {icon}
        </span>
      ) : null}
    </motion.button>
  );
}

export default CtaButton;

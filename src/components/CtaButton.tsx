import { useCallback, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useHasFinePointer } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

type Variant = 'lamp' | 'housing' | 'quiet';

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
  /* A lit control on the projector housing. */
  lamp:
    'text-theatre-950 bg-gradient-to-b from-beam-100 via-lamp-300 to-lamp-500 ' +
    'shadow-[0_10px_30px_-12px_rgba(227,185,114,0.75)]',
  /* Engraved brass, unlit. */
  housing:
    'text-beam-100 border border-brass-400/50 bg-theatre-900/50 backdrop-blur-md ' +
    'shadow-[inset_0_1px_0_rgba(231,211,173,0.14)] hover:border-brass-300 hover:bg-theatre-800/70',
  quiet:
    'text-beam-200/80 hover:text-beam-50 underline decoration-brass-400/40 decoration-1 underline-offset-[6px]',
};

/**
 * The one control style in the projection booth.
 *
 * Works with mouse, touch and keyboard: the magnetic drift is a pointer-only
 * flourish layered on top of a completely ordinary <button>.
 */
export function CtaButton({
  children,
  onClick,
  variant = 'lamp',
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

      node.style.setProperty('--mx', `${(dx * 9).toFixed(2)}px`);
      node.style.setProperty('--my', `${(dy * 6).toFixed(2)}px`);
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
      whileHover={reducedMotion || disabled ? undefined : { scale: isQuiet ? 1 : 1.03 }}
      whileTap={disabled ? undefined : { scale: isQuiet ? 0.99 : 0.965 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className={[
        'group relative isolate inline-flex items-center justify-center gap-2.5',
        'font-label uppercase no-select',
        isQuiet
          ? 'text-[0.66rem] tracking-slate px-2 py-2'
          : 'text-[0.68rem] xs:text-[0.74rem] tracking-slate px-7 py-4 xs:px-9 rounded-[2px]',
        'transition-colors duration-500 ease-gate',
        'disabled:opacity-40 disabled:pointer-events-none',
        VARIANTS[variant],
        className,
      ].join(' ')}
      style={{
        transform: magnetic ? 'translate3d(var(--mx, 0px), var(--my, 0px), 0)' : undefined,
        transition: 'transform 350ms cubic-bezier(0.22, 1, 0.36, 1), color 500ms',
      }}
    >
      {/* Lamp halo */}
      {!isQuiet && (
        <span
          aria-hidden="true"
          className={[
            'pointer-events-none absolute -inset-[3px] -z-10 rounded-[3px] blur-lg',
            variant === 'lamp' ? 'bg-lamp-300/30' : 'bg-brass-400/12',
            reducedMotion ? '' : 'animate-beam-breathe',
          ].join(' ')}
        />
      )}

      {/* A pass of light across the control */}
      {variant === 'lamp' && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-[5] overflow-hidden rounded-[2px]"
        >
          <span
            className="absolute inset-y-0 w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent
                       transition-transform duration-700 ease-gate group-hover:translate-x-[150%] group-focus-visible:translate-x-[150%]"
          />
        </span>
      )}

      {/* Corner ticks, like a frame marker */}
      {variant === 'housing' && (
        <>
          <span aria-hidden="true" className="absolute left-0 top-0 h-2 w-2 border-l border-t border-brass-300/70" />
          <span aria-hidden="true" className="absolute right-0 top-0 h-2 w-2 border-r border-t border-brass-300/70" />
          <span aria-hidden="true" className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-brass-300/70" />
          <span aria-hidden="true" className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-brass-300/70" />
        </>
      )}

      <span className="relative">{children}</span>
      {icon ? (
        <span
          aria-hidden="true"
          className="relative transition-transform duration-500 ease-gate group-hover:translate-x-1 group-focus-visible:translate-x-1"
        >
          {icon}
        </span>
      ) : null}
    </motion.button>
  );
}

export default CtaButton;

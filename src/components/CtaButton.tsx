import { useCallback, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { control } from '../animations/motion';
import { useHasFinePointer } from '../hooks/useMediaQuery';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

type Variant = 'bloom' | 'glass' | 'quiet';

interface CtaButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

const SKIN: Record<Variant, string> = {
  /* Warm, lit, the primary invitation. */
  bloom:
    'text-loam-950 bg-gradient-to-b from-petal-100 via-petal-200 to-petal-300 ' +
    'shadow-[0_14px_40px_-16px_rgba(234,111,140,0.85)]',
  /* Frosted, for secondary moves. */
  glass:
    'text-paper-50 bg-white/[0.07] backdrop-blur-xl ring-1 ring-inset ring-white/20 ' +
    'shadow-[0_16px_40px_-24px_rgba(0,0,0,0.9)] hover:bg-white/[0.12]',
  quiet: 'text-paper-100/70 hover:text-paper-50',
};

/**
 * The one control in the garden.
 *
 * A plain <button> underneath — the magnetic drift and the light that sweeps
 * across it are pointer-only flourishes, so touch and keyboard get the same
 * button without any of the cost.
 */
export function CtaButton({
  children,
  onClick,
  variant = 'bloom',
  className = '',
  ariaLabel,
  disabled = false,
}: CtaButtonProps) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const finePointer = useHasFinePointer();
  const reducedMotion = usePrefersReducedMotion();
  const magnetic = finePointer && !reducedMotion && !disabled;
  const isQuiet = variant === 'quiet';

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!magnetic) return;
      const node = ref.current;
      if (!node) return;
      const r = node.getBoundingClientRect();
      const dx = (event.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (event.clientY - (r.top + r.height / 2)) / r.height;
      node.style.setProperty('--mx', `${(dx * 7).toFixed(2)}px`);
      node.style.setProperty('--my', `${(dy * 5).toFixed(2)}px`);
    },
    [magnetic],
  );

  const reset = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty('--mx', '0px');
    node.style.setProperty('--my', '0px');
  }, []);

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      disabled={disabled}
      aria-label={ariaLabel}
      variants={reducedMotion ? undefined : control}
      initial="rest"
      whileHover={disabled ? undefined : 'hover'}
      whileTap={disabled ? undefined : 'press'}
      className={[
        'group relative isolate inline-flex items-center justify-center gap-3 overflow-hidden no-select',
        'font-label uppercase',
        isQuiet
          ? 'text-[0.62rem] tracking-wide2 px-3 py-3'
          : 'rounded-full px-9 py-4 text-[0.68rem] tracking-label xs:px-11 xs:text-[0.72rem]',
        'transition-colors duration-500',
        'disabled:pointer-events-none disabled:opacity-40',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-petal-200 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
        SKIN[variant],
        className,
      ].join(' ')}
      style={{
        transform: magnetic ? 'translate3d(var(--mx,0px), var(--my,0px), 0)' : undefined,
        transition: 'transform 420ms cubic-bezier(0.16,1,0.3,1), color 500ms',
      }}
    >
      {/* Halo under the primary control. */}
      {variant === 'bloom' && (
        <span
          aria-hidden="true"
          className={[
            'pointer-events-none absolute -inset-1 -z-10 rounded-full bg-petal-300/35 blur-xl',
            reducedMotion ? '' : 'animate-glow-soft',
          ].join(' ')}
        />
      )}

      {/* Light sweeping across on hover. */}
      {!isQuiet && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-[5] overflow-hidden rounded-full">
          <span className="absolute inset-y-0 -left-full w-2/3 bg-gradient-to-r from-transparent via-white/55 to-transparent transition-transform duration-[900ms] ease-silk group-hover:translate-x-[260%] group-focus-visible:translate-x-[260%]" />
        </span>
      )}

      <span className="relative">{children}</span>

      {!isQuiet && (
        <span
          aria-hidden="true"
          className="relative transition-transform duration-500 ease-silk group-hover:translate-x-1 group-focus-visible:translate-x-1"
        >
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h13M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </motion.button>
  );
}

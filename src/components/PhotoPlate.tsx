import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePointerTilt } from '../hooks/usePointerTilt';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { EASE_SILK } from '../animations/motion';

interface PhotoPlateProps {
  src?: string;
  alt: string;
  /** Small monospaced index, e.g. "01 / 06". */
  index?: string;
  priority?: boolean;
}

/**
 * A photograph presented like a gallery print: deep mat, hairline rim, and a
 * masked reveal that wipes the image open from the bottom rather than fading
 * it in. Tilts gently toward the pointer on desktop.
 *
 * A missing or broken file resolves to a quiet empty plate, so one absent
 * photograph never leaves a broken-image icon in the middle of the garden.
 */
export function PhotoPlate({ src, alt, index, priority = false }: PhotoPlateProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>(src ? 'loading' : 'failed');
  const reducedMotion = usePrefersReducedMotion();
  const tiltRef = usePointerTilt<HTMLDivElement>({ max: 6, shift: 7, ease: 0.07 });

  return (
    <div ref={tiltRef} className="w-full [transform-style:preserve-3d]">
      <div className="relative rounded-[10px] bg-gradient-to-b from-paper-100 to-paper-200 p-2.5 shadow-plate">
        <div className="relative overflow-hidden rounded-[6px] bg-loam-900 ring-1 ring-inset ring-loam-950/25">
          <div className="relative aspect-[4/5] w-full">
            {status !== 'failed' && (
              <>
                {/* The print coming up in the developer. */}
                <motion.img
                  src={src}
                  alt={alt}
                  loading={priority ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable={false}
                  onLoad={() => setStatus('ready')}
                  onError={() => setStatus('failed')}
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={
                    reducedMotion
                      ? { opacity: 0 }
                      : { clipPath: 'inset(0% 0% 100% 0%)', scale: 1.14, opacity: 0 }
                  }
                  animate={
                    status === 'ready'
                      ? reducedMotion
                        ? { opacity: 1 }
                        : { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, opacity: 1 }
                      : undefined
                  }
                  transition={{
                    clipPath: { duration: 1.5, ease: EASE_SILK },
                    scale: { duration: 2.4, ease: EASE_SILK },
                    opacity: { duration: 0.6 },
                  }}
                />

                {/* Sheen raking across the print. */}
                {!reducedMotion && status === 'ready' && (
                  <motion.div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(104deg, transparent 34%, rgba(255,255,255,0.32) 50%, transparent 66%)',
                    }}
                    initial={{ x: '-120%' }}
                    animate={{ x: '120%' }}
                    transition={{ duration: 1.7, ease: EASE_SILK, delay: 0.85 }}
                  />
                )}
              </>
            )}

            {status === 'loading' && (
              <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-loam-700/60" />
            )}

            {status === 'failed' && (
              <div
                role="img"
                aria-label={alt}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-loam-800"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8 text-petal-200/40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                >
                  <path d="M12 21c0-5 3-7 3-11a3 3 0 0 0-6 0c0 4 3 6 3 11Z" />
                </svg>
                <span className="font-label text-[0.6rem] uppercase tracking-label text-petal-200/40">
                  photograph missing
                </span>
              </div>
            )}

            {/* Depth: darkened corners so the print doesn't look pasted on. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(110% 90% at 50% 35%, transparent 52%, rgba(11,7,16,0.34) 100%)',
              }}
            />
          </div>
        </div>

        {/* Index, engraved into the mat. */}
        {index && (
          <div className="flex items-center justify-between px-1.5 pb-0.5 pt-2.5">
            <span className="font-label text-[0.58rem] uppercase tracking-wide2 text-loam-900/45">
              {index}
            </span>
            <span aria-hidden="true" className="h-px w-10 bg-loam-900/15" />
          </div>
        )}
      </div>
    </div>
  );
}

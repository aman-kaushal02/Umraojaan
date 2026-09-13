import { motion } from 'framer-motion';

/* ------------------------------------------------------------------ *
 * Everything between the sky and her eye: airglow on the horizon, a
 * slow aurora, the vignette that keeps the frame from feeling flat, and
 * a static grain plate so none of the gradients read as vector-clean.
 * ------------------------------------------------------------------ */

interface Props {
  /** Rises through the story — the sky gets warmer towards the finale. */
  warmth?: number;
  reducedMotion?: boolean;
}

export function Atmosphere({ warmth = 0, reducedMotion = false }: Props) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[44]">
      {/* Aurora — two slow, offset ribbons low in the frame. */}
      <motion.div
        className="absolute inset-x-[-20%] bottom-[-14%] h-[52%]"
        style={{
          background:
            'radial-gradient(58% 100% at 22% 100%, rgba(95,199,180,0.16), transparent 70%),' +
            'radial-gradient(52% 100% at 74% 100%, rgba(112,140,255,0.14), transparent 72%)',
          filter: 'blur(28px)',
        }}
        animate={
          reducedMotion
            ? undefined
            : { opacity: [0.5, 0.9, 0.6, 0.85, 0.5], x: ['-2%', '3%', '-1%', '2%', '-2%'] }
        }
        transition={{ duration: 34, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Airglow: the band of light the atmosphere itself gives off. */}
      <div
        className="absolute inset-x-0 bottom-0 h-[34%]"
        style={{
          background:
            'linear-gradient(to top, rgba(24,20,58,0.72) 0%, rgba(20,18,50,0.34) 42%, transparent 100%)',
        }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[16%]"
        style={{
          background:
            'linear-gradient(to top, rgba(255,196,150,0.1), rgba(180,140,255,0.05) 55%, transparent)',
        }}
        animate={{ opacity: 0.55 + warmth * 0.45 }}
        transition={{ duration: 2.4, ease: 'easeOut' }}
      />

      {/* Warmth that only arrives at the end. */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 70% at 50% 78%, rgba(255,186,140,0.14), transparent 68%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: warmth }}
        transition={{ duration: 3.2, ease: 'easeOut' }}
      />

      {/* Vignette. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(124% 96% at 50% 44%, transparent 38%, rgba(3,4,14,0.5) 78%, rgba(2,3,10,0.78) 100%)',
        }}
      />

      {/* Grain. Static turbulence — free per frame, and it kills the CGI sheen. */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.05] mix-blend-soft-light">
        <filter id="cosmos-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.86" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#cosmos-grain)" />
      </svg>
    </div>
  );
}

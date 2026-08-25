import { AnimatePresence, motion } from 'framer-motion';
import { useExperience } from '@/hooks/useExperience';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { EASE_SILK } from '@/animations/motion';

/* Fine film grain, inlined so there is no extra request. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

/**
 * The room the story happens in: scene lighting, light leaks, vignette, grain.
 *
 * Each scene declares a three-stop ambience and the layers cross-dissolve, so
 * moving between chapters feels like a lighting change rather than a page swap.
 */
export function AmbientStage() {
  const { scene, mood } = useExperience();
  const reducedMotion = usePrefersReducedMotion();
  const [core, mid, outer] = mood.ambient;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Base wash, so a cross-fade never shows through to white */}
      <div className="absolute inset-0 bg-ink-950" />

      {/* Scene lighting — cross-dissolved */}
      <AnimatePresence initial={false}>
        <motion.div
          key={scene}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.25 : 1.5, ease: EASE_SILK }}
          style={{
            background: `radial-gradient(120% 90% at 50% 38%, ${core} 0%, ${mid} 46%, ${outer} 100%)`,
          }}
        />
      </AnimatePresence>

      {/* Central bloom that swells with the emotional intensity of the scene */}
      <motion.div
        className="absolute left-1/2 top-[38%] h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        animate={{ opacity: mood.glow * 0.5, scale: 0.9 + mood.glow * 0.35 }}
        transition={{ duration: reducedMotion ? 0.25 : 1.8, ease: EASE_SILK }}
        style={{
          background:
            'radial-gradient(circle, rgba(247,231,201,0.30) 0%, rgba(238,191,200,0.14) 42%, rgba(0,0,0,0) 72%)',
          filter: 'blur(24px)',
        }}
      />

      {/* Slow light leaks — transform/opacity only, so they stay on the GPU */}
      {!reducedMotion && (
        <>
          <div
            className="absolute -left-[18vmax] top-[8vh] h-[52vmax] w-[52vmax] rounded-full opacity-40 animate-drift-slow"
            style={{
              background:
                'radial-gradient(circle, rgba(173,91,107,0.34) 0%, rgba(0,0,0,0) 68%)',
              filter: 'blur(52px)',
            }}
          />
          <div
            className="absolute -right-[16vmax] bottom-[4vh] h-[46vmax] w-[46vmax] rounded-full opacity-35 animate-drift"
            style={{
              background:
                'radial-gradient(circle, rgba(224,190,134,0.28) 0%, rgba(0,0,0,0) 66%)',
              filter: 'blur(58px)',
              animationDelay: '-3.5s',
            }}
          />
        </>
      )}

      {/* Vignette keeps the eye centred */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(115% 85% at 50% 45%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.42) 78%, rgba(0,0,0,0.72) 100%)',
        }}
      />

      {/* Grain — the difference between "web page" and "film" */}
      <div
        className="absolute inset-0 opacity-[0.055] mix-blend-overlay"
        style={{ backgroundImage: GRAIN, backgroundSize: '140px 140px' }}
      />
    </div>
  );
}

export default AmbientStage;

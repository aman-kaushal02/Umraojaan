import { AnimatePresence, motion } from 'framer-motion';
import { EASE_GATE } from '@/animations/motion';
import { useExperience } from '@/hooks/useExperience';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/* Emulsion grain, inlined so there is no extra request. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='150' height='150' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

/**
 * The auditorium: darkness, the beam, the glow off the screen, letterboxing,
 * grain and the occasional scratch in the print.
 *
 * Each scene declares its lighting state in `data/scenes.ts` and these layers
 * cross-dissolve, so a scene change reads as the projectionist adjusting the
 * lamp rather than a page navigation.
 */
export function TheatreStage() {
  const { scene, mood } = useExperience();
  const reducedMotion = usePrefersReducedMotion();
  const [core, mid, outer] = mood.house;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Empty house, so a cross-fade never shows through to white */}
      <div className="absolute inset-0 bg-theatre-950" />

      {/* Auditorium lighting — cross-dissolved between scenes */}
      <AnimatePresence initial={false}>
        <motion.div
          key={scene}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.25 : 1.5, ease: EASE_GATE }}
          style={{
            background: `radial-gradient(125% 95% at 50% 42%, ${core} 0%, ${mid} 48%, ${outer} 100%)`,
          }}
        />
      </AnimatePresence>

      {/* The beam: a cone of warm light widening toward the screen */}
      <motion.div
        className={[
          'absolute -top-[12%] left-1/2 h-[86%] w-[190vw] -translate-x-1/2 sm:w-[130vw]',
          reducedMotion ? '' : 'animate-gate-flicker',
        ].join(' ')}
        animate={{ opacity: mood.beam * 0.5 }}
        transition={{ duration: reducedMotion ? 0.25 : 1.8, ease: EASE_GATE }}
        style={{
          clipPath: 'polygon(47.5% 0%, 52.5% 0%, 100% 100%, 0% 100%)',
          background:
            'linear-gradient(to bottom, rgba(247,223,178,0.5) 0%, rgba(227,185,114,0.14) 42%, rgba(227,185,114,0) 88%)',
          filter: 'blur(26px)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Light bouncing back off the screen, onto her */}
      <motion.div
        className="absolute left-1/2 top-[42%] h-[76vmin] w-[92vmin] -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
        animate={{ opacity: mood.beam * 0.42, scale: 0.9 + mood.beam * 0.22 }}
        transition={{ duration: reducedMotion ? 0.25 : 1.8, ease: EASE_GATE }}
        style={{
          background:
            'radial-gradient(closest-side, rgba(243,233,212,0.36) 0%, rgba(227,185,114,0.12) 46%, rgba(0,0,0,0) 76%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Scratches drifting through the gate — soft and brief, or they read as
          a rendering artefact rather than damage in the emulsion. */}
      {!reducedMotion && (
        <>
          <span
            className="absolute left-[22%] top-0 h-full w-px animate-scratch bg-beam-100/20"
            style={{ animationDelay: '-2.4s', filter: 'blur(0.7px)' }}
          />
          <span
            className="absolute left-[71%] top-0 h-full w-px animate-scratch bg-lamp-200/16"
            style={{ animationDelay: '-8.3s', animationDuration: '11s', filter: 'blur(0.9px)' }}
          />
        </>
      )}

      {/* Vignette — every lens falls off at the corners */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(118% 88% at 50% 46%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 76%, rgba(0,0,0,0.86) 100%)',
        }}
      />

      {/* Grain — the difference between "web page" and "print" */}
      <motion.div
        className="absolute inset-0 mix-blend-overlay"
        animate={{ opacity: 0.05 + mood.grain * 0.07 }}
        transition={{ duration: reducedMotion ? 0.25 : 1.4, ease: EASE_GATE }}
        style={{ backgroundImage: GRAIN, backgroundSize: '150px 150px' }}
      />

      {/* Letterbox: this is a picture, not a page */}
      <div className="absolute inset-x-0 top-0 z-[2] h-[1.1rem] bg-theatre-950 sm:h-[1.75rem]" />
      <div className="absolute inset-x-0 bottom-0 z-[2] h-[1.1rem] bg-theatre-950 sm:h-[1.75rem]" />
    </div>
  );
}

export default TheatreStage;

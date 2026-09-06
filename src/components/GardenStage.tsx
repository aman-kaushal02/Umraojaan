import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Lighting } from '../data/scenes';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useIsCompact } from '../hooks/useMediaQuery';
import { EASE_SILK } from '../animations/motion';

interface GardenStageProps {
  lighting: Lighting;
  quiet?: boolean;
  children: ReactNode;
}

/**
 * Each hour of the garden is a small lighting rig: a base wash, three
 * coloured pools placed off-centre, the tint of the airborne pollen, and how
 * strongly the light shafts read.
 */
const RIGS: Record<
  Lighting,
  {
    base: string;
    pools: Array<{ x: number; y: number; r: number; color: string }>;
    motes: string;
    shaft: number;
    horizon: string;
  }
> = {
  dawn: {
    base: 'linear-gradient(178deg, #0b0710 0%, #150d20 38%, #2a1533 68%, #47203c 100%)',
    pools: [
      { x: 18, y: 78, r: 62, color: 'rgba(214,75,109,0.30)' },
      { x: 82, y: 26, r: 52, color: 'rgba(96,63,140,0.32)' },
      { x: 52, y: 96, r: 70, color: 'rgba(255,150,110,0.16)' },
    ],
    motes: 'rgba(255,214,232,0.85)',
    shaft: 0.1,
    horizon: 'rgba(255,168,140,0.20)',
  },
  morning: {
    base: 'linear-gradient(178deg, #2b1a3a 0%, #5a3352 32%, #a85f68 66%, #e6997f 100%)',
    pools: [
      { x: 24, y: 22, r: 58, color: 'rgba(255,201,135,0.38)' },
      { x: 78, y: 62, r: 64, color: 'rgba(234,111,140,0.30)' },
      { x: 46, y: 92, r: 66, color: 'rgba(255,240,214,0.18)' },
    ],
    motes: 'rgba(255,240,214,0.95)',
    shaft: 0.3,
    horizon: 'rgba(255,214,160,0.30)',
  },
  day: {
    base: 'linear-gradient(178deg, #3b2b52 0%, #6d5580 30%, #b58a92 64%, #f0c4a4 100%)',
    pools: [
      { x: 70, y: 16, r: 56, color: 'rgba(255,238,204,0.42)' },
      { x: 20, y: 58, r: 62, color: 'rgba(150,190,170,0.26)' },
      { x: 54, y: 96, r: 70, color: 'rgba(255,200,170,0.22)' },
    ],
    motes: 'rgba(255,252,240,0.95)',
    shaft: 0.38,
    horizon: 'rgba(255,232,196,0.32)',
  },
  afternoon: {
    base: 'linear-gradient(178deg, #43264a 0%, #7d4358 30%, #c06a5c 66%, #f0a06c 100%)',
    pools: [
      { x: 28, y: 20, r: 60, color: 'rgba(255,190,120,0.40)' },
      { x: 80, y: 54, r: 58, color: 'rgba(220,90,110,0.30)' },
      { x: 50, y: 94, r: 68, color: 'rgba(255,214,160,0.22)' },
    ],
    motes: 'rgba(255,230,196,0.95)',
    shaft: 0.34,
    horizon: 'rgba(255,182,120,0.34)',
  },
  dusk: {
    base: 'linear-gradient(178deg, #150d20 0%, #3a1c3e 34%, #7c3352 68%, #c05a5e 100%)',
    pools: [
      { x: 76, y: 82, r: 66, color: 'rgba(255,130,110,0.30)' },
      { x: 20, y: 34, r: 56, color: 'rgba(110,60,150,0.34)' },
      { x: 50, y: 100, r: 72, color: 'rgba(255,170,150,0.18)' },
    ],
    motes: 'rgba(255,220,232,0.9)',
    shaft: 0.16,
    horizon: 'rgba(255,150,130,0.26)',
  },
};

export function GardenStage({ lighting, quiet = false, children }: GardenStageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const isCompact = useIsCompact();
  const rig = RIGS[lighting];

  /* Pollen drifting through the light. Budget scales with screen size. */
  const moteCount = useMemo(() => {
    if (quiet) return isCompact ? 14 : 26;
    return isCompact ? 26 : 52;
  }, [isCompact, quiet]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    interface Mote {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      a: number;
      phase: number;
      drift: number;
    }

    const motes: Mote[] = Array.from({ length: moteCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -(Math.random() * 0.16 + 0.05),
      r: Math.random() * 1.9 + 0.5,
      a: Math.random() * 0.5 + 0.18,
      phase: Math.random() * Math.PI * 2,
      drift: Math.random() * 0.5 + 0.25,
    }));

    let raf = 0;
    let last = performance.now();
    let running = true;

    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - last) / 16.667, 2.5);
      last = now;

      ctx.clearRect(0, 0, w, h);

      for (const m of motes) {
        m.phase += 0.012 * dt;
        m.x += (m.vx + Math.sin(m.phase) * 0.14 * m.drift) * dt;
        m.y += m.vy * dt;

        if (m.y < -12) {
          m.y = h + 12;
          m.x = Math.random() * w;
        }
        if (m.x < -12) m.x = w + 12;
        if (m.x > w + 12) m.x = -12;

        const twinkle = m.a * (0.45 + Math.sin(m.phase * 1.7) * 0.55);

        const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 5);
        grad.addColorStop(0, rig.motes.replace(/[\d.]+\)$/, `${twinkle.toFixed(3)})`));
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = rig.motes.replace(/[\d.]+\)$/, `${Math.min(1, twinkle * 1.6).toFixed(3)})`);
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    /* Stop burning frames when the tab isn't visible. */
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [lighting, moteCount, reducedMotion, rig.motes]);

  return (
    <div className="relative w-full">
      {/* Fixed atmosphere. Scenes scroll over the top of it. */}
      <div aria-hidden="true" className="fixed inset-0 z-0 overflow-hidden">
        {/* Base wash, cross-dissolving between hours. */}
        <AnimatePresence initial={false}>
          <motion.div
            key={lighting}
            className="absolute inset-0"
            style={{ background: rig.base }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.2, ease: EASE_SILK }}
          />
        </AnimatePresence>

        {/* Coloured pools, slowly drifting so the sky is never static. */}
        {rig.pools.map((p, i) => (
          <motion.div
            key={`${lighting}-pool-${i}`}
            className={reducedMotion ? '' : 'animate-drift-mesh'}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.r}vmax`,
              height: `${p.r}vmax`,
              marginLeft: `-${p.r / 2}vmax`,
              marginTop: `-${p.r / 2}vmax`,
              background: `radial-gradient(circle, ${p.color}, transparent 68%)`,
              filter: 'blur(48px)',
              animationDelay: `${i * -7}s`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.6, ease: EASE_SILK, delay: i * 0.15 }}
          />
        ))}

        {/* Light shafts raking down from the top-left. */}
        {!reducedMotion && rig.shaft > 0.05 && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: rig.shaft }}
            transition={{ duration: 3, ease: EASE_SILK }}
            style={{
              background:
                'repeating-linear-gradient(102deg, rgba(255,244,222,0.16) 0px, rgba(255,244,222,0.16) 2px, transparent 2px, transparent 58px)',
              maskImage:
                'radial-gradient(70% 90% at 22% -10%, black 0%, transparent 72%)',
              WebkitMaskImage:
                'radial-gradient(70% 90% at 22% -10%, black 0%, transparent 72%)',
            }}
          />
        )}

        {/* Warm ground haze along the horizon. */}
        <motion.div
          key={`${lighting}-horizon`}
          className="absolute inset-x-0 bottom-0 h-[45vh]"
          style={{
            background: `radial-gradient(120% 100% at 50% 118%, ${rig.horizon}, transparent 70%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.4, ease: EASE_SILK }}
        />

        {/* Airborne pollen. */}
        {!reducedMotion && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            style={{ mixBlendMode: 'screen' }}
          />
        )}
      </div>

      {/* Scenes own their own padding and height. */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}

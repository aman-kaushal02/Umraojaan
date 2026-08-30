import { useEffect, useRef } from 'react';
import { glowSprite } from '@/animations/sprites';
import { useExperience } from '@/hooks/useExperience';
import { useIsCompact } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface Mote {
  x: number;
  y: number;
  size: number;
  speed: number;
  sway: number;
  phase: number;
  twinkle: number;
  color: string;
}

/**
 * Dust hanging in the projector beam.
 *
 * One canvas for the whole session that reacts to the current scene's mood,
 * rather than one per scene. Motes brighten as they drift through the middle of
 * the frame — where the beam is — which is what sells the light as volumetric.
 * Sprites are pre-rendered, the loop is delta-timed, DPR is capped at 2, and
 * everything pauses when the tab is hidden.
 */
export function DustMotes() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { mood } = useExperience();
  const compact = useIsCompact();
  const reducedMotion = usePrefersReducedMotion();

  /* Live mood in a ref so the loop never restarts on a scene change. */
  const moodRef = useRef(mood);
  moodRef.current = mood;

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const budget = compact ? 34 : 70;
    /* Scenes can ask for up to 1.6x the base budget, so size for the busiest. */
    const poolSize = Math.ceil(budget * 1.6);
    const motes: Mote[] = [];

    let width = 0;
    let height = 0;
    let raf = 0;
    let last = performance.now();
    let running = true;

    const pick = <T,>(items: readonly T[]) => items[(Math.random() * items.length) | 0];

    const spawn = (mote: Mote, atBottom: boolean) => {
      /* Cluster toward the middle: that's where the beam is. */
      const bias = (Math.random() + Math.random() + Math.random()) / 3;
      mote.x = (0.5 + (bias - 0.5) * 1.7) * width;
      mote.y = atBottom ? height + Math.random() * 60 : Math.random() * height;
      mote.size = 0.7 + Math.random() * 2.1;
      mote.speed = 0.45 + Math.random() * 1.05;
      mote.sway = 8 + Math.random() * 26;
      mote.phase = Math.random() * Math.PI * 2;
      mote.twinkle = 0.3 + Math.random() * 0.55;
      mote.color = pick(moodRef.current.dust.palette);
    };

    for (let i = 0; i < poolSize; i += 1) {
      const mote: Mote = {
        x: 0,
        y: 0,
        size: 1,
        speed: 1,
        sway: 10,
        phase: 0,
        twinkle: 0.5,
        color: '#f3e9d4',
      };
      spawn(mote, false);
      motes.push(mote);
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const frame = (now: number) => {
      if (!running) return;

      /* Clamp delta so a backgrounded tab can't teleport every mote. */
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;

      const { dust, beam } = moodRef.current;
      const active = Math.min(poolSize, Math.round(budget * Math.min(dust.density, 1.6)));

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      const centre = width / 2;

      for (let i = 0; i < active; i += 1) {
        const m = motes[i];

        m.phase += delta * 1.05;
        m.y += dust.drift * m.speed * delta;
        m.x += Math.sin(m.phase * 0.55) * m.sway * delta;

        if (m.y < -40 || m.x < -60 || m.x > width + 60) spawn(m, true);

        /* In the beam it glitters; out at the edges it barely exists. */
        const fromCentre = Math.abs(m.x - centre) / centre;
        const inBeam = Math.max(0.12, 1 - fromCentre * 1.15);
        const alpha = m.twinkle * inBeam * beam * (0.55 + 0.45 * Math.sin(m.phase));

        if (alpha <= 0.02) continue;

        const scale = m.size * 5;
        ctx.globalAlpha = Math.min(1, alpha);
        ctx.drawImage(glowSprite(m.color), m.x - scale / 2, m.y - scale / 2, scale, scale);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(frame);
    };

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

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [compact, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] h-full w-full"
    />
  );
}

export default DustMotes;

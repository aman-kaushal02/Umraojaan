import { useEffect, useRef } from 'react';
import { glowSprite, heartSprite } from '@/animations/sprites';
import { useExperience } from '@/hooks/useExperience';
import { useIsCompact } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  sway: number;
  phase: number;
  twinkle: number;
  heart: boolean;
  color: string;
}

/**
 * The one persistent particle field for the entire site.
 *
 * A single canvas that lives for the whole session and reacts to the current
 * scene's mood, rather than one canvas per scene. Sprites are pre-rendered,
 * the loop is delta-timed, DPR is capped at 2, and everything pauses when the
 * tab is hidden.
 */
export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { mood } = useExperience();
  const compact = useIsCompact();
  const reducedMotion = usePrefersReducedMotion();

  /* Live mood in a ref so the animation loop never restarts on scene change. */
  const moodRef = useRef(mood.particles);
  moodRef.current = mood.particles;

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const budget = compact ? 30 : 62;
    /* Scenes can ask for up to 1.6x the base budget, so the pool is sized for
       the busiest moment and `active` simply walks further into it. */
    const poolSize = Math.ceil(budget * 1.6);
    const particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();
    let running = true;

    const palette = () => moodRef.current.palette;
    const pick = <T,>(items: readonly T[]) => items[(Math.random() * items.length) | 0];

    const spawn = (particle: Particle, atBottom: boolean) => {
      particle.x = Math.random() * width;
      particle.y = atBottom ? height + Math.random() * 60 : Math.random() * height;
      particle.size = 0.9 + Math.random() * 2.4;
      particle.speed = 0.5 + Math.random() * 1.1;
      particle.sway = 6 + Math.random() * 20;
      particle.phase = Math.random() * Math.PI * 2;
      particle.twinkle = 0.35 + Math.random() * 0.5;
      particle.heart = Math.random() < moodRef.current.heartChance;
      particle.color = pick(palette());
    };

    for (let i = 0; i < poolSize; i += 1) {
      const particle: Particle = {
        x: 0,
        y: 0,
        size: 1,
        speed: 1,
        sway: 10,
        phase: 0,
        twinkle: 0.5,
        heart: false,
        color: '#fbf5ec',
      };
      spawn(particle, false);
      particles.push(particle);
    }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
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

      /* Clamp delta so a backgrounded tab can't teleport every particle. */
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;

      const { density, drift } = moodRef.current;
      const active = Math.min(poolSize, Math.round(budget * Math.min(density, 1.6)));

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < active; i += 1) {
        const p = particles[i];

        p.phase += delta * 1.1;
        p.y += drift * p.speed * delta;
        p.x += Math.sin(p.phase * 0.6) * p.sway * delta;

        if (p.y < -40 || p.x < -60 || p.x > width + 60) spawn(p, true);

        const alpha = p.twinkle * (0.55 + 0.45 * Math.sin(p.phase));
        if (alpha <= 0.02) continue;

        const sprite = p.heart ? heartSprite(p.color) : glowSprite(p.color);
        const scale = p.heart ? p.size * 2.6 : p.size * 5.2;

        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, p.x - scale / 2, p.y - scale / 2, scale, scale);
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
      className="pointer-events-none fixed inset-0 z-[2] h-full w-full"
    />
  );
}

export default ParticleBackground;

import { useEffect, useRef } from 'react';
import { glowSprite, sparkSprite, streakSprite } from '@/animations/sprites';
import { useIsCompact } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface LightFloodProps {
  /** Start / stop the flood. Turning it off fades the canvas out gracefully. */
  active: boolean;
  /** Milliseconds of full intensity before it settles into a quiet shimmer. */
  burstDuration?: number;
}

type Kind = 'ember' | 'streak' | 'spark';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  kind: Kind;
  phase: number;
}

const WARM = ['#f3e9d4', '#e3b972', '#fffdf6', '#f7dfb2'];

/**
 * The screen flooding with light.
 *
 * Deliberately not fireworks: a projector at full lamp throws blooms,
 * anamorphic streaks off the lens, and a lot of dust suddenly made visible.
 * Everything is warm, slow and horizontal, so it reads as light rather than
 * celebration. Particle caps scale down on phones.
 */
export function LightFlood({ active, burstDuration = 8000 }: LightFloodProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const compact = useIsCompact();
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!active || reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const MAX = compact ? 90 : 180;
    const particles: Particle[] = [];

    let width = 0;
    let height = 0;
    let raf = 0;
    let running = true;
    let elapsed = 0;
    let nextStreak = 0.2;
    let nextSpark = 0.5;
    let last = performance.now();

    const random = (min: number, max: number) => min + Math.random() * (max - min);
    const pick = <T,>(items: readonly T[]) => items[(Math.random() * items.length) | 0];

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

    const push = (particle: Particle) => {
      if (particles.length >= MAX) return;
      particles.push(particle);
    };

    /** A bloom of warm dust, thrown outward from the centre of the screen. */
    const bloom = () => {
      const count = compact ? 16 : 26;
      const cx = width / 2;
      const cy = height * random(0.36, 0.5);

      for (let i = 0; i < count; i += 1) {
        const angle = random(0, Math.PI * 2);
        /* Flattened, so the spread follows the shape of the screen. */
        const speed = random(28, 108);
        push({
          x: cx + random(-40, 40),
          y: cy + random(-24, 24),
          vx: Math.cos(angle) * speed * 1.5,
          vy: Math.sin(angle) * speed * 0.55 - 14,
          life: 0,
          maxLife: random(2.4, 4.6),
          size: random(5, 13),
          color: pick(WARM),
          kind: 'ember',
          phase: random(0, Math.PI * 2),
        });
      }
    };

    const streak = () => {
      push({
        x: width / 2,
        y: height * random(0.2, 0.7),
        vx: random(-30, 30),
        vy: random(-9, 9),
        life: 0,
        maxLife: random(1.4, 2.6),
        size: random(compact ? 220 : 340, compact ? 400 : 720),
        color: pick(WARM),
        kind: 'streak',
        phase: 0,
      });
    };

    const spark = () => {
      push({
        x: random(width * 0.12, width * 0.88),
        y: random(height * 0.16, height * 0.8),
        vx: random(-16, 16),
        vy: random(-26, -6),
        life: 0,
        maxLife: random(0.7, 1.5),
        size: random(9, 18),
        color: pick(WARM),
        kind: 'spark',
        phase: 0,
      });
    };

    const frame = (now: number) => {
      if (!running) return;

      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += delta * 1000;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      const flooding = elapsed < burstDuration;
      const progress = Math.min(1, elapsed / burstDuration);

      if (flooding) {
        nextStreak -= delta;
        if (nextStreak <= 0) {
          streak();
          bloom();
          /* Progressively calmer: the gaps widen as the lamp settles. */
          nextStreak = random(0.7, 1.5) + progress * 2.2;
        }

        nextSpark -= delta;
        if (nextSpark <= 0) {
          spark();
          nextSpark = random(0.16, 0.5) + progress * 0.8;
        }
      }

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.life += delta;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        const t = p.life / p.maxLife;
        /* Ease out, but hold the middle so blooms linger. */
        const fade = Math.sin((1 - t) * Math.PI * 0.5);

        if (p.kind === 'streak') {
          /* Flares spread and thin rather than travel. */
          p.x += p.vx * delta;
          p.y += p.vy * delta;
          const grow = 1 + t * 0.9;
          ctx.globalAlpha = fade * 0.4;
          ctx.drawImage(
            streakSprite(p.color),
            p.x - (p.size * grow) / 2,
            p.y - 9,
            p.size * grow,
            18,
          );
        } else if (p.kind === 'spark') {
          p.x += p.vx * delta;
          p.y += p.vy * delta;
          ctx.globalAlpha = fade * 0.75;
          ctx.drawImage(
            sparkSprite(p.color),
            p.x - p.size / 2,
            p.y - p.size / 2,
            p.size,
            p.size,
          );
        } else {
          p.phase += delta * 3;
          p.vx *= 0.985;
          p.vy *= 0.985;
          /* Dust rises once it loses momentum. */
          p.vy -= 5 * delta;
          p.x += p.vx * delta;
          p.y += p.vy * delta;

          const twinkle = 0.72 + 0.28 * Math.sin(p.phase);
          ctx.globalAlpha = fade * twinkle * 0.7;
          ctx.drawImage(
            glowSprite(p.color),
            p.x - p.size / 2,
            p.y - p.size / 2,
            p.size,
            p.size,
          );
        }
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

    /* Open on a beat: the lamp comes up all at once. */
    bloom();
    streak();

    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      particles.length = 0;
    };
  }, [active, burstDuration, compact, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={[
        'pointer-events-none fixed inset-0 z-[8] h-full w-full transition-opacity duration-[1600ms] ease-gate',
        active ? 'opacity-100' : 'opacity-0',
      ].join(' ')}
    />
  );
}

export default LightFlood;

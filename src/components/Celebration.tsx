import { useEffect, useRef } from 'react';
import { glowSprite, heartSprite, ribbonSprite } from '@/animations/sprites';
import { useIsCompact } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface CelebrationProps {
  /** Start / stop the show. Turning it off fades the canvas out gracefully. */
  active: boolean;
  /** Milliseconds of active launching before it settles into a quiet drift. */
  burstDuration?: number;
}

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  kind: 'ember' | 'heart' | 'ribbon';
  spin: number;
  rotation: number;
}

interface Shell {
  x: number;
  y: number;
  vy: number;
  targetY: number;
  color: string;
}

const WARM = ['#f7e7c9', '#eebfc8', '#e0be86', '#fffdf9', '#d2818f'];
const GRAVITY = 22;

/**
 * Soft fireworks, drifting hearts and slow ribbons of confetti.
 *
 * Tuned to stay romantic rather than rowdy: shells rise and bloom instead of
 * cracking, embers fall slowly with drag, and the whole thing eases into a
 * quiet drift after the opening bars. Particle caps scale down on phones.
 */
export function Celebration({ active, burstDuration = 8200 }: CelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const compact = useIsCompact();
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!active || reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const MAX_EMBERS = compact ? 130 : 260;
    const embers: Ember[] = [];
    const shells: Shell[] = [];

    let width = 0;
    let height = 0;
    let raf = 0;
    let running = true;
    let elapsed = 0;
    let nextShell = 0.35;
    let nextRibbon = 0.6;
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

    const launch = () => {
      shells.push({
        x: random(width * 0.18, width * 0.82),
        y: height + 10,
        vy: random(-height * 0.55, -height * 0.42),
        targetY: random(height * 0.16, height * 0.42),
        color: pick(WARM),
      });
    };

    const bloom = (x: number, y: number, color: string) => {
      const count = compact ? 26 : 42;
      const speed = compact ? 120 : 165;

      for (let i = 0; i < count; i += 1) {
        if (embers.length >= MAX_EMBERS) break;

        const angle = (Math.PI * 2 * i) / count + random(-0.12, 0.12);
        const velocity = speed * random(0.45, 1);
        const heart = Math.random() < 0.14;

        embers.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: 0,
          maxLife: random(1.5, 2.8),
          size: heart ? random(7, 12) : random(4, 9),
          color: Math.random() < 0.3 ? pick(WARM) : color,
          kind: heart ? 'heart' : 'ember',
          spin: random(-2, 2),
          rotation: random(0, Math.PI * 2),
        });
      }
    };

    const dropRibbon = () => {
      if (embers.length >= MAX_EMBERS) return;
      embers.push({
        x: random(0, width),
        y: -20,
        vx: random(-14, 14),
        vy: random(28, 54),
        life: 0,
        maxLife: random(6, 10),
        size: random(10, 18),
        color: pick(WARM),
        kind: 'ribbon',
        spin: random(-2.4, 2.4),
        rotation: random(0, Math.PI * 2),
      });
    };

    const frame = (now: number) => {
      if (!running) return;

      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += delta * 1000;

      ctx.clearRect(0, 0, width, height);

      /* ---- launching phase, easing off over time ---- */
      const launching = elapsed < burstDuration;
      if (launching) {
        nextShell -= delta;
        if (nextShell <= 0) {
          launch();
          /* Progressively calmer: gaps widen as the celebration settles. */
          const progress = elapsed / burstDuration;
          nextShell = random(0.45, 1.1) + progress * 1.4;
        }

        nextRibbon -= delta;
        if (nextRibbon <= 0) {
          dropRibbon();
          nextRibbon = random(0.24, 0.6);
        }
      }

      /* ---- shells ---- */
      ctx.globalCompositeOperation = 'lighter';
      for (let i = shells.length - 1; i >= 0; i -= 1) {
        const shell = shells[i];
        shell.vy += GRAVITY * 4 * delta;
        shell.y += shell.vy * delta;

        const sprite = glowSprite(shell.color);
        ctx.globalAlpha = 0.75;
        ctx.drawImage(sprite, shell.x - 7, shell.y - 7, 14, 14);
        /* faint tail */
        ctx.globalAlpha = 0.25;
        ctx.drawImage(sprite, shell.x - 4, shell.y + 8, 8, 8);

        if (shell.y <= shell.targetY || shell.vy >= 0) {
          bloom(shell.x, shell.y, shell.color);
          shells.splice(i, 1);
        }
      }

      /* ---- embers, hearts, ribbons ---- */
      for (let i = embers.length - 1; i >= 0; i -= 1) {
        const p = embers[i];
        p.life += delta;

        if (p.life >= p.maxLife) {
          embers.splice(i, 1);
          continue;
        }

        const t = p.life / p.maxLife;

        if (p.kind === 'ribbon') {
          p.x += (p.vx + Math.sin(p.life * 1.7) * 22) * delta;
          p.y += p.vy * delta;
          p.rotation += p.spin * delta;
        } else if (p.kind === 'heart') {
          p.vy += GRAVITY * 0.35 * delta;
          p.vx *= 0.982;
          p.vy *= 0.982;
          p.x += p.vx * delta;
          p.y += p.vy * delta;
        } else {
          p.vy += GRAVITY * delta;
          p.vx *= 0.978;
          p.vy *= 0.978;
          p.x += p.vx * delta;
          p.y += p.vy * delta;
        }

        if (p.y > height + 60) {
          embers.splice(i, 1);
          continue;
        }

        /* Ease out, with a gentle twinkle on the embers. */
        const fade = 1 - t * t;
        const twinkle = p.kind === 'ember' ? 0.7 + 0.3 * Math.sin(p.life * 14) : 1;
        ctx.globalAlpha = Math.max(0, fade * twinkle * (p.kind === 'ribbon' ? 0.6 : 0.9));

        if (p.kind === 'ribbon') {
          ctx.globalCompositeOperation = 'source-over';
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.drawImage(ribbonSprite(p.color), -p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
          ctx.globalCompositeOperation = 'lighter';
        } else {
          const sprite = p.kind === 'heart' ? heartSprite(p.color) : glowSprite(p.color);
          ctx.drawImage(sprite, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
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

    /* Open with two shells so the reveal lands on a beat. */
    launch();
    window.setTimeout(() => {
      if (running) launch();
    }, 260);

    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      embers.length = 0;
      shells.length = 0;
    };
  }, [active, burstDuration, compact, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={[
        'pointer-events-none fixed inset-0 z-[8] h-full w-full transition-opacity duration-[1600ms] ease-silk',
        active ? 'opacity-100' : 'opacity-0',
      ].join(' ')}
    />
  );
}

export default Celebration;

import { useEffect, useRef } from 'react';
import { pointerField } from '../../hooks/usePointerField';

/* ------------------------------------------------------------------ *
 * A real deep-sky render, not a div full of dots.
 *
 * Three things are happening at once:
 *
 *   1. A static plate — nebulae, the Milky Way band with its dust lanes,
 *      and nine hundred faint field stars — is painted once into an
 *      offscreen canvas. It is oversized so the sky can wheel without
 *      showing an edge.
 *   2. Ninety "hero" stars are drawn live every frame from pre-baked
 *      sprites (glow plus four-point diffraction spikes) so they can
 *      twinkle at their own speed and colour temperature.
 *   3. Dust motes sit close to the camera with exaggerated parallax,
 *      which is what actually sells the depth.
 *
 * Everything shares one slow rotation around a pole below the horizon —
 * roughly five degrees over five minutes, the same arc the real sky
 * turns. Pointer or tilt adds a small parallax offset on top, scaled
 * per layer.
 * ------------------------------------------------------------------ */

interface HeroStar {
  x: number;
  y: number;
  size: number;
  base: number;
  twinkleSpeed: number;
  twinklePhase: number;
  sprite: number;
}

interface Mote {
  x: number;
  y: number;
  r: number;
  alpha: number;
  drift: number;
  sway: number;
  phase: number;
}

interface Streak {
  x: number;
  y: number;
  vx: number;
  vy: number;
  len: number;
  life: number;
  maxLife: number;
  width: number;
}

const SPRITE_PX = 96;

/** Cool, neutral, warm — the three temperatures a naked eye can tell apart. */
const SPRITE_COLORS: Array<[string, string]> = [
  ['rgba(214,236,255,1)', 'rgba(120,180,255,0)'],
  ['rgba(255,255,252,1)', 'rgba(210,225,255,0)'],
  ['rgba(255,236,205,1)', 'rgba(255,190,120,0)'],
];

function makeStarSprite(core: string, halo: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = SPRITE_PX;
  const g = c.getContext('2d')!;
  const m = SPRITE_PX / 2;

  /* Outer bloom. */
  const bloom = g.createRadialGradient(m, m, 0, m, m, m);
  bloom.addColorStop(0, halo.replace(',0)', ',0.55)'));
  bloom.addColorStop(0.18, halo.replace(',0)', ',0.22)'));
  bloom.addColorStop(0.5, halo.replace(',0)', ',0.05)'));
  bloom.addColorStop(1, halo);
  g.fillStyle = bloom;
  g.fillRect(0, 0, SPRITE_PX, SPRITE_PX);

  /* Diffraction spikes — the cross a bright point makes through a lens. */
  g.globalCompositeOperation = 'lighter';
  for (const rot of [0, Math.PI / 2]) {
    g.save();
    g.translate(m, m);
    g.rotate(rot);
    const spike = g.createLinearGradient(-m, 0, m, 0);
    spike.addColorStop(0, 'rgba(255,255,255,0)');
    spike.addColorStop(0.42, 'rgba(255,255,255,0.1)');
    spike.addColorStop(0.5, 'rgba(255,255,255,0.5)');
    spike.addColorStop(0.58, 'rgba(255,255,255,0.1)');
    spike.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = spike;
    g.fillRect(-m, -0.9, SPRITE_PX, 1.8);
    g.restore();
  }

  /* Hard core. */
  const core2 = g.createRadialGradient(m, m, 0, m, m, m * 0.09);
  core2.addColorStop(0, core);
  core2.addColorStop(1, core.replace(',1)', ',0)'));
  g.fillStyle = core2;
  g.fillRect(0, 0, SPRITE_PX, SPRITE_PX);

  return c;
}

/* ------------------------------------------------------------------ *
 * The static plate
 * ------------------------------------------------------------------ */

function paintPlate(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(2, Math.round(w));
  c.height = Math.max(2, Math.round(h));
  const g = c.getContext('2d')!;
  const rand = mulberry(20260922);

  /* Nebulae. Large radial gradients are already smooth, so no blur pass —
     they read as gas at any resolution. */
  g.globalCompositeOperation = 'lighter';
  const clouds: Array<[number, number, number, string]> = [
    [0.18, 0.24, 0.5, '99,102,241'],
    [0.74, 0.16, 0.44, '129,86,190'],
    [0.52, 0.62, 0.55, '58,86,168'],
    [0.9, 0.6, 0.36, '176,84,140'],
    [0.08, 0.74, 0.4, '52,120,140'],
    [0.4, 0.06, 0.3, '80,74,190'],
  ];
  for (const [cx, cy, cr, rgb] of clouds) {
    const r = cr * Math.max(w, h) * 0.62;
    const grad = g.createRadialGradient(cx * w, cy * h, 0, cx * w, cy * h, r);
    grad.addColorStop(0, `rgba(${rgb},0.15)`);
    grad.addColorStop(0.35, `rgba(${rgb},0.07)`);
    grad.addColorStop(0.7, `rgba(${rgb},0.02)`);
    grad.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  }

  /* The Milky Way — a band across the frame, brightest at its spine. */
  const bandAngle = -0.42;
  g.save();
  g.translate(w * 0.5, h * 0.46);
  g.rotate(bandAngle);
  const span = Math.hypot(w, h) * 1.3;
  const thickness = Math.min(w, h) * 0.5;

  const spine = g.createLinearGradient(0, -thickness, 0, thickness);
  spine.addColorStop(0, 'rgba(150,160,235,0)');
  spine.addColorStop(0.34, 'rgba(150,160,235,0.028)');
  spine.addColorStop(0.48, 'rgba(202,206,255,0.075)');
  spine.addColorStop(0.52, 'rgba(202,206,255,0.075)');
  spine.addColorStop(0.66, 'rgba(150,160,235,0.028)');
  spine.addColorStop(1, 'rgba(150,160,235,0)');
  g.fillStyle = spine;
  g.fillRect(-span / 2, -thickness, span, thickness * 2);

  /* Cluster stars crowding the spine — gaussian-ish so the edges thin out. */
  for (let i = 0; i < 2600; i++) {
    const t = (rand() - 0.5) * span;
    const gauss = (rand() + rand() + rand() - 1.5) / 1.5;
    const off = gauss * thickness * 0.62;
    const r = rand() < 0.9 ? 0.4 + rand() * 0.55 : 0.9 + rand() * 0.6;
    const a = 0.1 + rand() * 0.42 * (1 - Math.abs(gauss) * 0.7);
    g.fillStyle = `rgba(${226 + Math.round(rand() * 24)},${230 + Math.round(rand() * 22)},255,${a.toFixed(3)})`;
    g.beginPath();
    g.arc(t, off, r, 0, 6.2832);
    g.fill();
  }
  g.restore();

  /* Dust lanes — dark clouds in front of the band. This is the detail that
     stops it looking like an airbrushed streak. */
  g.globalCompositeOperation = 'source-over';
  g.save();
  g.translate(w * 0.5, h * 0.46);
  g.rotate(bandAngle);
  for (let i = 0; i < 22; i++) {
    const t = (rand() - 0.5) * span * 0.95;
    const off = (rand() - 0.5) * thickness * 0.8;
    const rx = 30 + rand() * 130;
    const ry = 6 + rand() * 20;
    const grad = g.createRadialGradient(t, off, 0, t, off, Math.max(rx, ry));
    grad.addColorStop(0, `rgba(7,6,20,${(0.14 + rand() * 0.18).toFixed(2)})`);
    grad.addColorStop(1, 'rgba(7,6,20,0)');
    g.save();
    g.translate(t, off);
    g.rotate((rand() - 0.5) * 0.7);
    g.scale(1, ry / rx);
    g.translate(-t, -off);
    g.fillStyle = grad;
    g.fillRect(t - rx * 1.6, off - rx * 1.6, rx * 3.2, rx * 3.2);
    g.restore();
  }
  g.restore();

  /* Field stars, everywhere else. */
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 1150; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const r = rand() < 0.86 ? 0.35 + rand() * 0.5 : 0.85 + rand() * 0.55;
    const a = 0.12 + rand() * 0.5;
    const warm = rand() < 0.18;
    g.fillStyle = warm
      ? `rgba(255,${226 + Math.round(rand() * 20)},198,${a.toFixed(3)})`
      : `rgba(${216 + Math.round(rand() * 34)},${230 + Math.round(rand() * 25)},255,${a.toFixed(3)})`;
    g.beginPath();
    g.arc(x, y, r, 0, 6.2832);
    g.fill();
  }

  return c;
}

/** Deterministic RNG so the sky is the same sky on every visit. */
function mulberry(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

interface Props {
  /** 0 while the title card holds, 1 once she is in the sky. */
  intensity?: number;
  reducedMotion?: boolean;
}

export function StarFieldCanvas({ intensity = 1, reducedMotion = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intensityRef = useRef(intensity);
  intensityRef.current = intensity;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const sprites = SPRITE_COLORS.map(([a, b]) => makeStarSprite(a, b));

    let w = 0;
    let h = 0;
    let dpr = 1;
    let plate: HTMLCanvasElement | null = null;
    let plateW = 0;
    let plateH = 0;
    let margin = 0;
    let heroes: HeroStar[] = [];
    let motes: Mote[] = [];
    let streaks: Streak[] = [];
    let shown = 0; // eased intensity
    let nextStreak = 2600;

    const build = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      /* Overscan gives the rotation and parallax room to move. */
      margin = Math.round(Math.max(w, h) * 0.14);
      plateW = w + margin * 2;
      plateH = h + margin * 2;
      plate = paintPlate(plateW, plateH);

      const area = w * h;
      const heroCount = Math.round(Math.min(130, Math.max(52, area / 13000)));
      const rand = mulberry(90922);
      heroes = Array.from({ length: heroCount }, () => {
        const bright = rand();
        return {
          x: -margin + rand() * plateW,
          y: -margin + rand() * plateH,
          size: bright < 0.7 ? 5 + rand() * 7 : bright < 0.94 ? 12 + rand() * 12 : 26 + rand() * 20,
          base: 0.3 + rand() * 0.65,
          twinkleSpeed: 0.0004 + rand() * 0.0016,
          twinklePhase: rand() * 6.2832,
          sprite: rand() < 0.2 ? 2 : rand() < 0.62 ? 0 : 1,
        };
      });

      motes = Array.from({ length: Math.round(Math.min(46, area / 26000)) }, () => ({
        x: rand() * w,
        y: rand() * h,
        r: 0.6 + rand() * 1.5,
        alpha: 0.03 + rand() * 0.1,
        drift: 0.004 + rand() * 0.012,
        sway: 6 + rand() * 22,
        phase: rand() * 6.2832,
      }));
    };

    build();

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(build, 220);
    };
    window.addEventListener('resize', onResize);

    const pivotY = () => h * 1.62;

    let raf = 0;
    let last = performance.now();
    let elapsed = 0;

    const frame = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      elapsed += reducedMotion ? 0 : dt;

      shown += (intensityRef.current - shown) * 0.035;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const px = reducedMotion ? 0 : pointerField.sx;
      const py = reducedMotion ? 0 : pointerField.sy;
      const angle = elapsed * 0.0000041;
      const pv = pivotY();

      /* --- plate ------------------------------------------------------ */
      if (plate) {
        ctx.save();
        ctx.globalAlpha = 0.55 + shown * 0.45;
        ctx.translate(w * 0.5 - px * 14, pv - py * 10);
        ctx.rotate(angle);
        ctx.translate(-w * 0.5, -pv);
        ctx.drawImage(plate, -margin, -margin, plateW, plateH);
        ctx.restore();
      }

      /* --- hero stars -------------------------------------------------- */
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.translate(w * 0.5 - px * 30, pv - py * 22);
      ctx.rotate(angle * 1.04);
      ctx.translate(-w * 0.5, -pv);
      for (const s of heroes) {
        const tw =
          0.68 + 0.32 * Math.sin(elapsed * s.twinkleSpeed + s.twinklePhase) * (1 - s.size / 90);
        const a = s.base * tw * (0.4 + shown * 0.6);
        if (a <= 0.01) continue;
        const size = s.size * (0.94 + tw * 0.12);
        ctx.globalAlpha = Math.min(1, a);
        ctx.drawImage(sprites[s.sprite], s.x - size / 2, s.y - size / 2, size, size);
      }
      ctx.restore();

      /* --- dust motes -------------------------------------------------- */
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const m of motes) {
        const y = m.y - ((elapsed * m.drift) % (h + 80));
        const yy = y < -40 ? y + h + 80 : y;
        const x = m.x + Math.sin(elapsed * 0.00022 + m.phase) * m.sway - px * 62;
        const grad = ctx.createRadialGradient(x, yy, 0, x, yy, m.r * 3.4);
        grad.addColorStop(0, `rgba(226,236,255,${(m.alpha * shown).toFixed(3)})`);
        grad.addColorStop(1, 'rgba(226,236,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, yy, m.r * 3.4, 0, 6.2832);
        ctx.fill();
      }
      ctx.restore();

      /* --- ambient shooting stars -------------------------------------- */
      if (!reducedMotion && shown > 0.5) {
        nextStreak -= dt;
        if (nextStreak <= 0) {
          nextStreak = 7000 + Math.random() * 11000;
          const fromLeft = Math.random() < 0.5;
          const speed = 0.55 + Math.random() * 0.5;
          const dir = (fromLeft ? 1 : -1) * (0.55 + Math.random() * 0.35);
          streaks.push({
            x: fromLeft ? -60 : w + 60,
            y: h * (0.04 + Math.random() * 0.42),
            vx: dir * speed,
            vy: (0.3 + Math.random() * 0.35) * speed,
            len: 120 + Math.random() * 200,
            life: 0,
            maxLife: 900 + Math.random() * 500,
            width: 1 + Math.random() * 1.2,
          });
        }
      }

      if (streaks.length) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        streaks = streaks.filter((s) => {
          s.life += dt;
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          const t = s.life / s.maxLife;
          if (t >= 1) return false;
          const fade = Math.sin(Math.PI * t);
          const nx = s.vx / Math.hypot(s.vx, s.vy);
          const ny = s.vy / Math.hypot(s.vx, s.vy);
          const tx = s.x - nx * s.len;
          const ty = s.y - ny * s.len;
          const grad = ctx.createLinearGradient(s.x, s.y, tx, ty);
          grad.addColorStop(0, `rgba(255,255,255,${(0.85 * fade).toFixed(3)})`);
          grad.addColorStop(0.25, `rgba(220,236,255,${(0.35 * fade).toFixed(3)})`);
          grad.addColorStop(1, 'rgba(180,200,255,0)');
          ctx.strokeStyle = grad;
          ctx.lineWidth = s.width;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(tx, ty);
          ctx.stroke();

          const head = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 9);
          head.addColorStop(0, `rgba(255,255,255,${(0.9 * fade).toFixed(3)})`);
          head.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = head;
          ctx.beginPath();
          ctx.arc(s.x, s.y, 9, 0, 6.2832);
          ctx.fill();
          return true;
        });
        ctx.restore();
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}

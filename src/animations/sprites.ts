/**
 * Pre-rendered canvas sprites.
 *
 * Drawing a soft glow per particle per frame (radial gradients, shadowBlur) is
 * the fastest way to lose 60fps. Every shape is rasterised once into a tiny
 * offscreen canvas and then blitted with `drawImage`, which is cheap enough to
 * run hundreds of times a frame.
 */

const cache = new Map<string, HTMLCanvasElement>();

function create(
  key: string,
  width: number,
  height: number,
  paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
) {
  const cached = cache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (ctx) paint(ctx, width, height);

  cache.set(key, canvas);
  return canvas;
}

/** Soft round bloom — dust in the beam, embers, sparks. */
export function glowSprite(color: string): HTMLCanvasElement {
  return create(`glow|${color}`, 34, 34, (ctx, w) => {
    const r = w / 2;
    const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.26, color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(r, r, r, 0, Math.PI * 2);
    ctx.fill();
  });
}

/** Anamorphic streak — a horizontal flare off the lens. */
export function streakSprite(color: string): HTMLCanvasElement {
  return create(`streak|${color}`, 128, 16, (ctx, w, h) => {
    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;

    /* Taper vertically so the ends feather instead of stopping flat. */
    for (let y = 0; y < h; y += 1) {
      const falloff = 1 - Math.abs(y - h / 2) / (h / 2);
      ctx.globalAlpha = falloff * falloff;
      ctx.fillRect(0, y, w, 1);
    }
    ctx.globalAlpha = 1;
  });
}

/** A short bright flick of light — sparks thrown off a flare. */
export function sparkSprite(color: string): HTMLCanvasElement {
  return create(`spark|${color}`, 24, 24, (ctx, w) => {
    const c = w / 2;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.moveTo(c - 7, c);
    ctx.lineTo(c + 7, c);
    ctx.moveTo(c, c - 7);
    ctx.lineTo(c, c + 7);
    ctx.stroke();
  });
}

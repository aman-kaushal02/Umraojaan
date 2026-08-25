/**
 * Pre-rendered canvas sprites.
 *
 * Drawing a soft glow per particle per frame (radial gradients, shadowBlur)
 * is the fastest way to lose 60fps. Instead every shape is rasterised once
 * into a tiny offscreen canvas and then blitted with `drawImage`, which is
 * cheap enough to run hundreds of times a frame.
 */

const cache = new Map<string, HTMLCanvasElement>();

function create(key: string, size: number, paint: (ctx: CanvasRenderingContext2D, size: number) => void) {
  const cached = cache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (ctx) paint(ctx, size);

  cache.set(key, canvas);
  return canvas;
}

/** Soft round bloom — used for dust, sparks and firework embers. */
export function glowSprite(color: string): HTMLCanvasElement {
  return create(`glow|${color}`, 34, (ctx, size) => {
    const r = size / 2;
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

/** Tiny heart with a matching halo. */
export function heartSprite(color: string): HTMLCanvasElement {
  return create(`heart|${color}`, 30, (ctx, size) => {
    ctx.translate(size / 2, size / 2 + 1);
    ctx.scale(size / 32, size / 32);
    ctx.beginPath();
    ctx.moveTo(0, 9);
    ctx.bezierCurveTo(-13, -1, -10, -13, -4.6, -13);
    ctx.bezierCurveTo(-1.6, -13, 0, -10.2, 0, -10.2);
    ctx.bezierCurveTo(0, -10.2, 1.6, -13, 4.6, -13);
    ctx.bezierCurveTo(10, -13, 13, -1, 0, 9);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 7;
    ctx.fill();
  });
}

/** Slim ribbon of confetti — deliberately thin so it reads as elegant. */
export function ribbonSprite(color: string): HTMLCanvasElement {
  return create(`ribbon|${color}`, 24, (ctx, size) => {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.9;
    ctx.fillRect(size / 2 - 1.5, 3, 3, size - 6);
  });
}

import { useEffect } from 'react';

/**
 * One shared, render-loop-friendly pointer source.
 *
 * Canvas layers and the constellation both need to know where her finger or
 * cursor is, every frame. Putting that in React state would re-render the tree
 * sixty times a second, so it lives in a plain mutable object instead and
 * anything that cares reads it inside its own rAF loop.
 */
export interface PointerField {
  /** Raw viewport pixels. */
  x: number;
  y: number;
  /** Normalised −1…1 from the centre of the screen. */
  nx: number;
  ny: number;
  /** Smoothed −1…1, what parallax should actually follow. */
  sx: number;
  sy: number;
  /** True once she has moved something. */
  active: boolean;
  /** Rises to 1 while moving, decays to 0 when still. */
  energy: number;
  lastMove: number;
}

export const pointerField: PointerField = {
  x: -9999,
  y: -9999,
  nx: 0,
  ny: 0,
  sx: 0,
  sy: 0,
  active: false,
  energy: 0,
  lastMove: 0,
};

let listening = false;
let tiltBase: { beta: number; gamma: number } | null = null;

function set(x: number, y: number) {
  pointerField.x = x;
  pointerField.y = y;
  pointerField.nx = (x / window.innerWidth) * 2 - 1;
  pointerField.ny = (y / window.innerHeight) * 2 - 1;
  pointerField.active = true;
  pointerField.energy = 1;
  pointerField.lastMove = performance.now();
}

function onPointerMove(e: PointerEvent) {
  set(e.clientX, e.clientY);
}

function onTouch(e: TouchEvent) {
  const t = e.touches[0];
  if (t) set(t.clientX, t.clientY);
}

/** Phone tilt drives the sky when there is no cursor to follow. */
function onTilt(e: DeviceOrientationEvent) {
  if (e.beta == null || e.gamma == null) return;
  if (!tiltBase) tiltBase = { beta: e.beta, gamma: e.gamma };

  const dx = Math.max(-1, Math.min(1, (e.gamma - tiltBase.gamma) / 26));
  const dy = Math.max(-1, Math.min(1, (e.beta - tiltBase.beta) / 26));

  /* Tilt only steers parallax; it must not fake a cursor position, or every
     star would think she is hovering it. */
  pointerField.nx = pointerField.active ? pointerField.nx : dx;
  pointerField.ny = pointerField.active ? pointerField.ny : dy;
}

/** Call once, high in the tree. Safe to call from several places. */
export function useInitPointerField() {
  useEffect(() => {
    if (listening) return;
    listening = true;

    const opts = { passive: true } as AddEventListenerOptions;
    window.addEventListener('pointermove', onPointerMove, opts);
    window.addEventListener('touchmove', onTouch, opts);
    window.addEventListener('touchstart', onTouch, opts);
    window.addEventListener('deviceorientation', onTilt, opts);

    let raf = 0;
    const tick = () => {
      /* Critically damped follow — no overshoot, no lag spike on fast flicks. */
      pointerField.sx += (pointerField.nx - pointerField.sx) * 0.055;
      pointerField.sy += (pointerField.ny - pointerField.sy) * 0.055;

      const idle = performance.now() - pointerField.lastMove;
      if (idle > 90) pointerField.energy *= 0.94;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('deviceorientation', onTilt);
      listening = false;
    };
  }, []);
}

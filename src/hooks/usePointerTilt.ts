import { useEffect, useRef } from 'react';
import { useHasFinePointer } from './useMediaQuery';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface TiltOptions {
  /** Maximum rotation in degrees on each axis. */
  max?: number;
  /** Maximum lateral drift in px. */
  shift?: number;
  /** Easing factor per frame (0–1). Lower feels heavier. */
  ease?: number;
  /** Force the effect off (e.g. while a scripted timeline is running). */
  disabled?: boolean;
}

/**
 * Gentle "the object notices you" parallax, driven by pointer position
 * relative to the viewport centre.
 *
 * Writes transforms straight to the node inside a single rAF loop, so it
 * never triggers a React re-render. Automatically inert on touch devices
 * and when reduced motion is requested.
 */
export function usePointerTilt<T extends HTMLElement>({
  max = 8,
  shift = 10,
  ease = 0.08,
  disabled = false,
}: TiltOptions = {}) {
  const ref = useRef<T | null>(null);
  const finePointer = useHasFinePointer();
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const node = ref.current;
    const inert = disabled || !finePointer || reducedMotion;

    if (!node) return;

    if (inert) {
      node.style.transform = '';
      return;
    }

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;
    let running = true;

    const onPointerMove = (event: PointerEvent) => {
      target.x = (event.clientX / window.innerWidth) * 2 - 1;
      target.y = (event.clientY / window.innerHeight) * 2 - 1;
    };

    const onPointerLeave = () => {
      target.x = 0;
      target.y = 0;
    };

    const tick = () => {
      if (!running) return;

      current.x += (target.x - current.x) * ease;
      current.y += (target.y - current.y) * ease;

      node.style.transform =
        `perspective(1100px) ` +
        `rotateY(${(current.x * max).toFixed(3)}deg) ` +
        `rotateX(${(-current.y * max).toFixed(3)}deg) ` +
        `translate3d(${(current.x * shift).toFixed(2)}px, ${(current.y * shift * 0.6).toFixed(2)}px, 0)`;

      frame = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);
    frame = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      node.style.transform = '';
    };
  }, [disabled, ease, finePointer, max, reducedMotion, shift]);

  return ref;
}

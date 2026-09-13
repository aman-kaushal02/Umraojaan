import { useEffect, useRef } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

/**
 * A cool, telescope-lens glow that trails the cursor, with a thin
 * reticle ring that lags a little further behind. Fine pointers only —
 * on a phone her finger is already the highlight.
 */
export function LensGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const fine = useMediaQuery('(pointer: fine)');
  const reduced = usePrefersReducedMotion();
  const enabled = fine && !reduced;

  useEffect(() => {
    if (!enabled) return;
    const glow = glowRef.current;
    const ring = ringRef.current;
    if (!glow || !ring) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const a = { ...target };
    const b = { ...target };
    let raf = 0;
    let shown = false;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!shown) {
        shown = true;
        glow.style.opacity = '1';
        ring.style.opacity = '1';
      }
    };
    const onLeave = () => {
      shown = false;
      glow.style.opacity = '0';
      ring.style.opacity = '0';
    };

    const tick = () => {
      a.x += (target.x - a.x) * 0.14;
      a.y += (target.y - a.y) * 0.14;
      b.x += (target.x - b.x) * 0.07;
      b.y += (target.y - b.y) * 0.07;
      glow.style.transform = `translate3d(${a.x}px, ${a.y}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[52] overflow-hidden">
      <div
        ref={glowRef}
        className="absolute left-0 top-0 h-[30rem] w-[30rem] rounded-full opacity-0 transition-opacity duration-700"
        style={{
          background:
            'radial-gradient(circle, rgba(150,190,255,0.13) 0%, rgba(190,170,255,0.07) 46%, transparent 70%)',
          filter: 'blur(34px)',
        }}
      />
      <div
        ref={ringRef}
        className="absolute left-0 top-0 h-16 w-16 rounded-full opacity-0 transition-opacity duration-700"
        style={{
          border: '1px solid rgba(203,222,255,0.16)',
          boxShadow: 'inset 0 0 22px rgba(160,200,255,0.08)',
        }}
      />
    </div>
  );
}

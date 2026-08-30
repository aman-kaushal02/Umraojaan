import { useEffect, useRef } from 'react';
import { useHasFinePointer } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const TRAIL = 5;

/**
 * A pool of lamp light that follows the pointer, with a short trail of dust.
 *
 * Desktop only. On touch devices there is no cursor to follow and the effect
 * would just be five extra composited layers for nothing, so it isn't rendered
 * at all. Positions are written straight to the DOM inside one rAF loop.
 */
export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement | null>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const finePointer = useHasFinePointer();
  const reducedMotion = usePrefersReducedMotion();
  const enabled = finePointer && !reducedMotion;

  useEffect(() => {
    if (!enabled) return;

    const glow = glowRef.current;
    if (!glow) return;

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const halo = { ...pointer };
    const trail = Array.from({ length: TRAIL }, () => ({ ...pointer }));

    let raf = 0;
    let visible = false;

    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!visible) {
        visible = true;
        glow.style.opacity = '1';
      }
    };

    const onLeave = () => {
      visible = false;
      glow.style.opacity = '0';
    };

    const tick = () => {
      halo.x += (pointer.x - halo.x) * 0.14;
      halo.y += (pointer.y - halo.y) * 0.14;
      glow.style.transform = `translate3d(${halo.x}px, ${halo.y}px, 0) translate(-50%, -50%)`;

      let leadX = halo.x;
      let leadY = halo.y;

      for (let i = 0; i < TRAIL; i += 1) {
        const node = trailRefs.current[i];
        const point = trail[i];
        point.x += (leadX - point.x) * (0.2 - i * 0.025);
        point.y += (leadY - point.y) * (0.2 - i * 0.025);
        leadX = point.x;
        leadY = point.y;

        if (node) {
          node.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -50%)`;
          node.style.opacity = visible ? `${0.38 - i * 0.06}` : '0';
        }
      }

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
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <div
        ref={glowRef}
        className="absolute left-0 top-0 h-[24rem] w-[24rem] rounded-full opacity-0 transition-opacity duration-700"
        style={{
          background:
            'radial-gradient(circle, rgba(243,233,212,0.10) 0%, rgba(227,185,114,0.05) 40%, rgba(0,0,0,0) 68%)',
          filter: 'blur(6px)',
        }}
      />
      {Array.from({ length: TRAIL }).map((_, index) => (
        <div
          key={index}
          ref={(node) => {
            trailRefs.current[index] = node;
          }}
          className="absolute left-0 top-0 rounded-full opacity-0 transition-opacity duration-500"
          style={{
            height: `${6 - index}px`,
            width: `${6 - index}px`,
            background: index % 2 === 0 ? 'rgba(243,233,212,0.9)' : 'rgba(227,185,114,0.85)',
            boxShadow: '0 0 10px rgba(243,233,212,0.6)',
          }}
        />
      ))}
    </div>
  );
}

export default CursorGlow;

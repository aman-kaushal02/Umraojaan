import { useEffect, useRef } from 'react';
import { useHasFinePointer } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const TRAIL = 5;

/**
 * A warm light that follows the cursor, with a short trail of embers.
 *
 * Desktop only. On touch devices there is no cursor to follow, and the effect
 * would just be five extra composited layers for nothing — so it isn't rendered
 * at all. Positions are written directly to the DOM inside one rAF loop.
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
          node.style.opacity = visible ? `${0.42 - i * 0.07}` : '0';
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
        className="absolute left-0 top-0 h-[26rem] w-[26rem] rounded-full opacity-0 transition-opacity duration-700"
        style={{
          background:
            'radial-gradient(circle, rgba(247,231,201,0.10) 0%, rgba(238,191,200,0.05) 38%, rgba(0,0,0,0) 68%)',
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
            height: `${7 - index}px`,
            width: `${7 - index}px`,
            background: index % 2 === 0 ? 'rgba(247,231,201,0.9)' : 'rgba(238,191,200,0.85)',
            boxShadow: '0 0 10px rgba(247,231,201,0.65)',
          }}
        />
      ))}
    </div>
  );
}

export default CursorGlow;

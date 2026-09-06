import { useEffect, useRef } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement | null>(null);
  const hasFinePointer = useMediaQuery('(pointer: fine)');
  const reducedMotion = usePrefersReducedMotion();
  const enabled = hasFinePointer && !reducedMotion;

  useEffect(() => {
    if (!enabled || !glowRef.current) return;

    const glow = glowRef.current;
    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { ...pointer };
    let raf = 0;
    let visible = false;

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
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
      current.x += (pointer.x - current.x) * 0.12;
      current.y += (pointer.y - current.y) * 0.12;
      glow.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;
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
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <div
        ref={glowRef}
        className="absolute left-0 top-0 h-96 w-96 rounded-full opacity-0 transition-opacity duration-700"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 182, 193, 0.15) 0%, rgba(255, 192, 203, 0.08) 50%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { gsap } from '@/animations/gsap';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface CountdownLeaderProps {
  /** Fired when the leader has run out and the picture should start. */
  onDone: () => void;
}

const COUNTS = [3, 2, 1] as const;
const HOLD = 0.92;
const LEAD_IN = 0.62;

/**
 * An Academy countdown leader — the 3-2-1 spliced onto the head of a print,
 * with the sweep hand going round once per number.
 *
 * A countdown inside a countdown, which is the whole joke: she's waiting for a
 * birthday, and the film makes her wait a few more seconds first.
 */
export function CountdownLeader({ onDone }: CountdownLeaderProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const scope = rootRef.current;
    if (!scope) return;

    if (reducedMotion) {
      const id = window.setTimeout(onDone, 500);
      return () => window.clearTimeout(id);
    }

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: 'power2.out' },
        onComplete: onDone,
      });
      timelineRef.current = timeline;

      /* Head of the leader. */
      timeline
        .fromTo('[data-leader="start"]', { opacity: 0 }, { opacity: 1, duration: 0.22 }, 0)
        .to('[data-leader="start"]', { opacity: 0, duration: 0.2 }, LEAD_IN - 0.18)
        .fromTo('[data-leader="dial"]', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5 }, 0.12);

      /* One sweep of the hand per number. */
      COUNTS.forEach((count, index) => {
        const at = LEAD_IN + index * HOLD;

        timeline
          .set(`[data-leader="n${count}"]`, { opacity: 1, scale: 1.22 }, at)
          .to(`[data-leader="n${count}"]`, { scale: 1, duration: 0.42, ease: 'power3.out' }, at)
          .to(`[data-leader="n${count}"]`, { opacity: 0, duration: 0.14 }, at + HOLD - 0.14)
          .fromTo(
            '[data-leader="wiper"]',
            { rotate: 0 },
            { rotate: 360, duration: HOLD, ease: 'none' },
            at,
          )
          /* The gate stutters a little on each splice. */
          .to('[data-leader="dial"]', { opacity: 0.82, duration: 0.06 }, at)
          .to('[data-leader="dial"]', { opacity: 1, duration: 0.1 }, at + 0.06);
      });

      const tail = LEAD_IN + COUNTS.length * HOLD;

      /* Cue dot, then the picture starts. */
      timeline
        .fromTo('[data-leader="cue"]', { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.14 }, tail - 0.3)
        .to('[data-leader="dial"]', { opacity: 0, scale: 1.14, duration: 0.3 }, tail - 0.1)
        .to('[data-leader="flash"]', { opacity: 1, duration: 0.16, ease: 'power2.in' }, tail - 0.05)
        .to('[data-leader="flash"]', { opacity: 0, duration: 0.55 }, tail + 0.14);
    }, rootRef);

    return () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
      context.revert();
    };
  }, [onDone, reducedMotion]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[30] flex items-center justify-center overflow-hidden bg-theatre-950"
    >
      {/* leader stock is warmer and rougher than the picture */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(circle at 50% 46%, rgba(43,33,19,0.9) 0%, rgba(10,12,10,1) 62%)',
        }}
      />

      <p
        data-leader="start"
        className="slate-label absolute top-[16%] text-[0.6rem] text-brass-300/70 opacity-0 sm:text-[0.7rem]"
      >
        Picture start
      </p>

      <div
        data-leader="dial"
        className="relative h-[58vmin] w-[58vmin] max-h-[22rem] max-w-[22rem] opacity-0"
      >
        {/* the sweep hand */}
        <div
          data-leader="wiper"
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'conic-gradient(from 0deg, rgba(243,233,212,0.20) 0deg, rgba(243,233,212,0.06) 82deg, transparent 92deg 360deg)',
            maskImage: 'radial-gradient(circle, transparent 12%, #000 13%, #000 99%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(circle, transparent 12%, #000 13%, #000 99%, transparent 100%)',
          }}
        />

        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
          {/* crosshair */}
          <line x1="100" y1="2" x2="100" y2="198" stroke="rgba(243,233,212,0.32)" strokeWidth="1" />
          <line x1="2" y1="100" x2="198" y2="100" stroke="rgba(243,233,212,0.32)" strokeWidth="1" />

          {/* rings */}
          <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(243,233,212,0.5)" strokeWidth="1.4" />
          <circle cx="100" cy="100" r="72" fill="none" stroke="rgba(243,233,212,0.22)" strokeWidth="1" />
          <circle cx="100" cy="100" r="46" fill="none" stroke="rgba(243,233,212,0.16)" strokeWidth="1" />

          {/* minute ticks */}
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (Math.PI * 2 * i) / 24;
            const inner = i % 6 === 0 ? 84 : 90;
            return (
              <line
                key={i}
                x1={100 + Math.cos(a) * inner}
                y1={100 + Math.sin(a) * inner}
                x2={100 + Math.cos(a) * 96}
                y2={100 + Math.sin(a) * 96}
                stroke="rgba(243,233,212,0.4)"
                strokeWidth={i % 6 === 0 ? 1.6 : 0.8}
              />
            );
          })}
        </svg>

        {/* the numbers */}
        {COUNTS.map((count) => (
          <span
            key={count}
            data-leader={`n${count}`}
            className="absolute inset-0 flex items-center justify-center font-display text-[26vmin] leading-none text-beam-50 opacity-0 text-screen-glow sm:text-[11rem]"
          >
            {count}
          </span>
        ))}
      </div>

      {/* the cue dot, top right, exactly as it appears on a real print */}
      <span
        data-leader="cue"
        className="absolute right-[12%] top-[14%] h-4 w-4 rounded-full bg-beam-50/90 opacity-0 blur-[1px] sm:h-6 sm:w-6"
      />

      {/* the flash as the leader runs out */}
      <div data-leader="flash" className="absolute inset-0 bg-beam-50 opacity-0" />
    </div>
  );
}

export default CountdownLeader;

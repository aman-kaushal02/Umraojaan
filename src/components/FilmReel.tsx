import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, useGsap } from '@/animations/gsap';
import { usePointerTilt } from '@/hooks/usePointerTilt';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface FilmReelProps {
  /** 1–2 characters engraved on the centre boss. */
  monogram: string;
  /** Typed onto the film can's label. */
  canLabel: string;
  /** Accessible name for the interactive reel. */
  label: string;
  /** Fired the moment she starts it, before the timeline plays. */
  onThreading?: () => void;
  /** Fired once the reel is up to speed and the film is threaded. */
  onThreaded: () => void;
}

/**
 * A 35mm reel, loaded and waiting.
 *
 * Pure SVG/CSS geometry — no images — so it stays crisp at any size and can
 * actually spin. Tapping it runs one GSAP timeline: the reel jolts, comes up to
 * speed, and the tail of the film unspools downward and threads through the
 * gate. The Academy leader takes over from there.
 */
export function FilmReel({
  monogram,
  canLabel,
  label,
  onThreading,
  onThreaded,
}: FilmReelProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [threading, setThreading] = useState(false);

  const reducedMotion = usePrefersReducedMotion();
  const tiltRef = usePointerTilt<HTMLDivElement>({
    max: 9,
    shift: 10,
    disabled: threading,
  });

  /* ---------------- idle: warm, impatient, not yet running -------------- */
  useGsap(
    rootRef,
    () => {
      if (reducedMotion) return;

      gsap.to('[data-reel="glow"]', {
        opacity: 0.9,
        scale: 1.16,
        duration: 2.3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      /* The reel shifts a few degrees now and then, like it wants to go. */
      gsap.to('[data-reel="spin"]', {
        keyframes: [
          { rotate: 3.5, duration: 0.5, ease: 'power2.out' },
          { rotate: 0, duration: 0.9, ease: 'power2.inOut' },
        ],
        repeat: -1,
        repeatDelay: 3.4,
        delay: 2,
      });
    },
    [reducedMotion],
  );

  /* ---------------- threading ------------------------------------------- */
  const thread = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setThreading(true);
    onThreading?.();

    const scope = rootRef.current;
    if (!scope) {
      onThreaded();
      return;
    }

    /**
     * `data-reel` hooks are unique to this component and only one reel is ever
     * mounted, so the timeline can address them by selector directly.
     */
    const q = (selector: string) => scope.querySelector<HTMLElement>(selector);

    if (reducedMotion) {
      window.setTimeout(onThreaded, 320);
      return;
    }

    ['[data-reel="glow"]', '[data-reel="spin"]'].forEach((selector) => {
      const node = q(selector);
      if (node) gsap.killTweensOf(node);
    });
    gsap.set(q('[data-reel="spin"]'), { rotate: 0 });

    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: onThreaded });
    timelineRef.current = timeline;

    timeline
      /* 1 — it takes up the slack */
      .to('[data-reel="stage"]', { scale: 1.06, duration: 0.5 }, 0)
      .to('[data-reel="glow"]', { opacity: 1, scale: 1.3, duration: 0.8 }, 0)
      .to('[data-reel="spin"]', { rotate: -9, duration: 0.16, ease: 'power2.out' }, 0)

      /* 2 — up to speed, and still accelerating */
      .to(
        '[data-reel="spin"]',
        { rotate: 1420, duration: 2.25, ease: 'power1.in' },
        0.16,
      )

      /* 3 — the tail unspools and threads down through the gate */
      .to('[data-reel="strip"]', { scaleY: 1, duration: 0.95, ease: 'power2.in' }, 0.42)
      .to('[data-reel="strip-glow"]', { opacity: 1, duration: 0.6 }, 0.7)

      /* 4 — the lamp finds it */
      .to('[data-reel="stage"]', { scale: 1.16, y: '-3%', duration: 1.5, ease: 'power2.inOut' }, 1)
      .to('[data-reel="flare"]', { opacity: 1, duration: 0.9 }, 1.3)

      /* 5 — hand off to the leader */
      .to('[data-reel="stage"]', { opacity: 0, filter: 'blur(10px)', duration: 0.5 }, 1.95);
  }, [onThreaded, onThreading, reducedMotion]);

  useEffect(() => {
    const scope = rootRef.current;
    return () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
      if (scope) gsap.killTweensOf(scope.querySelectorAll('*'));
    };
  }, []);

  return (
    <div ref={rootRef} className="relative flex w-full flex-col items-center">
      <div ref={tiltRef} className="w-full max-w-[15rem] xs:max-w-[17rem] sm:max-w-[19rem]">
        <div data-reel="stage" className="relative gpu">
          <button
            type="button"
            onClick={thread}
            disabled={threading}
            aria-label={label}
            className="group relative block w-full rounded-[2px] focus-visible:outline-offset-8 disabled:cursor-default"
          >
            {/* lamp pooling around the reel */}
            <div
              data-reel="glow"
              aria-hidden="true"
              className="pointer-events-none absolute -inset-10 -z-10 rounded-full opacity-70 blur-2xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(227,185,114,0.4) 0%, rgba(243,233,212,0.14) 44%, transparent 72%)',
              }}
            />

            {/* a hot flare off the metal, late in the timeline */}
            <div
              data-reel="flare"
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 h-[3px] w-[160%] -translate-x-1/2 -translate-y-1/2 opacity-0 blur-[2px]"
              style={{
                background:
                  'linear-gradient(to right, transparent, rgba(243,233,212,0.85) 35%, rgba(255,253,246,0.95) 50%, rgba(243,233,212,0.85) 65%, transparent)',
              }}
            />

            <div
              className={[
                'relative w-full no-select',
                reducedMotion ? '' : 'animate-weave',
              ].join(' ')}
              style={{ aspectRatio: '1 / 1' }}
            >
              <svg
                data-reel="spin"
                viewBox="0 0 100 100"
                className="h-full w-full gpu"
                role="presentation"
              >
                <defs>
                  <linearGradient id="reelBrass" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#e7d3ad" />
                    <stop offset="38%" stopColor="#b98f4e" />
                    <stop offset="72%" stopColor="#6d5330" />
                    <stop offset="100%" stopColor="#d3b581" />
                  </linearGradient>
                  <radialGradient id="reelHub" cx="36%" cy="30%" r="72%">
                    <stop offset="0%" stopColor="#f7dfb2" />
                    <stop offset="52%" stopColor="#b98f4e" />
                    <stop offset="100%" stopColor="#57411f" />
                  </radialGradient>
                  <linearGradient id="filmBand" x1="0" y1="0" x2="0.6" y2="1">
                    <stop offset="0%" stopColor="#241f16" />
                    <stop offset="45%" stopColor="#14120d" />
                    <stop offset="100%" stopColor="#2c2418" />
                  </linearGradient>
                </defs>

                {/* wound film */}
                <circle cx="50" cy="50" r="34" fill="none" stroke="url(#filmBand)" strokeWidth="20" />
                {/* the layers of it */}
                <circle
                  cx="50"
                  cy="50"
                  r="39"
                  fill="none"
                  stroke="rgba(220,207,182,0.10)"
                  strokeWidth="0.6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="30"
                  fill="none"
                  stroke="rgba(220,207,182,0.08)"
                  strokeWidth="0.6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="34"
                  fill="none"
                  stroke="rgba(227,185,114,0.22)"
                  strokeWidth="19"
                  strokeDasharray="0.8 5.5"
                />

                {/* flanges */}
                <circle cx="50" cy="50" r="45" fill="none" stroke="url(#reelBrass)" strokeWidth="3.4" />
                <circle
                  cx="50"
                  cy="50"
                  r="24"
                  fill="none"
                  stroke="url(#reelBrass)"
                  strokeWidth="2.2"
                />

                {/* spool windows */}
                {Array.from({ length: 6 }).map((_, i) => {
                  const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
                  return (
                    <circle
                      key={i}
                      cx={50 + Math.cos(angle) * 17}
                      cy={50 + Math.sin(angle) * 17}
                      r="4.6"
                      fill="#070906"
                      stroke="url(#reelBrass)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* centre boss */}
                <circle cx="50" cy="50" r="9.4" fill="url(#reelHub)" />
                <circle
                  cx="50"
                  cy="50"
                  r="9.4"
                  fill="none"
                  stroke="rgba(7,9,6,0.45)"
                  strokeWidth="0.8"
                />
                <text
                  x="50"
                  y="50"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily="Cinzel, Georgia, serif"
                  fontSize="8"
                  fill="#2b2013"
                  letterSpacing="0.5"
                >
                  {monogram}
                </text>

                {/* a sheen across the flange */}
                <path
                  d="M17 28 A45 45 0 0 1 74 16"
                  fill="none"
                  stroke="rgba(255,253,246,0.4)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>

              {/* the tail, unspooling downward out of frame */}
              <div
                data-reel="strip"
                aria-hidden="true"
                className="absolute left-1/2 top-[86%] h-[42vh] w-[26%] origin-top -translate-x-1/2"
                style={{ transform: 'translateX(-50%) scaleY(0)' }}
              >
                <div className="celluloid relative h-full w-full overflow-hidden rounded-[1px] shadow-[0_10px_30px_-14px_rgba(0,0,0,0.9)]">
                  {/* sprocket edges */}
                  {(['left-[7%]', 'right-[7%]'] as const).map((side) => (
                    <span
                      key={side}
                      className={`absolute ${side} top-0 h-full w-[9%]`}
                      style={{
                        backgroundImage:
                          'linear-gradient(to bottom, rgba(5,6,5,0.95) 0 7px, transparent 7px 16px)',
                        backgroundSize: '100% 16px',
                        backgroundRepeat: 'repeat-y',
                      }}
                    />
                  ))}
                  {/* frame lines */}
                  <span
                    className="absolute inset-x-[22%] top-0 h-full"
                    style={{
                      backgroundImage:
                        'linear-gradient(to bottom, rgba(220,207,182,0.14) 0 1px, transparent 1px 48px)',
                      backgroundSize: '100% 48px',
                    }}
                  />
                  <span
                    data-reel="strip-glow"
                    className="absolute inset-0 opacity-0"
                    style={{
                      background:
                        'linear-gradient(to bottom, rgba(227,185,114,0.32), rgba(227,185,114,0) 62%)',
                    }}
                  />
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* the can's label, typed and taped on */}
      <p className="slug mt-8 max-w-[18rem] text-center leading-relaxed text-brass-300/55 sm:mt-10">
        {canLabel}
      </p>
    </div>
  );
}

export default FilmReel;

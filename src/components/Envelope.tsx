import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, useGsap } from '@/animations/gsap';
import { usePointerTilt } from '@/hooks/usePointerTilt';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useIsCompact } from '@/hooks/useMediaQuery';

interface EnvelopeProps {
  /** 1–2 characters engraved into the wax. */
  monogram: string;
  /** Handwritten line on the front of the envelope. */
  addressedTo: string;
  /** Accessible name for the interactive envelope. */
  label: string;
  /** Fired the moment the seal is broken, before the timeline plays. */
  onOpening?: () => void;
  /** Fired once the full opening timeline has finished. */
  onOpened: () => void;
}

const SPARK_COUNT = 14;

/**
 * A hand-built envelope: back panel, front pocket, hinged flap, wax seal.
 *
 * Everything is CSS/SVG geometry — no images — so it stays crisp at every size
 * and the flap can hinge in real 3D. The opening runs as one GSAP timeline
 * (~3.2s) so the beats land in a deliberate order instead of all at once.
 */
export function Envelope({
  monogram,
  addressedTo,
  label,
  onOpening,
  onOpened,
}: EnvelopeProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const openedRef = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [opening, setOpening] = useState(false);

  const reducedMotion = usePrefersReducedMotion();
  const compact = useIsCompact();
  const tiltRef = usePointerTilt<HTMLDivElement>({
    max: 9,
    shift: 12,
    disabled: opening,
  });

  /* ---------------- idle: breathing, glow, the occasional nudge ---------- */
  useGsap(
    rootRef,
    () => {
      if (reducedMotion) return;

      gsap.to('[data-env="seal"]', {
        scale: 1.05,
        duration: 1.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to('[data-env="seal-glow"]', {
        opacity: 0.85,
        scale: 1.25,
        duration: 2.1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      /* "There's something in here" — a small impatient shiver. */
      gsap.to('[data-env="body"]', {
        keyframes: [
          { rotate: -0.9, x: -3, duration: 0.09 },
          { rotate: 0.9, x: 3, duration: 0.09 },
          { rotate: -0.6, x: -2, duration: 0.09 },
          { rotate: 0, x: 0, duration: 0.14 },
        ],
        repeat: -1,
        repeatDelay: 4.2,
        delay: 2.6,
        ease: 'none',
      });
    },
    [reducedMotion],
  );

  /* ---------------- the opening ----------------------------------------- */
  const open = useCallback(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    setOpening(true);
    onOpening?.();

    const scope = rootRef.current;
    if (!scope) {
      onOpened();
      return;
    }

    /**
     * `data-env` hooks are unique to this component and only one envelope is
     * ever mounted, so the timeline can address them by selector directly.
     */
    const q = (selector: string) => scope.querySelector<HTMLElement>(selector);

    /* Reduced motion: honour the intent, skip the choreography. */
    if (reducedMotion) {
      const flap = q('[data-env="flap"]');
      const letter = q('[data-env="letter"]');
      if (flap) flap.style.transform = 'rotateX(-172deg)';
      if (letter) letter.style.transform = 'translate3d(0, -46%, 0)';
      window.setTimeout(onOpened, 320);
      return;
    }

    /* Stop the idle loops and normalise their leftovers before choreographing. */
    const idleTargets = ['[data-env="body"]', '[data-env="seal"]', '[data-env="seal-glow"]'];
    idleTargets.forEach((selector) => {
      const node = q(selector);
      if (node) gsap.killTweensOf(node);
    });
    gsap.set(q('[data-env="seal"]'), { scale: 1 });
    gsap.set(q('[data-env="seal-glow"]'), { scale: 1 });

    const timeline = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: onOpened,
    });
    timelineRef.current = timeline;

    /* 1 — the envelope notices, and braces */
    timeline
      .to('[data-env="body"]', { rotate: 0, x: 0, duration: 0.2 })
      .to('[data-env="stage"]', { scale: 1.06, duration: 0.55, ease: 'power2.out' }, 0)
      .to('[data-env="glow"]', { opacity: 1, scale: 1.2, duration: 0.9 }, 0)

      /* 2 — the wax gives */
      .to('[data-env="seal"]', { scale: 1.16, duration: 0.22, ease: 'power2.out' }, 0.3)
      .to(
        '[data-env="body"]',
        {
          keyframes: [
            { x: -4, rotate: -1.1, duration: 0.07 },
            { x: 4, rotate: 1.1, duration: 0.07 },
            { x: -2, rotate: -0.5, duration: 0.07 },
            { x: 0, rotate: 0, duration: 0.09 },
          ],
        },
        0.4,
      )
      .to('[data-env="seal-crack"]', { opacity: 1, duration: 0.12 }, 0.52)
      .to('[data-env="seal-face"]', { opacity: 0, duration: 0.18 }, 0.62)
      .to(
        '[data-env="seal-left"]',
        { x: -22, y: 16, rotate: -34, opacity: 0, duration: 0.85, ease: 'power2.in' },
        0.62,
      )
      .to(
        '[data-env="seal-right"]',
        { x: 22, y: 20, rotate: 38, opacity: 0, duration: 0.85, ease: 'power2.in' },
        0.66,
      )
      .to('[data-env="seal-glow"]', { opacity: 0, scale: 1.9, duration: 0.6 }, 0.6)

      /* 3 — the flap swings open, and passes behind the envelope halfway */
      .to(
        '[data-env="flap"]',
        { rotateX: -172, duration: 1.15, ease: 'power2.inOut' },
        0.78,
      )
      .set('[data-env="flap"]', { zIndex: 5 }, 1.32)
      .to('[data-env="mouth-shadow"]', { opacity: 1, duration: 0.7 }, 0.9)

      /* 4 — the letter rises */
      .fromTo(
        '[data-env="letter"]',
        { y: '4%', scale: 0.97 },
        {
          y: compact ? '-40%' : '-46%',
          scale: 1.02,
          duration: 1.5,
          ease: 'power2.inOut',
        },
        1.25,
      )
      .to('[data-env="letter-shadow"]', { opacity: 0.45, duration: 1.2 }, 1.25)
      .to('[data-env="letter-lines"]', { opacity: 1, duration: 0.9 }, 1.7)

      /* 5 — sparks out of the mouth */
      .to(
        '[data-env="spark"]',
        {
          opacity: 1,
          duration: 0.25,
          stagger: { each: 0.045, from: 'center' },
        },
        1.15,
      )
      .to(
        '[data-env="spark"]',
        {
          y: () => -90 - Math.random() * 150,
          x: () => (Math.random() - 0.5) * 190,
          rotate: () => (Math.random() - 0.5) * 220,
          opacity: 0,
          duration: 1.9,
          ease: 'power2.out',
          stagger: { each: 0.045, from: 'center' },
        },
        1.2,
      )

      /* 6 — camera pushes in, the room brightens, we dissolve out */
      .to(
        '[data-env="stage"]',
        { scale: compact ? 1.28 : 1.34, y: '-3%', duration: 1.7, ease: 'power2.inOut' },
        1.5,
      )
      .to('[data-env="bloom"]', { opacity: 1, duration: 1.4, ease: 'power2.in' }, 1.9)
      .to('[data-env="stage"]', { opacity: 0.15, duration: 0.55 }, 2.75);
  }, [compact, onOpened, onOpening, reducedMotion]);

  /* Safety net: never leave a stray timeline running after unmount. */
  useEffect(() => {
    const scope = rootRef.current;
    return () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
      if (scope) gsap.killTweensOf(scope.querySelectorAll('*'));
    };
  }, []);

  return (
    <div ref={rootRef} className="relative flex w-full items-center justify-center">
      {/* Warm bloom that floods the frame at the end of the timeline */}
      <div
        data-env="bloom"
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40 opacity-0"
        style={{
          background:
            'radial-gradient(circle at 50% 46%, rgba(251,245,236,0.92) 0%, rgba(238,191,200,0.55) 34%, rgba(122,17,48,0) 72%)',
        }}
      />

      <div ref={tiltRef} className="w-full max-w-[26rem] sm:max-w-[30rem]">
        <div data-env="stage" className="relative gpu preserve-3d">
          <button
            type="button"
            onClick={open}
            disabled={opening}
            aria-label={label}
            className="group relative block w-full cursor-pointer rounded-lg focus-visible:outline-offset-8 disabled:cursor-default"
          >
            {/* Ambient glow under the envelope */}
            <div
              data-env="glow"
              aria-hidden="true"
              className="pointer-events-none absolute -inset-10 -z-10 rounded-full opacity-70 blur-2xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(224,190,134,0.32) 0%, rgba(238,191,200,0.16) 42%, rgba(0,0,0,0) 72%)',
              }}
            />

            <div
              data-env="body"
              className={[
                'relative w-full no-select preserve-3d',
                reducedMotion ? '' : 'animate-drift-slow',
              ].join(' ')}
              style={{ aspectRatio: '1.5 / 1', perspective: '1400px' }}
            >
              {/* ---- back panel ---- */}
              <div
                className="absolute inset-0 rounded-[7px] shadow-envelope"
                style={{
                  background:
                    'linear-gradient(168deg, #f7ecdc 0%, #efdfc9 46%, #e3cdb0 100%)',
                }}
              />

              {/* soft interior shadow at the mouth of the envelope */}
              <div
                data-env="mouth-shadow"
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[52%] rounded-t-[7px] opacity-0"
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(60,20,32,0.55), rgba(60,20,32,0.05))',
                }}
              />

              {/* ---- the letter, waiting inside ---- */}
              <div
                data-env="letter"
                className="absolute left-1/2 top-[7%] z-10 h-[86%] w-[86%] -translate-x-1/2 gpu"
              >
                <div className="paper paper-fibers relative h-full w-full rounded-[3px] shadow-[0_10px_26px_-14px_rgba(34,5,15,0.6)]">
                  <div
                    data-env="letter-lines"
                    aria-hidden="true"
                    className="absolute inset-0 flex flex-col justify-center gap-[7%] px-[12%] opacity-0"
                  >
                    <span className="h-[2px] w-1/3 rounded-full bg-rose-500/25" />
                    <span className="h-[2px] w-full rounded-full bg-rose-500/15" />
                    <span className="h-[2px] w-[86%] rounded-full bg-rose-500/15" />
                    <span className="h-[2px] w-[92%] rounded-full bg-rose-500/15" />
                    <span className="h-[2px] w-1/2 rounded-full bg-rose-500/20" />
                  </div>
                </div>
                <div
                  data-env="letter-shadow"
                  aria-hidden="true"
                  className="absolute -bottom-4 left-1/2 h-6 w-[80%] -translate-x-1/2 rounded-full opacity-0 blur-md"
                  style={{ background: 'rgba(20,4,12,0.7)' }}
                />
              </div>

              {/* ---- front pocket (V-shaped top edge) ---- */}
              <div
                className="absolute inset-0 z-20 rounded-b-[7px]"
                style={{
                  clipPath: 'polygon(0 0, 50% 46%, 100% 0, 100% 100%, 0 100%)',
                  background:
                    'linear-gradient(172deg, #fdf6ea 0%, #f5e8d5 40%, #e8d3b8 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
                }}
              />

              {/* fold lines on the front, for weight */}
              <div
                aria-hidden="true"
                className="absolute inset-0 z-20 rounded-b-[7px] opacity-70"
                style={{
                  clipPath: 'polygon(0 0, 50% 46%, 100% 0, 100% 100%, 0 100%)',
                  background:
                    'linear-gradient(122deg, rgba(173,91,107,0.10) 0%, rgba(173,91,107,0) 46%),' +
                    'linear-gradient(238deg, rgba(173,91,107,0.10) 0%, rgba(173,91,107,0) 46%),' +
                    'linear-gradient(to top, rgba(122,17,48,0.10), rgba(122,17,48,0) 38%)',
                }}
              />

              {/* handwritten address */}
              <div className="absolute inset-x-0 bottom-[13%] z-20 flex flex-col items-center gap-2">
                <span aria-hidden="true" className="gold-rule w-16 opacity-70" />
                <span className="px-6 text-center font-script text-[0.95rem] leading-tight text-rose-600/75 xs:text-[1.1rem]">
                  {addressedTo}
                </span>
              </div>

              {/* ---- hinged flap ---- */}
              <div
                data-env="flap"
                className="absolute inset-x-0 top-0 z-30 h-[46%] preserve-3d"
                style={{ transformOrigin: 'top center', transform: 'rotateX(0deg)' }}
              >
                {/* outer face */}
                <div
                  className="absolute inset-0 backface-hidden"
                  style={{
                    clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                    background:
                      'linear-gradient(to bottom, #fdf7ec 0%, #f2e3cd 62%, #e6d0b3 100%)',
                    filter: 'drop-shadow(0 3px 5px rgba(80,30,44,0.22))',
                  }}
                />
                {/* inner face, revealed as it swings over */}
                <div
                  className="absolute inset-0 backface-hidden"
                  style={{
                    transform: 'rotateX(180deg)',
                    clipPath: 'polygon(0 100%, 100% 100%, 50% 0)',
                    background:
                      'linear-gradient(to top, #e9d4bb 0%, #dcbf9f 70%, #cfae8b 100%)',
                  }}
                />
              </div>

              {/* ---- wax seal ---- */}
              <div
                className="absolute left-1/2 top-[46%] z-40 -translate-x-1/2 -translate-y-1/2"
                style={{ width: '22%', aspectRatio: '1 / 1' }}
              >
                <div
                  data-env="seal-glow"
                  aria-hidden="true"
                  className="absolute -inset-4 rounded-full opacity-50 blur-lg"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(224,190,134,0.75) 0%, rgba(122,17,48,0.25) 48%, transparent 72%)',
                  }}
                />

                <div data-env="seal" className="relative h-full w-full gpu">
                  {/* intact wax */}
                  <div
                    data-env="seal-face"
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      borderRadius: '48% 52% 46% 54% / 52% 46% 54% 48%',
                      background:
                        'radial-gradient(circle at 34% 28%, #a8264a 0%, #7a1130 42%, #4d0c20 100%)',
                      boxShadow:
                        'inset 0 2px 5px rgba(255,255,255,0.28), inset 0 -3px 7px rgba(0,0,0,0.45), 0 5px 12px -4px rgba(34,5,15,0.75)',
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-[16%] rounded-full border border-champagne-300/25"
                    />
                    <span className="relative font-serif text-[0.95rem] leading-none text-champagne-200/90 xs:text-[1.15rem] sm:text-[1.3rem]">
                      {monogram}
                    </span>
                  </div>

                  {/* the crack */}
                  <svg
                    data-env="seal-crack"
                    aria-hidden="true"
                    viewBox="0 0 100 100"
                    className="absolute inset-0 h-full w-full opacity-0"
                  >
                    <path
                      d="M50 4 L44 30 L56 46 L46 64 L52 96"
                      fill="none"
                      stroke="rgba(20,4,12,0.75)"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* the two halves that fall away */}
                  {(['left', 'right'] as const).map((half) => (
                    <div
                      key={half}
                      data-env={`seal-${half}`}
                      aria-hidden="true"
                      className="absolute inset-0 opacity-0"
                      style={{
                        clipPath:
                          half === 'left'
                            ? 'polygon(0 0, 48% 0, 54% 46%, 44% 66%, 50% 100%, 0 100%)'
                            : 'polygon(48% 0, 100% 0, 100% 100%, 50% 100%, 44% 66%, 54% 46%)',
                        borderRadius: '48% 52% 46% 54% / 52% 46% 54% 48%',
                        background:
                          'radial-gradient(circle at 34% 28%, #a8264a 0%, #7a1130 42%, #4d0c20 100%)',
                        boxShadow: 'inset 0 -3px 7px rgba(0,0,0,0.45)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* ---- sparks that escape when it opens ---- */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-[42%] z-40 flex justify-center"
              >
                {Array.from({ length: SPARK_COUNT }).map((_, index) => (
                  <span
                    key={index}
                    data-env="spark"
                    className="absolute opacity-0"
                    style={{
                      left: `${8 + (index * 84) / (SPARK_COUNT - 1)}%`,
                      height: index % 3 === 0 ? '7px' : '4px',
                      width: index % 3 === 0 ? '7px' : '4px',
                      borderRadius: '9999px',
                      background:
                        index % 3 === 0
                          ? 'rgba(238,191,200,0.95)'
                          : 'rgba(247,231,201,0.95)',
                      boxShadow: '0 0 12px rgba(247,231,201,0.8)',
                    }}
                  />
                ))}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Envelope;

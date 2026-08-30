import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, useGsap } from '@/animations/gsap';
import { usePointerTilt } from '@/hooks/usePointerTilt';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface ClapperboardProps {
  /** Chalked onto the board. */
  board: {
    production: string;
    director: string;
    scene: string;
    take: string;
  };
  label: string;
  /** Fired the instant the sticks come together. */
  onClapping?: () => void;
  /** Fired once the cut has landed. */
  onClapped: () => void;
}

/* Diagonal clapper stripes, the same on both sticks. */
const STRIPES =
  'repeating-linear-gradient(115deg, #eee5d2 0 13px, #0b0d0b 13px 26px)';

/**
 * A clapperboard, sticks open, waiting for someone to call it.
 *
 * The whole point of a slate is that it makes a hard, unambiguous mark — so
 * this animation is deliberately the opposite of the reel's: no easing in, no
 * drifting. The sticks snap shut in a twelfth of a second, the frame jolts, and
 * the picture cuts.
 */
export function Clapperboard({ board, label, onClapping, onClapped }: ClapperboardProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const clappedRef = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [clapping, setClapping] = useState(false);

  const reducedMotion = usePrefersReducedMotion();
  const tiltRef = usePointerTilt<HTMLDivElement>({ max: 10, shift: 11, disabled: clapping });

  /* ---------------- idle ------------------------------------------------- */
  useGsap(
    rootRef,
    () => {
      if (reducedMotion) return;

      gsap.to('[data-slate="glow"]', {
        opacity: 0.9,
        scale: 1.13,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      /* The stick is being held open by someone who's getting bored. */
      gsap.to('[data-slate="stick"]', {
        rotate: -14,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        transformOrigin: '3% 100%',
      });
    },
    [reducedMotion],
  );

  /* ---------------- the clap -------------------------------------------- */
  const clap = useCallback(() => {
    if (clappedRef.current) return;
    clappedRef.current = true;
    setClapping(true);
    onClapping?.();

    const scope = rootRef.current;
    if (!scope) {
      onClapped();
      return;
    }

    const q = (selector: string) => scope.querySelector<HTMLElement>(selector);

    if (reducedMotion) {
      const stick = q('[data-slate="stick"]');
      if (stick) stick.style.transform = 'rotate(0deg)';
      window.setTimeout(onClapped, 320);
      return;
    }

    ['[data-slate="glow"]', '[data-slate="stick"]'].forEach((selector) => {
      const node = q(selector);
      if (node) gsap.killTweensOf(node);
    });

    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: onClapped });
    timelineRef.current = timeline;

    timeline
      /* 1 — the arm lifts, ready */
      .to(
        '[data-slate="stick"]',
        { rotate: -27, duration: 0.24, ease: 'power2.out', transformOrigin: '3% 100%' },
        0,
      )
      .to('[data-slate="stage"]', { scale: 1.05, duration: 0.5 }, 0)

      /* 2 — and it snaps. Hard, fast, no easing in. */
      .to(
        '[data-slate="stick"]',
        { rotate: 0, duration: 0.11, ease: 'power4.in', transformOrigin: '3% 100%' },
        0.34,
      )
      .to('[data-slate="stick"]', { rotate: -4.5, duration: 0.07 }, 0.45)
      .to('[data-slate="stick"]', { rotate: 0, duration: 0.09 }, 0.52)

      /* the whole frame takes the hit */
      .to(
        '[data-slate="body"]',
        {
          keyframes: [
            { x: -7, y: 3, rotate: -1.6, duration: 0.05 },
            { x: 6, y: -2, rotate: 1.4, duration: 0.05 },
            { x: -3, y: 1, rotate: -0.6, duration: 0.05 },
            { x: 0, y: 0, rotate: 0, duration: 0.07 },
          ],
        },
        0.45,
      )
      .to('[data-slate="crack"]', { opacity: 1, duration: 0.05 }, 0.45)
      .to('[data-slate="crack"]', { opacity: 0, duration: 0.35 }, 0.52)

      /* 3 — dust knocked out of the sticks */
      .to('[data-slate="dust"]', { opacity: 1, duration: 0.1 }, 0.46)
      .to(
        '[data-slate="dust"]',
        {
          x: () => (Math.random() - 0.5) * 220,
          y: () => -30 - Math.random() * 130,
          opacity: 0,
          duration: 1.5,
          ease: 'power2.out',
          stagger: 0.015,
        },
        0.5,
      )

      /* 4 — cut */
      .to('[data-slate="stage"]', { scale: 1.28, duration: 1.1, ease: 'power2.inOut' }, 0.6)
      .to('[data-slate="flash"]', { opacity: 1, duration: 0.9, ease: 'power2.in' }, 0.9)
      .to('[data-slate="stage"]', { opacity: 0.08, duration: 0.4 }, 1.55);
  }, [onClapped, onClapping, reducedMotion]);

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
      <div
        data-slate="flash"
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40 opacity-0"
        style={{
          background:
            'radial-gradient(circle at 50% 48%, rgba(255,253,246,0.97) 0%, rgba(243,233,212,0.75) 34%, rgba(227,185,114,0) 74%)',
        }}
      />

      {/**
       * The headroom is reserved here, inside the component, rather than left to
       * the parent: the stick swings well above the board when it's open, and it
       * used to collide with whatever sat above it.
       */}
      <div ref={tiltRef} className="w-full max-w-[19rem] pt-[32%] xs:max-w-[21rem] sm:max-w-[24rem]">
        <div data-slate="stage" className="relative gpu">
          <button
            type="button"
            onClick={clap}
            disabled={clapping}
            aria-label={label}
            className="group relative block w-full rounded-[2px] focus-visible:outline-offset-8 disabled:cursor-default"
          >
            <div
              data-slate="glow"
              aria-hidden="true"
              className="pointer-events-none absolute -inset-10 -z-10 rounded-full opacity-70 blur-2xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(227,185,114,0.3) 0%, rgba(194,222,217,0.12) 46%, transparent 74%)',
              }}
            />

            <div
              data-slate="body"
              className="relative w-full no-select gpu"
              style={{ aspectRatio: '1.32 / 1' }}
            >
              {/* ---- the hinged stick ---- */}
              <div
                data-slate="stick"
                className="absolute inset-x-0 top-[-8%] h-[15%] gpu"
                style={{ transformOrigin: '3% 100%', transform: 'rotate(-20deg)' }}
              >
                <div
                  className="h-full w-full rounded-[1px] shadow-[0_6px_14px_-6px_rgba(0,0,0,0.9)]"
                  style={{ backgroundImage: STRIPES }}
                />
                {/* the hinge */}
                <span
                  aria-hidden="true"
                  className="absolute -left-[1.5%] bottom-0 h-[42%] w-[5%] rounded-full bg-brass-400"
                />
              </div>

              {/* ---- the fixed lower stick ---- */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-[6%] h-[15%] rounded-[1px]"
                style={{ backgroundImage: STRIPES }}
              />

              {/* the impact flash between the sticks */}
              <div
                data-slate="crack"
                aria-hidden="true"
                className="absolute inset-x-0 top-[4%] h-[3px] opacity-0"
                style={{
                  background:
                    'linear-gradient(to right, transparent, rgba(255,253,246,0.95), transparent)',
                  filter: 'blur(1px)',
                }}
              />

              {/* ---- the board ---- */}
              <div
                className="absolute inset-x-0 bottom-0 top-[21%] overflow-hidden rounded-[2px] px-[6%] py-[5%]"
                style={{
                  background:
                    'linear-gradient(168deg, #22261f 0%, #14170f 52%, #0b0d0a 100%)',
                  boxShadow:
                    'inset 0 1px 0 rgba(238,229,210,0.14), 0 22px 44px -20px rgba(0,0,0,0.9)',
                }}
              >
                {/* chalk residue */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 opacity-[0.07]"
                  style={{
                    background:
                      'radial-gradient(circle at 24% 78%, #eee5d2 0%, transparent 38%), radial-gradient(circle at 78% 30%, #eee5d2 0%, transparent 32%)',
                  }}
                />

                {/* production */}
                <div className="relative border-b border-beam-100/12 pb-[4%]">
                  <p className="slug text-[0.5rem] text-beam-200/40 xs:text-[0.55rem]">Production</p>
                  <p className="mt-1 truncate font-display text-[1.05rem] tracking-[0.12em] text-beam-100/90 xs:text-[1.2rem] sm:text-[1.35rem]">
                    {board.production}
                  </p>
                </div>

                {/* the grid of fields */}
                <div className="relative mt-[4%] grid grid-cols-3 gap-[4%]">
                  {(
                    [
                      ['Scene', board.scene],
                      ['Take', board.take],
                      ['Dir.', board.director],
                    ] as const
                  ).map(([field, value]) => (
                    <div key={field} className="min-w-0">
                      <p className="slug text-[0.48rem] text-beam-200/40 xs:text-[0.52rem]">
                        {field}
                      </p>
                      <p className="mt-0.5 truncate font-script text-[0.95rem] font-bold text-beam-100/85 xs:text-[1.05rem]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ---- dust knocked loose by the clap ---- */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-[14%] z-30 flex justify-center"
              >
                {Array.from({ length: 16 }).map((_, index) => (
                  <span
                    key={index}
                    data-slate="dust"
                    className="absolute opacity-0"
                    style={{
                      left: `${6 + (index * 88) / 15}%`,
                      height: index % 3 === 0 ? '4px' : '2px',
                      width: index % 3 === 0 ? '4px' : '2px',
                      borderRadius: '9999px',
                      background: 'rgba(243,233,212,0.9)',
                      boxShadow: '0 0 8px rgba(243,233,212,0.7)',
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

export default Clapperboard;

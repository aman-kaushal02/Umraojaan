import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, useGsap } from '@/animations/gsap';
import { usePointerTilt } from '@/hooks/usePointerTilt';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface GiftBoxProps {
  label: string;
  /** Fired the moment the ribbon is pulled, before the timeline plays. */
  onOpening?: () => void;
  onOpened: () => void;
}

const BURST = 20;

/**
 * A gift box that has clearly been shaken before.
 *
 * Same construction philosophy as the envelope: pure CSS/SVG geometry, one
 * GSAP timeline, and a deliberate order of events — shake, ribbon, lid, light,
 * burst — so the reveal that follows feels earned.
 */
export function GiftBox({ label, onOpening, onOpened }: GiftBoxProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const openedRef = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [opening, setOpening] = useState(false);

  const reducedMotion = usePrefersReducedMotion();
  const tiltRef = usePointerTilt<HTMLDivElement>({ max: 10, shift: 12, disabled: opening });

  /* ---------------- idle ------------------------------------------------- */
  useGsap(
    rootRef,
    () => {
      if (reducedMotion) return;

      gsap.to('[data-gift="glow"]', {
        opacity: 0.9,
        scale: 1.14,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to('[data-gift="body"]', {
        keyframes: [
          { rotate: -1.4, duration: 0.1 },
          { rotate: 1.4, duration: 0.1 },
          { rotate: -0.8, duration: 0.1 },
          { rotate: 0, duration: 0.16 },
        ],
        repeat: -1,
        repeatDelay: 3.6,
        delay: 1.8,
        ease: 'none',
      });

      gsap.to('[data-gift="bow"]', {
        rotate: 2.2,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        transformOrigin: '50% 78%',
      });
    },
    [reducedMotion],
  );

  /* ---------------- opening --------------------------------------------- */
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

    const q = (selector: string) => scope.querySelector<HTMLElement>(selector);

    if (reducedMotion) {
      const lid = q('[data-gift="lid"]');
      if (lid) lid.style.opacity = '0';
      window.setTimeout(onOpened, 320);
      return;
    }

    ['[data-gift="glow"]', '[data-gift="body"]', '[data-gift="bow"]'].forEach((selector) => {
      const node = q(selector);
      if (node) gsap.killTweensOf(node);
    });
    gsap.set(q('[data-gift="body"]'), { rotate: 0 });

    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: onOpened });
    timelineRef.current = timeline;

    timeline
      /* 1 — it can't contain itself */
      .to('[data-gift="stage"]', { scale: 1.05, duration: 0.5 }, 0)
      .to(
        '[data-gift="body"]',
        {
          keyframes: [
            { x: -6, rotate: -2.4, duration: 0.08 },
            { x: 6, rotate: 2.4, duration: 0.08 },
            { x: -4, rotate: -1.6, duration: 0.08 },
            { x: 4, rotate: 1.6, duration: 0.08 },
            { x: 0, rotate: 0, duration: 0.1 },
          ],
        },
        0,
      )

      /* 2 — the ribbon pulls taut, then slackens */
      .to('[data-gift="bow"]', { scale: 1.22, rotate: -6, duration: 0.3 }, 0.34)
      .to('[data-gift="bow"]', { scale: 0.9, opacity: 0, y: -26, duration: 0.7 }, 0.66)
      .to('[data-gift="ribbon-v"]', { scaleY: 0, transformOrigin: 'top center', duration: 0.5 }, 0.7)

      /* 3 — the lid lifts and tips away */
      .to(
        '[data-gift="lid"]',
        { y: '-150%', rotate: -13, scale: 1.05, duration: 1.15, ease: 'power2.out' },
        0.72,
      )
      .to('[data-gift="lid"]', { opacity: 0, duration: 0.5 }, 1.35)

      /* 4 — light from inside */
      .to('[data-gift="inner-light"]', { opacity: 1, scaleY: 1, duration: 0.7 }, 0.85)
      .fromTo(
        '[data-gift="rays"]',
        { opacity: 0, scale: 0.5, rotate: 0 },
        { opacity: 0.85, scale: 1.4, rotate: 26, duration: 1.6, ease: 'power2.out' },
        0.95,
      )

      /* 5 — the burst */
      .to('[data-gift="spark"]', { opacity: 1, duration: 0.2, stagger: 0.02 }, 1)
      .to(
        '[data-gift="spark"]',
        {
          x: () => (Math.random() - 0.5) * 420,
          y: () => -60 - Math.random() * 320,
          rotate: () => (Math.random() - 0.5) * 320,
          opacity: 0,
          duration: 2.1,
          ease: 'power2.out',
          stagger: 0.02,
        },
        1.05,
      )

      /* 6 — camera pushes into the light */
      .to('[data-gift="stage"]', { scale: 1.4, duration: 1.6, ease: 'power2.inOut' }, 1.2)
      .to('[data-gift="bloom"]', { opacity: 1, duration: 1.2, ease: 'power2.in' }, 1.6)
      .to('[data-gift="stage"]', { opacity: 0.1, duration: 0.5 }, 2.5);
  }, [onOpened, onOpening, reducedMotion]);

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
        data-gift="bloom"
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40 opacity-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(255,253,249,0.95) 0%, rgba(247,231,201,0.7) 30%, rgba(173,91,107,0) 70%)',
        }}
      />

      <div ref={tiltRef} className="w-full max-w-[15rem] xs:max-w-[17rem] sm:max-w-[19rem]">
        <div data-gift="stage" className="relative gpu">
          <button
            type="button"
            onClick={open}
            disabled={opening}
            aria-label={label}
            className="group relative block w-full rounded-lg focus-visible:outline-offset-8 disabled:cursor-default"
          >
            <div
              data-gift="glow"
              aria-hidden="true"
              className="pointer-events-none absolute -inset-12 -z-10 rounded-full opacity-70 blur-2xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(224,190,134,0.4) 0%, rgba(238,191,200,0.18) 44%, transparent 72%)',
              }}
            />

            {/* light escaping from under the lid */}
            <div
              data-gift="inner-light"
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[6%] bottom-[64%] top-[-40%] origin-bottom opacity-0"
              style={{
                transform: 'scaleY(0.2)',
                background:
                  'linear-gradient(to top, rgba(255,253,249,0.9) 0%, rgba(247,231,201,0.45) 34%, rgba(247,231,201,0) 100%)',
                filter: 'blur(10px)',
              }}
            />

            {/* rotating rays */}
            <div
              data-gift="rays"
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[24%] h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 opacity-0"
              style={{
                background:
                  'conic-gradient(from 0deg, rgba(247,231,201,0.34) 0deg 6deg, transparent 6deg 22deg, rgba(238,191,200,0.26) 22deg 27deg, transparent 27deg 46deg, rgba(247,231,201,0.3) 46deg 51deg, transparent 51deg 74deg, rgba(238,191,200,0.22) 74deg 78deg, transparent 78deg 100deg)',
                maskImage:
                  'radial-gradient(circle, rgba(0,0,0,0.9) 12%, rgba(0,0,0,0.35) 46%, transparent 70%)',
                WebkitMaskImage:
                  'radial-gradient(circle, rgba(0,0,0,0.9) 12%, rgba(0,0,0,0.35) 46%, transparent 70%)',
              }}
            />

            <div
              data-gift="body"
              className="relative w-full no-select"
              style={{ aspectRatio: '1 / 1' }}
            >
              {/* box */}
              <div
                className="absolute inset-x-0 bottom-0 top-[20%] overflow-hidden rounded-[6px]"
                style={{
                  background:
                    'linear-gradient(155deg, #8f1c3c 0%, #7a1130 44%, #4d0c20 100%)',
                  boxShadow:
                    'inset 0 2px 0 rgba(255,255,255,0.14), inset -14px 0 26px -14px rgba(0,0,0,0.6), 0 26px 48px -22px rgba(0,0,0,0.8)',
                }}
              >
                {/* damask sheen */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 opacity-40"
                  style={{
                    background:
                      'repeating-linear-gradient(118deg, rgba(255,255,255,0.055) 0 2px, transparent 2px 9px)',
                  }}
                />
                {/* vertical ribbon */}
                <span
                  data-gift="ribbon-v"
                  aria-hidden="true"
                  className="absolute inset-y-0 left-1/2 w-[16%] -translate-x-1/2"
                  style={{
                    background:
                      'linear-gradient(to right, rgba(180,142,86,0.9) 0%, #f2dcae 32%, #e0be86 56%, rgba(160,124,74,0.95) 100%)',
                    boxShadow: '0 0 14px rgba(224,190,134,0.4)',
                  }}
                />
              </div>

              {/* lid */}
              <div data-gift="lid" className="absolute inset-x-[-4%] top-[8%] h-[22%] gpu">
                <div
                  className="relative h-full w-full rounded-[5px]"
                  style={{
                    background:
                      'linear-gradient(170deg, #a3234a 0%, #8f1c3c 40%, #61112a 100%)',
                    boxShadow:
                      'inset 0 2px 0 rgba(255,255,255,0.2), 0 12px 22px -12px rgba(0,0,0,0.8)',
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-1/2 w-[14%] -translate-x-1/2"
                    style={{
                      background:
                        'linear-gradient(to right, rgba(180,142,86,0.9) 0%, #f2dcae 32%, #e0be86 56%, rgba(160,124,74,0.95) 100%)',
                    }}
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-[22%]"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.32), transparent)' }}
                  />
                </div>

                {/* bow */}
                <svg
                  data-gift="bow"
                  aria-hidden="true"
                  viewBox="0 0 120 70"
                  className="absolute left-1/2 top-0 h-[92%] w-[62%] -translate-x-1/2 -translate-y-[62%] gpu"
                >
                  <defs>
                    <linearGradient id="bowGold" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#f7e7c9" />
                      <stop offset="45%" stopColor="#e0be86" />
                      <stop offset="100%" stopColor="#b08b4f" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M60 52 C42 52 18 44 14 26 C11 12 26 6 38 14 C48 21 56 36 60 52 Z"
                    fill="url(#bowGold)"
                    stroke="rgba(122,17,48,0.28)"
                    strokeWidth="1"
                  />
                  <path
                    d="M60 52 C78 52 102 44 106 26 C109 12 94 6 82 14 C72 21 64 36 60 52 Z"
                    fill="url(#bowGold)"
                    stroke="rgba(122,17,48,0.28)"
                    strokeWidth="1"
                  />
                  <path
                    d="M52 52 C56 60 64 60 68 52 C64 44 56 44 52 52 Z"
                    fill="url(#bowGold)"
                    stroke="rgba(122,17,48,0.3)"
                    strokeWidth="1"
                  />
                </svg>
              </div>

              {/* burst particles */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[24%] z-30 -translate-x-1/2"
              >
                {Array.from({ length: BURST }).map((_, index) => {
                  const heart = index % 4 === 0;
                  return (
                    <span
                      key={index}
                      data-gift="spark"
                      className="absolute opacity-0"
                      style={{
                        left: 0,
                        top: 0,
                        height: heart ? '10px' : '5px',
                        width: heart ? '10px' : '5px',
                        borderRadius: heart ? '50% 50% 12% 50%' : '9999px',
                        transform: heart ? 'rotate(-45deg)' : undefined,
                        background: heart
                          ? 'radial-gradient(circle at 34% 30%, #f6d9c4, #d2818f)'
                          : 'rgba(247,231,201,0.95)',
                        boxShadow: '0 0 12px rgba(247,231,201,0.75)',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default GiftBox;

import { useEffect, useId, useRef } from 'react';
import { gsap } from 'gsap';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

export type TulipVariant =
  | 'coral'
  | 'pink'
  | 'rose'
  | 'blush'
  | 'peach'
  | 'salmon';

interface TulipProps {
  variant: TulipVariant;
  /** Drives the whole bloom timeline. */
  open: boolean;
  /** Seconds to wait before the timeline starts. */
  delay?: number;
  onOpened?: () => void;
  className?: string;
  /** Skips the stem-draw and leaf-unfurl intro (used for the massed garden). */
  instant?: boolean;
}

/**
 * Palettes are built from real tulip stock: a deep shaded base, a saturated
 * mid, a light face catching the sun, and a much darker throat so the cup
 * reads as a cavity rather than a flat shape.
 */
const PALETTES: Record<
  TulipVariant,
  { deep: string; mid: string; light: string; face: string; throat: string }
> = {
  coral: { deep: '#a82e44', mid: '#dd4f66', light: '#f4899a', face: '#ffc4cd', throat: '#5d1826' },
  pink: { deep: '#ad3768', mid: '#df6396', light: '#f39ec0', face: '#ffd3e3', throat: '#5e1c3a' },
  rose: { deep: '#9c2354', mid: '#d2497f', light: '#ef8fb4', face: '#ffcbdf', throat: '#55112c' },
  blush: { deep: '#b85d6b', mid: '#e2939d', light: '#f7c3c8', face: '#ffe4e7', throat: '#6d3239' },
  peach: { deep: '#bd6434', mid: '#e5945c', light: '#f8c396', face: '#ffe6cf', throat: '#6b3719' },
  salmon: { deep: '#b23f36', mid: '#e06a58', light: '#f5a293', face: '#ffd2ca', throat: '#63201a' },
};

/* ------------------------------------------------------------------ *
 * Geometry. Everything hinges on the receptacle at (120, 232).
 * ------------------------------------------------------------------ */
const HINGE_X = 120;
const HINGE_Y = 208;
/**
 * Deliberately close to the hinge. A long stem makes the head read small at
 * any given rendered height, so the stem is cropped to a suggestion and the
 * flower gets most of the box.
 */
const BASE_Y = 344;

/**
 * One tepal, in absolute coordinates with its base at the receptacle.
 *
 * The important part is `bend`: the outward lean of the tip is baked into the
 * path itself. That means opening the flower only needs a *small* rotation at
 * the base — which is exactly what keeps the silhouette a tulip's goblet.
 * Rotating a straight petal far enough to look open produces a lotus instead.
 *
 * The blade is widest around 70% of its height and comes to a soft point, the
 * way a real tepal does, rather than being a symmetric lens.
 */
function tepal(length: number, halfWidth: number, bend: number): string {
  const L = length;
  const w = halfWidth;
  const tipX = HINGE_X + bend;

  return [
    `M ${HINGE_X} ${HINGE_Y}`,
    /* outer edge, sweeping up and away */
    `C ${HINGE_X - w * 0.85} ${HINGE_Y - L * 0.3}, ${HINGE_X - w * 0.98} ${HINGE_Y - L * 0.7}, ${tipX - w * 0.3} ${HINGE_Y - L * 0.96}`,
    /* the tip */
    `C ${tipX - w * 0.08} ${HINGE_Y - L * 1.03}, ${tipX + w * 0.1} ${HINGE_Y - L * 1.02}, ${tipX + w * 0.3} ${HINGE_Y - L * 0.94}`,
    /* inner edge, back down to the base */
    `C ${HINGE_X + w * 0.62} ${HINGE_Y - L * 0.66}, ${HINGE_X + w * 0.52} ${HINGE_Y - L * 0.26}, ${HINGE_X} ${HINGE_Y}`,
    'Z',
  ].join(' ');
}

/** A faint rib following the lean of the blade. */
function rib(length: number, bend: number): string {
  return [
    `M ${HINGE_X} ${HINGE_Y - 6}`,
    `Q ${HINGE_X + bend * 0.25} ${HINGE_Y - length * 0.55}, ${HINGE_X + bend * 0.62} ${HINGE_Y - length * 0.9}`,
  ].join(' ');
}

interface PetalSpec {
  id: string;
  length: number;
  halfWidth: number;
  bend: number;
  /** Negative rotation swings the tip back over the centre — a shut bud. */
  closed: number;
  open: number;
  layer: 'back' | 'mid' | 'front';
  /** Left-hand tepals are the same path, mirrored about the hinge. */
  mirror: boolean;
}

/**
 * Six tepals in three nested rings. Open, the outer ring flares widest, the
 * middle less, the front barely at all — so the flower reads as a vessel with
 * a visible throat rather than a flat rosette.
 */
const PETALS: PetalSpec[] = [
  { id: 'bl', length: 170, halfWidth: 48, bend: 44, closed: -18, open: 7, layer: 'back', mirror: true },
  { id: 'br', length: 170, halfWidth: 48, bend: 44, closed: -18, open: 7, layer: 'back', mirror: false },
  { id: 'ml', length: 176, halfWidth: 50, bend: 28, closed: -11, open: 4, layer: 'mid', mirror: true },
  { id: 'mr', length: 176, halfWidth: 50, bend: 28, closed: -11, open: 4, layer: 'mid', mirror: false },
  { id: 'fl', length: 166, halfWidth: 46, bend: 15, closed: -6, open: 2, layer: 'front', mirror: true },
  { id: 'fr', length: 166, halfWidth: 46, bend: 15, closed: -6, open: 2, layer: 'front', mirror: false },
];

/**
 * The front-centre tepal. Tall enough to close the notch the two inner petals
 * would otherwise leave at the top of the cup.
 */
const FRONT_CENTRE = { length: 172, halfWidth: 45, bend: 0, closed: 0, open: 2 };

/**
 * A single tepal. Left-hand petals reuse the same path mirrored about the
 * hinge, so both sides of the flower are guaranteed to match.
 */
function Tepal({
  spec,
  fill,
  ribColor,
  ribOpacity = 0,
}: {
  spec: PetalSpec;
  fill: string;
  ribColor?: string;
  ribOpacity?: number;
}) {
  const blade = tepal(spec.length, spec.halfWidth, spec.bend);

  return (
    <g data-petal={spec.id}>
      <g transform={spec.mirror ? `translate(${HINGE_X * 2} 0) scale(-1 1)` : undefined}>
        <path d={blade} fill={fill} />
        {ribColor && (
          <path
            d={rib(spec.length, spec.bend)}
            stroke={ribColor}
            strokeWidth="1.5"
            fill="none"
            opacity={ribOpacity}
            strokeLinecap="round"
          />
        )}
      </g>
    </g>
  );
}

export function Tulip({
  variant,
  open,
  delay = 0,
  onOpened,
  className = '',
  instant = false,
}: TulipProps) {
  const uid = useId().replace(/:/g, '');
  const rootRef = useRef<SVGSVGElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const c = PALETTES[variant];

  const openedRef = useRef(false);

  useEffect(() => {
    const svg = rootRef.current;
    if (!svg) return;

    const q = <T extends SVGElement>(sel: string) =>
      Array.from(svg.querySelectorAll<T>(sel));

    const petalOf = (id: string) => svg.querySelector<SVGGElement>(`[data-petal='${id}']`);
    const stem = svg.querySelector<SVGPathElement>('[data-stem]');
    const leaves = q<SVGPathElement>('[data-leaf]');
    const throat = svg.querySelector<SVGPathElement>('[data-throat]');
    const stamens = svg.querySelector<SVGGElement>('[data-stamens]');
    const dew = q<SVGEllipseElement>('[data-dew]');
    const sway = svg.querySelector<SVGGElement>('[data-sway]');
    const glow = svg.querySelector<SVGEllipseElement>('[data-glow]');

    /* ---------------- reduced motion: draw the end state ---------------- */
    if (reducedMotion) {
      PETALS.forEach((p) => {
        const el = petalOf(p.id);
        if (el) gsap.set(el, { rotation: open ? p.open : p.closed, svgOrigin: `${HINGE_X} ${HINGE_Y}` });
      });
      const fc = petalOf('fc');
      if (fc) {
        gsap.set(fc, {
          rotation: open ? FRONT_CENTRE.open : FRONT_CENTRE.closed,
          svgOrigin: `${HINGE_X} ${HINGE_Y}`,
        });
      }
      gsap.set([throat, stamens], { opacity: open ? 1 : 0 });
      gsap.set(dew, { opacity: open ? 1 : 0 });
      if (stem) gsap.set(stem, { strokeDashoffset: 0 });
      gsap.set(leaves, { scaleY: 1, opacity: 1 });
      if (glow) gsap.set(glow, { opacity: open ? 0.75 : 0.2 });
      return;
    }

    const ctx = gsap.context(() => {
      /* --------------------------- initial state -------------------------- */
      PETALS.forEach((p) => {
        const el = petalOf(p.id);
        if (el) gsap.set(el, { rotation: p.closed, svgOrigin: `${HINGE_X} ${HINGE_Y}` });
      });
      const fc = petalOf('fc');
      if (fc) {
        gsap.set(fc, {
          rotation: FRONT_CENTRE.closed,
          svgOrigin: `${HINGE_X} ${HINGE_Y}`,
        });
      }
      gsap.set([throat, stamens], { opacity: 0 });
      gsap.set(dew, { opacity: 0, scale: 0.4, transformOrigin: 'center' });
      if (glow) gsap.set(glow, { opacity: 0.16, scale: 0.85, transformOrigin: 'center' });

      /* Stem draws itself on. */
      if (stem && !instant) {
        const len = stem.getTotalLength();
        gsap.set(stem, { strokeDasharray: len, strokeDashoffset: len });
      }
      if (!instant) {
        gsap.set(leaves, { scaleY: 0, opacity: 0, transformOrigin: `${HINGE_X}px ${BASE_Y}px` });
      }

      /* ------------------------------ growth ------------------------------ */
      const grow = gsap.timeline({ delay });

      if (!instant) {
        if (stem) {
          grow.to(stem, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, 0);
        }
        grow.to(
          leaves,
          { scaleY: 1, opacity: 1, duration: 1.2, stagger: 0.18, ease: 'back.out(1.4)' },
          0.55,
        );
        /* The closed bud swells a touch as it finishes rising. */
        grow.from(
          '[data-head]',
          { scale: 0.55, y: 26, opacity: 0, transformOrigin: `${HINGE_X}px ${HINGE_Y}px`, duration: 1.1, ease: 'back.out(1.2)' },
          0.5,
        );
      }

      /* ------------------------------- bloom ------------------------------ */
      if (open) {
        const bloom = gsap.timeline({
          onComplete: () => {
            if (!openedRef.current) {
              openedRef.current = true;
              onOpened?.();
            }
            startIdle();
          },
        });

        /* A small inhale before the cup parts. */
        bloom.to('[data-head]', {
          scale: 1.05,
          transformOrigin: `${HINGE_X}px ${HINGE_Y}px`,
          duration: 0.5,
          ease: 'power2.out',
        });
        bloom.to('[data-head]', { scale: 1, duration: 0.7, ease: 'power2.inOut' }, '>-0.1');

        /* Outer ring leads, middle follows, inner parts last. */
        PETALS.forEach((p, i) => {
          const el = petalOf(p.id);
          if (!el) return;
          bloom.to(
            el,
            {
              rotation: p.open,
              svgOrigin: `${HINGE_X} ${HINGE_Y}`,
              duration: 2.2,
              /* Barely any overshoot — a tulip opens with weight, not a snap. */
              ease: 'elastic.out(0.45, 0.75)',
            },
            0.45 + i * 0.09,
          );
        });

        /* Front centre folds forward and shortens, opening the throat. */
        if (fc) {
          bloom.to(
            fc,
            {
              rotation: FRONT_CENTRE.open,
              scaleY: 0.84,
              y: 8,
              svgOrigin: `${HINGE_X} ${HINGE_Y}`,
              duration: 1.9,
              ease: 'power3.out',
            },
            0.85,
          );
        }

        bloom.to(throat, { opacity: 1, duration: 1.1, ease: 'power2.out' }, 1.0);
        bloom.to(
          stamens,
          { opacity: 1, duration: 0.9, ease: 'power2.out' },
          1.25,
        );
        bloom.from(
          '[data-stamens] > *',
          { scaleY: 0.3, transformOrigin: `${HINGE_X}px ${HINGE_Y}px`, duration: 1, stagger: 0.05, ease: 'back.out(2)' },
          1.25,
        );
        bloom.to(
          dew,
          { opacity: 1, scale: 1, duration: 0.7, stagger: 0.12, ease: 'back.out(3)' },
          1.5,
        );
        if (glow) {
          bloom.to(glow, { opacity: 0.72, scale: 1, duration: 1.6, ease: 'power2.out' }, 0.9);
        }

        grow.add(bloom, instant ? 0 : 1.15);
      } else {
        grow.add(startIdle);
      }

      /* ------------------------------- idle ------------------------------- */
      function startIdle() {
        if (sway) {
          gsap.to(sway, {
            rotation: 1.4,
            svgOrigin: `${HINGE_X} ${BASE_Y}`,
            duration: 4.2,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
          });
        }

        /* Closed buds breathe; open flowers let their petals drift. */
        if (!open) {
          gsap.to('[data-head]', {
            scaleX: 1.035,
            scaleY: 0.985,
            transformOrigin: `${HINGE_X}px ${HINGE_Y}px`,
            duration: 3.4,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
          });
          return;
        }

        [...PETALS.map((p) => [p.id, p.open] as const), ['fc', FRONT_CENTRE.open] as const].slice().forEach(
          ([id, base], i) => {
            const el = petalOf(id);
            if (!el) return;
            gsap.to(el, {
              rotation: base + (i % 2 === 0 ? 1.4 : -1.4),
              svgOrigin: `${HINGE_X} ${HINGE_Y}`,
              duration: 3.6 + i * 0.35,
              yoyo: true,
              repeat: -1,
              ease: 'sine.inOut',
            });
          },
        );

        gsap.to(dew, {
          opacity: 0.55,
          duration: 2.4,
          stagger: 0.4,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        });
      }
    }, svg);

    return () => ctx.revert();
  }, [open, delay, instant, reducedMotion, onOpened]);

  const g = (name: string) => `${uid}-${name}`;

  return (
    <svg
      ref={rootRef}
      viewBox="0 0 240 356"
      className={className}
      role="img"
      aria-label={`A ${variant} tulip, ${open ? 'in bloom' : 'still closed'}`}
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Back tepals sit in shade. */}
        <linearGradient id={g('back')} x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%" stopColor={c.throat} />
          <stop offset="45%" stopColor={c.deep} />
          <stop offset="100%" stopColor={c.mid} />
        </linearGradient>

        {/* Mid tepals: the saturated body of the flower. */}
        <linearGradient id={g('mid')} x1="0.2" y1="1" x2="0.8" y2="0">
          <stop offset="0%" stopColor={c.deep} />
          <stop offset="55%" stopColor={c.mid} />
          <stop offset="100%" stopColor={c.light} />
        </linearGradient>

        {/* Front tepals catch the light. */}
        <linearGradient id={g('front')} x1="0.3" y1="1" x2="0.7" y2="0">
          <stop offset="0%" stopColor={c.mid} />
          <stop offset="50%" stopColor={c.light} />
          <stop offset="100%" stopColor={c.face} />
        </linearGradient>

        {/* The cavity. */}
        <radialGradient id={g('throat')} cx="0.5" cy="0.9" r="0.85">
          <stop offset="0%" stopColor="#2a0a12" />
          <stop offset="60%" stopColor={c.throat} />
          <stop offset="100%" stopColor={c.deep} />
        </radialGradient>

        <linearGradient id={g('stem')} x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#5d9a6e" />
          <stop offset="45%" stopColor="#3f7a52" />
          <stop offset="100%" stopColor="#24462f" />
        </linearGradient>

        <linearGradient id={g('leaf')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#63a377" />
          <stop offset="55%" stopColor="#3c7550" />
          <stop offset="100%" stopColor="#1f3f2b" />
        </linearGradient>

        <radialGradient id={g('glow')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={c.light} stopOpacity="0.55" />
          <stop offset="100%" stopColor={c.light} stopOpacity="0" />
        </radialGradient>

        <radialGradient id={g('dew')} cx="0.35" cy="0.3" r="0.75">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        {/* Shades the base of the front tepal so the cup has a floor. */}
        <linearGradient id={g('tuck')} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor={c.throat} stopOpacity="0" />
          <stop offset="70%" stopColor={c.throat} stopOpacity="0.35" />
          <stop offset="100%" stopColor={c.throat} stopOpacity="0.75" />
        </linearGradient>

        {/* Softens the whole flower's cast shadow. */}
        <filter id={g('soft')} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {/* Halo behind the bloom. */}
      <ellipse
        data-glow
        cx={HINGE_X}
        cy={HINGE_Y - 70}
        rx="116"
        ry="124"
        fill={`url(#${g('glow')})`}
      />

      <g data-sway>
        {/* Cast shadow pooling at the base. */}
        <ellipse
          cx={HINGE_X}
          cy={BASE_Y + 6}
          rx="42"
          ry="8"
          fill="#000000"
          opacity="0.26"
          filter={`url(#${g('soft')})`}
        />

        {/* Stem. Drawn before the leaves so they overlap it. */}
        <path
          data-stem
          d={`M ${HINGE_X} ${HINGE_Y + 2} C ${HINGE_X - 6} ${HINGE_Y + 62}, ${HINGE_X + 5} ${HINGE_Y + 124}, ${HINGE_X - 1} ${BASE_Y}`}
          stroke={`url(#${g('stem')})`}
          strokeWidth="11"
          strokeLinecap="round"
          fill="none"
        />

        {/* Two strap leaves: broad, fleshy and arching, which is what actually
            distinguishes tulip foliage from a stalk with grass on it. The
            outer edge bows well away from the stem before curving back. */}
        {/* Left leaf. The outer and inner edges are deliberately pulled far
            apart so the blade has real width — a narrow gap here is what makes
            a leaf read as a blade of grass instead. */}
        <g data-leaf>
          <path
            d={`M ${HINGE_X - 2} ${BASE_Y - 2}
                Q ${HINGE_X - 94} ${BASE_Y - 38} ${HINGE_X - 106} ${BASE_Y - 152}
                Q ${HINGE_X - 44} ${BASE_Y - 76} ${HINGE_X + 2} ${BASE_Y - 2}
                Z`}
            fill={`url(#${g('leaf')})`}
          />
          <path
            d={`M ${HINGE_X - 2} ${BASE_Y - 6} Q ${HINGE_X - 69} ${BASE_Y - 57} ${HINGE_X - 104} ${BASE_Y - 148}`}
            stroke="#173324"
            strokeWidth="1.7"
            fill="none"
            opacity="0.3"
            strokeLinecap="round"
          />
        </g>

        {/* Right leaf: shorter, and it leaves the stem a little higher up. */}
        <g data-leaf>
          <path
            d={`M ${HINGE_X + 2} ${BASE_Y - 1}
                Q ${HINGE_X + 86} ${BASE_Y - 32} ${HINGE_X + 96} ${BASE_Y - 128}
                Q ${HINGE_X + 40} ${BASE_Y - 64} ${HINGE_X - 2} ${BASE_Y - 1}
                Z`}
            fill={`url(#${g('leaf')})`}
            opacity="0.95"
          />
          <path
            d={`M ${HINGE_X + 2} ${BASE_Y - 5} Q ${HINGE_X + 63} ${BASE_Y - 48} ${HINGE_X + 94} ${BASE_Y - 124}`}
            stroke="#173324"
            strokeWidth="1.6"
            fill="none"
            opacity="0.26"
            strokeLinecap="round"
          />
        </g>

        {/* ------------------------- the flower head ------------------------ */}
        <g data-head>
          {/* Outer ring */}
          {PETALS.filter((p) => p.layer === 'back').map((p) => (
            <Tepal key={p.id} spec={p} fill={`url(#${g('back')})`} />
          ))}

          {/* Middle ring */}
          {PETALS.filter((p) => p.layer === 'mid').map((p) => (
            <Tepal
              key={p.id}
              spec={p}
              fill={`url(#${g('mid')})`}
              ribColor={c.deep}
              ribOpacity={0.26}
            />
          ))}

          {/* The throat, revealed in the gap the rings open up. */}
          <path data-throat d={tepal(112, 26, 0)} fill={`url(#${g('throat')})`} />

          {/* Pistil and anthers. */}
          <g data-stamens>
            <path
              d={`M ${HINGE_X} ${HINGE_Y} L ${HINGE_X} ${HINGE_Y - 84}`}
              stroke="#f6e6a8"
              strokeWidth="4.5"
              strokeLinecap="round"
              opacity="0.9"
            />
            <ellipse cx={HINGE_X} cy={HINGE_Y - 88} rx="6" ry="9" fill="#e8d47f" />
            {[-20, -10, 10, 20].map((dx, i) => (
              <g key={i}>
                <path
                  d={`M ${HINGE_X} ${HINGE_Y - 6} Q ${HINGE_X + dx * 0.7} ${HINGE_Y - 42}, ${HINGE_X + dx} ${HINGE_Y - 64}`}
                  stroke="#d9c887"
                  strokeWidth="2.6"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.85"
                />
                <ellipse
                  cx={HINGE_X + dx}
                  cy={HINGE_Y - 68}
                  rx="3.8"
                  ry="7"
                  fill="#3f2a16"
                  transform={`rotate(${dx * 0.6} ${HINGE_X + dx} ${HINGE_Y - 68})`}
                />
              </g>
            ))}
          </g>

          {/* Inner ring */}
          {PETALS.filter((p) => p.layer === 'front').map((p) => (
            <Tepal
              key={p.id}
              spec={p}
              fill={`url(#${g('front')})`}
              ribColor={c.mid}
              ribOpacity={0.3}
            />
          ))}

          {/* Front-centre tepal — the wall of the cup facing us. */}
          <g data-petal="fc">
            <path
              d={tepal(FRONT_CENTRE.length, FRONT_CENTRE.halfWidth, FRONT_CENTRE.bend)}
              fill={`url(#${g('front')})`}
            />
            {/* A soft shadow where it tucks behind the inner ring. */}
            <path
              d={tepal(FRONT_CENTRE.length, FRONT_CENTRE.halfWidth, FRONT_CENTRE.bend)}
              fill={`url(#${g('tuck')})`}
              opacity="0.55"
            />
          </g>

          {/* Dew. */}
          <ellipse data-dew cx={HINGE_X - 22} cy={HINGE_Y - 112} rx="5.5" ry="7" fill={`url(#${g('dew')})`} />
          <ellipse data-dew cx={HINGE_X + 19} cy={HINGE_Y - 80} rx="4.2" ry="5.2" fill={`url(#${g('dew')})`} />
          <ellipse data-dew cx={HINGE_X + 6} cy={HINGE_Y - 138} rx="3.2" ry="4" fill={`url(#${g('dew')})`} />
        </g>
      </g>
    </svg>
  );
}

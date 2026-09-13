import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DRAW_GROUPS,
  formation,
  memories,
  scatter,
  segments,
  type CosmosPhase,
  type Point,
} from '../../data/cosmos';
import { pointerField } from '../../hooks/usePointerField';

/* ------------------------------------------------------------------ *
 * The nine.
 *
 * Two layouts live here. During the hunt the stars sit at scattered
 * positions mapped across the whole viewport. Once the last one is lit
 * they glide into a centred formation and the tulip inks itself in
 * between them.
 *
 * Proximity glow runs on a raF loop writing a CSS variable straight to
 * each node, so sweeping a cursor across the sky never re-renders React.
 * ------------------------------------------------------------------ */

interface Layout {
  w: number;
  h: number;
  scatterPx: Point[];
  formationPx: Point[];
  paths: Array<{ d: string; order: number }>;
}

function computeLayout(w: number, h: number): Layout {
  /* Insets keep the nine clear of the tally, the sound pill and the
     prompt line, whatever the viewport is doing. */
  const padX = Math.min(78, w * 0.1);
  const padTop = Math.min(120, h * 0.15);
  const padBottom = Math.min(122, h * 0.16);

  const scatterPx = scatter.map((p) => ({
    x: padX + p.x * (w - padX * 2),
    y: padTop + p.y * (h - padTop - padBottom),
  }));

  /* The tulip is taller than it is wide; drive it off height, then clamp. */
  let fh = h * 0.74;
  let fw = fh * 0.8;
  const maxW = w * 0.9;
  if (fw > maxW) {
    fw = maxW;
    fh = fw / 0.8;
  }
  const ox = (w - fw) / 2;
  const oy = (h - fh) / 2 - h * 0.02;

  const map = (p: Point) => ({ x: ox + p.x * fw, y: oy + p.y * fh });
  const formationPx = formation.map(map);

  const paths = segments.map((s) => {
    const a = map(s.from);
    const b = map(s.to);
    const c = map(s.ctrl);
    return {
      d: `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} Q ${c.x.toFixed(2)} ${c.y.toFixed(2)} ${b.x.toFixed(2)} ${b.y.toFixed(2)}`,
      order: s.order,
    };
  });

  return { w, h, scatterPx, formationPx, paths };
}

interface Props {
  phase: CosmosPhase;
  found: boolean[];
  activeIndex: number | null;
  /** She has been still a while — let the unlit nine breathe visibly. */
  hint: boolean;
  onFind: (index: number) => void;
  reducedMotion: boolean;
}

export function ConstellationLayer({
  phase,
  found,
  activeIndex,
  hint,
  onFind,
  reducedMotion,
}: Props) {
  const [vp, setVp] = useState(() => ({
    w: typeof window === 'undefined' ? 1200 : window.innerWidth,
    h: typeof window === 'undefined' ? 800 : window.innerHeight,
  }));

  useEffect(() => {
    let t = 0;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => setVp({ w: window.innerWidth, h: window.innerHeight }), 150);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const layout = useMemo(() => computeLayout(vp.w, vp.h), [vp.w, vp.h]);

  const gathered = phase === 'gathering' || phase === 'drawing' || phase === 'named' || phase === 'letter';
  const drawing = phase === 'drawing' || phase === 'named' || phase === 'letter';
  const interactive = phase === 'sky' && activeIndex === null;

  const positions = gathered ? layout.formationPx : layout.scatterPx;

  /* ---- proximity glow -------------------------------------------- */
  const nodeRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const coarse = useRef(false);

  useEffect(() => {
    coarse.current =
      typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    const radius = coarse.current ? 150 : 210;
    /* Touch has no hover, so a star can never be "swept". Give the nine a
       standing glow there instead, or they would be invisible. */
    const floor = coarse.current ? 0.3 : 0;

    const tick = () => {
      const px = pointerField.x;
      const py = pointerField.y;
      for (let i = 0; i < positions.length; i++) {
        const el = nodeRefs.current[i];
        if (!el) continue;
        const p = positions[i];
        const d = Math.hypot(px - p.x, py - p.y);
        let n = 1 - Math.min(1, d / radius);
        n = Math.max(floor, n * n * (3 - 2 * n)); // smoothstep, floored
        el.style.setProperty('--near', n.toFixed(3));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [positions, reducedMotion]);

  const handle = useCallback(
    (i: number) => {
      if (!interactive || found[i]) return;
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(14);
        } catch {
          /* not supported, fine */
        }
      }
      onFind(i);
    },
    [interactive, found, onFind],
  );

  const drawDelay = (order: number) => 0.35 + (order / DRAW_GROUPS) * 2.1;

  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      {/* ---- constellation lines ---- */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${layout.w} ${layout.h}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <filter id="lineGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="b" />
            </feMerge>
          </filter>
          <linearGradient id="lineInk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde9c8" />
            <stop offset="45%" stopColor="#f7c8dd" />
            <stop offset="100%" stopColor="#9fd8cf" />
          </linearGradient>
        </defs>

        {/* Bloom pass */}
        <g filter="url(#lineGlow)" opacity={phase === 'letter' ? 0.4 : 0.72}>
          {layout.paths.map((p, i) => (
            <motion.path
              key={`glow-${i}`}
              d={p.d}
              fill="none"
              stroke="url(#lineInk)"
              strokeWidth={2.6}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={
                drawing
                  ? { pathLength: 1, opacity: 1 }
                  : { pathLength: 0, opacity: 0 }
              }
              transition={{
                pathLength: {
                  duration: reducedMotion ? 0.01 : 1.5,
                  delay: reducedMotion ? 0 : drawDelay(p.order),
                  ease: [0.16, 1, 0.3, 1],
                },
                opacity: { duration: 0.5, delay: reducedMotion ? 0 : drawDelay(p.order) },
              }}
            />
          ))}
        </g>

        {/* Crisp pass */}
        <g opacity={phase === 'letter' ? 0.55 : 1}>
          {layout.paths.map((p, i) => (
            <motion.path
              key={`ink-${i}`}
              d={p.d}
              fill="none"
              stroke="url(#lineInk)"
              strokeWidth={1.15}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={
                drawing
                  ? { pathLength: 1, opacity: 0.95 }
                  : { pathLength: 0, opacity: 0 }
              }
              transition={{
                pathLength: {
                  duration: reducedMotion ? 0.01 : 1.5,
                  delay: reducedMotion ? 0 : drawDelay(p.order),
                  ease: [0.16, 1, 0.3, 1],
                },
                opacity: { duration: 0.5, delay: reducedMotion ? 0 : drawDelay(p.order) },
              }}
            />
          ))}
        </g>
      </svg>

      {/* ---- the nine ---- */}
      {positions.map((p, i) => {
        const lit = found[i];
        const isActive = activeIndex === i;
        return (
          <motion.button
            key={i}
            ref={(el) => {
              nodeRefs.current[i] = el;
            }}
            type="button"
            aria-label={
              lit ? `${memories[i].numeral} — ${memories[i].title}` : `An unnamed star, ${i + 1} of 9`
            }
            disabled={!interactive || lit}
            onClick={() => handle(i)}
            className={`star-node absolute left-0 top-0 grid h-[74px] w-[74px] place-items-center rounded-full ${
              interactive && !lit ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'
            }`}
            data-lit={lit ? 'true' : 'false'}
            data-hint={hint ? 'true' : 'false'}
            style={{ '--i': i } as React.CSSProperties}
            initial={{
              x: layout.scatterPx[i].x - 37,
              y: layout.scatterPx[i].y - 37,
              opacity: 0,
              scale: 0.4,
            }}
            animate={{
              x: p.x - 37,
              y: p.y - 37,
              opacity: 1,
              scale: isActive ? 1.35 : 1,
            }}
            transition={{
              x: {
                duration: reducedMotion ? 0.01 : gathered ? 2.5 : 0.9,
                delay: reducedMotion ? 0 : gathered ? i * 0.09 : 0.5 + i * 0.07,
                ease: [0.16, 1, 0.3, 1],
              },
              y: {
                duration: reducedMotion ? 0.01 : gathered ? 2.5 : 0.9,
                delay: reducedMotion ? 0 : gathered ? i * 0.09 : 0.5 + i * 0.07,
                ease: [0.16, 1, 0.3, 1],
              },
              opacity: { duration: 1.4, delay: reducedMotion ? 0 : 0.5 + i * 0.07 },
              scale: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
            }}
          >
            {/* far bloom */}
            <span className="star-node__bloom" />
            {/* diffraction cross */}
            <span className="star-node__cross" />
            <span className="star-node__cross star-node__cross--alt" />
            {/* seeking ring */}
            <span className="star-node__ring" />
            {/* the point itself */}
            <span className="star-node__core" />

            {lit && (
              <motion.span
                className="star-node__numeral"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: gathered ? 0.85 : 0.5, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                {memories[i].numeral}
              </motion.span>
            )}
          </motion.button>
        );
      })}

      {/* ---- flare on discovery ---- */}
      <AnimatePresence>
        {activeIndex !== null && (
          <motion.span
            key={`flare-${activeIndex}`}
            className="pointer-events-none absolute z-10"
            style={{
              left: layout.scatterPx[activeIndex].x,
              top: layout.scatterPx[activeIndex].y,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
            <motion.span
              className="star-flare__ring"
              initial={{ scale: 0.2, opacity: 0.9 }}
              animate={{ scale: 5.5, opacity: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.span
              className="star-flare__ring star-flare__ring--slow"
              initial={{ scale: 0.2, opacity: 0.6 }}
              animate={{ scale: 9, opacity: 0 }}
              transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1], delay: 0.14 }}
            />
            <motion.span
              className="star-flare__streak"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: [0, 0.85, 0] }}
              transition={{ duration: 1.3, ease: 'easeOut' }}
            />
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

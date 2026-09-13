import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { memories, type CosmosPhase } from '../data/cosmos';
import { pointerField } from './usePointerField';

const TOTAL = memories.length;

/* Beats, in ms, from the moment the last card closes. */
const GATHER_IN = 850;
const DRAW_IN = 3500;
const NAME_IN = 3900;

export interface Cosmos {
  phase: CosmosPhase;
  found: boolean[];
  foundCount: number;
  activeIndex: number | null;
  nudge: boolean;
  enterSky: () => void;
  findStar: (i: number) => void;
  closeCard: () => void;
  wish: () => void;
  lookAgain: () => void;
}

/**
 * Dev-only deep links so any beat of the story can be opened directly:
 *   ?phase=named&all=1   ?phase=sky&open=3
 * Stripped from production builds.
 */
function devOverrides() {
  if (!import.meta.env.DEV || typeof window === 'undefined') return null;
  const q = new URLSearchParams(window.location.search);
  const phase = q.get('phase') as CosmosPhase | null;
  if (!phase && !q.get('all') && !q.get('open')) return null;
  const open = q.get('open');
  return {
    phase: phase ?? 'sky',
    found: Array(TOTAL).fill(Boolean(q.get('all')) || Boolean(phase && phase !== 'sky')),
    activeIndex: open === null ? null : Number(open),
  };
}

export function useCosmos(): Cosmos {
  const dev = useRef(devOverrides()).current;
  const [phase, setPhase] = useState<CosmosPhase>(dev?.phase ?? 'overture');
  const [found, setFound] = useState<boolean[]>(
    () => dev?.found ?? (Array(TOTAL).fill(false) as boolean[]),
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(dev?.activeIndex ?? null);
  const [nudge, setNudge] = useState(false);
  const timers = useRef<number[]>([]);

  const foundCount = useMemo(() => found.filter(Boolean).length, [found]);

  const after = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach(window.clearTimeout);
    },
    [],
  );

  const enterSky = useCallback(() => setPhase('sky'), []);

  const findStar = useCallback((i: number) => {
    setFound((prev) => {
      if (prev[i]) return prev;
      const next = [...prev];
      next[i] = true;
      return next;
    });
    setActiveIndex(i);
    setNudge(false);
  }, []);

  const closeCard = useCallback(() => {
    setActiveIndex(null);
  }, []);

  /* When the ninth card closes, the sky takes over on its own. */
  const complete = foundCount === TOTAL;
  useEffect(() => {
    if (!complete || phase !== 'sky' || activeIndex !== null) return;
    after(GATHER_IN, () => setPhase('gathering'));
    after(GATHER_IN + DRAW_IN, () => setPhase('drawing'));
    after(GATHER_IN + DRAW_IN + NAME_IN, () => setPhase('named'));
  }, [complete, phase, activeIndex, after]);

  const wish = useCallback(() => setPhase('letter'), []);
  const lookAgain = useCallback(() => setPhase('named'), []);

  /* A gentle hint if she has been still for a while and is still hunting. */
  useEffect(() => {
    if (phase !== 'sky' || activeIndex !== null || complete) {
      setNudge(false);
      return;
    }
    const id = window.setInterval(() => {
      const idle = performance.now() - (pointerField.lastMove || 0);
      setNudge(idle > 9000);
    }, 1500);
    return () => window.clearInterval(id);
  }, [phase, activeIndex, complete]);

  return {
    phase,
    found,
    foundCount,
    activeIndex,
    nudge,
    enterSky,
    findStar,
    closeCard,
    wish,
    lookAgain,
  };
}

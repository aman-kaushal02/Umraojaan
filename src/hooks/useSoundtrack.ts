import { useCallback, useEffect, useRef, useState } from 'react';
import { cosmos } from '../data/cosmos';

/**
 * The looping score.
 *
 * The file may not be in place yet, so a missing or unplayable source is
 * treated as a normal state rather than an error: the toggle keeps
 * working for the synthesised layer and nothing throws.
 */
export interface Soundtrack {
  /** True when the user wants sound, regardless of whether the file exists. */
  wanted: boolean;
  toggle: () => void;
  /** Attempt playback. Safe to call repeatedly. */
  start: () => void;
  /** Fade the score under a spoken beat, then back up. */
  duck: (to: number, ms?: number) => void;
}

export function useSoundtrack(): Soundtrack {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [wanted, setWanted] = useState(true);
  const fade = useRef<number | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.src = cosmos.music.src;
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
    ref.current = audio;
    return () => {
      audio.pause();
      ref.current = null;
      if (fade.current) window.clearInterval(fade.current);
    };
  }, []);

  const rampTo = useCallback((target: number, ms: number) => {
    const audio = ref.current;
    if (!audio) return;
    if (fade.current) window.clearInterval(fade.current);
    const from = audio.volume;
    const start = performance.now();
    fade.current = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - start) / ms);
      audio.volume = Math.max(0, Math.min(1, from + (target - from) * t));
      if (t >= 1 && fade.current) {
        window.clearInterval(fade.current);
        fade.current = null;
      }
    }, 40);
  }, []);

  const start = useCallback(() => {
    const audio = ref.current;
    if (!audio || !wanted) return;
    const p = audio.play();
    if (p) p.then(() => rampTo(cosmos.music.volume, 2600)).catch(() => {});
  }, [wanted, rampTo]);

  const toggle = useCallback(() => {
    const next = !wanted;
    setWanted(next);
    const audio = ref.current;
    if (!audio) return;
    if (next) {
      const p = audio.play();
      if (p) p.then(() => rampTo(cosmos.music.volume, 900)).catch(() => {});
    } else {
      rampTo(0, 600);
      window.setTimeout(() => {
        if (!ref.current) return;
        if (ref.current.volume < 0.02) ref.current.pause();
      }, 700);
    }
  }, [wanted, rampTo]);

  const duck = useCallback(
    (to: number, ms = 1200) => {
      if (!wanted) return;
      rampTo(cosmos.music.volume * to, ms);
    },
    [wanted, rampTo],
  );

  return { wanted, toggle, start, duck };
}

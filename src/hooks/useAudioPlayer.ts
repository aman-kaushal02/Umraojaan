import { useCallback, useEffect, useRef, useState } from 'react';

interface AudioOptions {
  /** Path to the track. Empty string means "no music configured". */
  src: string;
  /** Target volume, 0–1. */
  volume?: number;
  /** Begin playing as soon as `unlocked` flips true. */
  autoStart?: boolean;
  /** True once the user has interacted — browsers require this before audio. */
  unlocked?: boolean;
  /** Fade duration in ms when starting/stopping. */
  fade?: number;
}

export interface AudioPlayer {
  /** The track exists and is playable. False when missing or unsupported. */
  available: boolean;
  playing: boolean;
  muted: boolean;
  toggle: () => void;
  toggleMute: () => void;
}

/**
 * Background music that behaves.
 *
 * - Never touches `play()` before a real user gesture.
 * - Fades in and out instead of clipping.
 * - If the file is missing or the codec is unsupported, `available` stays
 *   false and the UI simply hides the control. Nothing throws.
 */
export function useAudioPlayer({
  src,
  volume = 0.4,
  autoStart = true,
  unlocked = false,
  fade = 1400,
}: AudioOptions): AudioPlayer {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeFrame = useRef(0);
  const autoStarted = useRef(false);

  const [available, setAvailable] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  /* ---- element lifecycle ------------------------------------------- */
  useEffect(() => {
    if (!src) {
      setAvailable(false);
      return;
    }

    const audio = new Audio();
    audio.src = src;
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    const onReady = () => setAvailable(true);
    const onError = () => {
      setAvailable(false);
      setPlaying(false);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener('canplay', onReady);
    audio.addEventListener('loadeddata', onReady);
    audio.addEventListener('error', onError);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      cancelAnimationFrame(fadeFrame.current);
      audio.removeEventListener('canplay', onReady);
      audio.removeEventListener('loadeddata', onReady);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
      autoStarted.current = false;
    };
  }, [src]);

  /* ---- volume ramp ------------------------------------------------- */
  const rampTo = useCallback(
    (to: number, onDone?: () => void) => {
      const audio = audioRef.current;
      if (!audio) return;

      cancelAnimationFrame(fadeFrame.current);

      const from = audio.volume;
      const start = performance.now();
      const duration = Math.max(1, fade);

      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        /* easeInOutSine keeps the swell musical rather than linear. */
        const eased = 0.5 - Math.cos(Math.PI * t) / 2;
        audio.volume = Math.min(1, Math.max(0, from + (to - from) * eased));

        if (t < 1) {
          fadeFrame.current = requestAnimationFrame(step);
        } else {
          onDone?.();
        }
      };

      fadeFrame.current = requestAnimationFrame(step);
    },
    [fade],
  );

  const start = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const attempt = audio.play();
    if (attempt && typeof attempt.catch === 'function') {
      /* Blocked autoplay is expected, not an error worth surfacing. */
      attempt.catch(() => setPlaying(false));
    }
    rampTo(muted ? 0 : volume);
  }, [muted, rampTo, volume]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    rampTo(0, () => audio.pause());
  }, [rampTo]);

  /* ---- gesture-gated autostart ------------------------------------- */
  useEffect(() => {
    if (!available || !autoStart || !unlocked || autoStarted.current) return;
    autoStarted.current = true;
    start();
  }, [autoStart, available, start, unlocked]);

  /* ---- pause while the tab is hidden (battery + politeness) --------- */
  useEffect(() => {
    const onVisibility = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (document.hidden) {
        if (!audio.paused) {
          audio.dataset.resume = 'true';
          audio.pause();
        }
      } else if (audio.dataset.resume === 'true') {
        delete audio.dataset.resume;
        void audio.play().catch(() => undefined);
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    autoStarted.current = true;
    if (audio.paused) start();
    else stop();
  }, [start, stop]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      rampTo(next ? 0 : volume);
      return next;
    });
  }, [rampTo, volume]);

  return { available, playing, muted, toggle, toggleMute };
}

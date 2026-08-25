import { useCallback, useEffect, useRef, useState } from 'react';

interface AudioOptions {
  /** Path to the track. Empty string means "no music configured". */
  src: string;
  /** Target volume, 0–1. */
  volume?: number;
  /** Start as early as the browser allows. */
  autoplay?: boolean;
  /** True once the app has seen any interaction. Used as a last-resort trigger. */
  unlocked?: boolean;
  /** Fade duration in ms when starting/stopping. */
  fade?: number;
}

export interface AudioPlayer {
  /** The track exists and is playable. False when missing or unsupported. */
  available: boolean;
  playing: boolean;
  muted: boolean;
  /**
   * Begin playback. Call this synchronously from a real click handler — that
   * is the only thing iOS Safari reliably accepts. No-op if already playing.
   */
  start: () => void;
  toggle: () => void;
  toggleMute: () => void;
}

/**
 * Background music that starts as early as the browser will let it.
 *
 * Audible autoplay on a cold page load is blocked everywhere — Chrome gates it
 * behind its Media Engagement Index, Safari behind prior interaction with the
 * site, and iOS refuses outright. So playback is attempted in three ways:
 *
 *   1. Ask outright when the file becomes playable. On a returning visitor, or
 *      a desktop browser that already trusts the site, the music is playing
 *      before she has touched anything.
 *   2. `start()`, called straight from the opening button's click handler.
 *      This is the dependable path on a phone.
 *   3. A document-level fallback listening for the first *completed* gesture.
 *
 * Two hard-won details are load-bearing here. The fallback listens for
 * `touchend`/`click`/`keydown` and deliberately NOT `pointerdown`: iOS grants
 * user activation only once a gesture completes, so reacting to pointerdown
 * gets the play attempt refused. And the listeners are only detached once
 * playback actually succeeds — detaching on the first attempt would throw away
 * the later events that would have worked.
 *
 * A missing file or unsupported codec leaves `available` false and the UI hides
 * the control entirely. Nothing throws.
 */
export function useAudioPlayer({
  src,
  volume = 0.4,
  autoplay = true,
  unlocked = false,
  fade = 1400,
}: AudioOptions): AudioPlayer {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeFrame = useRef(0);
  /** True once audible playback has been achieved (or explicitly requested). */
  const startedRef = useRef(false);

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
    audio.autoplay = autoplay;
    audio.volume = 0;
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
      startedRef.current = false;
    };
  }, [autoplay, src]);

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

  /**
   * Go audible. Resolves true only if the browser actually allowed it, which
   * is what lets callers decide whether to keep waiting for a better moment.
   */
  const attemptPlay = useCallback((): Promise<boolean> => {
    const audio = audioRef.current;
    if (!audio) return Promise.resolve(false);
    if (!audio.paused) return Promise.resolve(true);

    audio.muted = false;
    /* iOS ignores volume assignment entirely, so this fade is a desktop nicety. */
    audio.volume = 0;

    const attempt = audio.play();

    if (!attempt || typeof attempt.then !== 'function') {
      /* Ancient browsers return void. Assume it worked and ramp anyway. */
      startedRef.current = true;
      rampTo(muted ? 0 : volume);
      return Promise.resolve(true);
    }

    return attempt
      .then(() => {
        startedRef.current = true;
        rampTo(muted ? 0 : volume);
        return true;
      })
      .catch(() => {
        setPlaying(false);
        return false;
      });
  }, [muted, rampTo, volume]);

  /** Imperative entry point for click handlers. */
  const start = useCallback(() => {
    void attemptPlay();
  }, [attemptPlay]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    rampTo(0, () => audio.pause());
  }, [rampTo]);

  /* ---- 1: ask outright, the moment the file is playable ------------- */
  useEffect(() => {
    if (!available || !autoplay || startedRef.current) return;
    void attemptPlay();
  }, [attemptPlay, autoplay, available]);

  /* ---- 3: fall back to the first *completed* gesture ---------------- */
  useEffect(() => {
    if (!available || !autoplay) return;

    /**
     * No `pointerdown` here, on purpose. iOS grants user activation only when
     * a gesture completes, so a pointerdown attempt is refused — and the old
     * version then unbound itself before the usable `touchend` ever arrived.
     */
    const events: (keyof DocumentEventMap)[] = ['touchend', 'click', 'keydown'];

    const unlock = (event: Event) => {
      if (!event.isTrusted || startedRef.current) return;

      /* Only stop listening once playback has genuinely begun. */
      void attemptPlay().then((ok) => {
        if (ok) detach();
      });
    };

    function detach() {
      events.forEach((type) => document.removeEventListener(type, unlock, true));
    }

    events.forEach((type) => document.addEventListener(type, unlock, true));
    return detach;
  }, [attemptPlay, autoplay, available]);

  /* ---- last resort: the app reported an interaction we didn't see ---- */
  useEffect(() => {
    if (!available || !autoplay || !unlocked || startedRef.current) return;
    void attemptPlay();
  }, [attemptPlay, autoplay, available, unlocked]);

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
    if (audio.paused) void attemptPlay();
    else stop();
  }, [attemptPlay, stop]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      rampTo(next ? 0 : volume);
      return next;
    });
  }, [rampTo, volume]);

  return { available, playing, muted, start, toggle, toggleMute };
}

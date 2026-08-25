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
  /** Audibly playing. Silent pre-rolling does not count. */
  playing: boolean;
  muted: boolean;
  toggle: () => void;
  toggleMute: () => void;
}

/**
 * Background music that starts as early as the browser will let it.
 *
 * Audible autoplay on a cold page load is blocked everywhere — Chrome gates it
 * behind its Media Engagement Index, Safari behind prior interaction with the
 * site, and iOS refuses outright. So this runs a three-stage strategy:
 *
 *   1. Ask for audible playback immediately. On a returning visitor, or a
 *      desktop browser that already trusts the site, this simply works and the
 *      music is playing before she has touched anything.
 *   2. If refused, start the track *muted* — which every browser does allow.
 *      The pipeline is live and the audio decoded, so there is no gap later.
 *   3. On the first trusted gesture, unmute, rewind to the top so she hears it
 *      from the beginning, and fade in. This happens inside the event's own
 *      call stack, which is the only thing iOS Safari accepts.
 *
 * A missing file or unsupported codec leaves `available` false and the UI
 * hides the control entirely. Nothing throws.
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
  const [rawPlaying, setRawPlaying] = useState(false);
  const [priming, setPriming] = useState(false);
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
      setRawPlaying(false);
    };
    const onPlay = () => setRawPlaying(true);
    const onPause = () => setRawPlaying(false);

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
      setPriming(false);
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

  /** Go audible from the top of the track. Safe to call inside a gesture. */
  const startAudible = useCallback(
    ({ rewind }: { rewind: boolean }) => {
      const audio = audioRef.current;
      if (!audio) return;

      startedRef.current = true;
      setPriming(false);
      audio.muted = false;
      if (rewind) {
        try {
          audio.currentTime = 0;
        } catch {
          /* Seeking before metadata is ready — harmless, it's already at 0. */
        }
      }
      audio.volume = 0;

      const attempt = audio.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(() => {
          startedRef.current = false;
          setRawPlaying(false);
        });
      }
      rampTo(muted ? 0 : volume);
    },
    [muted, rampTo, volume],
  );

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    rampTo(0, () => audio.pause());
  }, [rampTo]);

  /* ---- stage 1 & 2: the moment the file is playable ----------------- */
  useEffect(() => {
    if (!available || !autoplay || startedRef.current) return;

    const audio = audioRef.current;
    if (!audio) return;

    let cancelled = false;

    /* Stage 1 — ask for sound outright. */
    audio.muted = false;
    audio.volume = 0;
    const attempt = audio.play();

    if (attempt && typeof attempt.then === 'function') {
      attempt
        .then(() => {
          if (cancelled) return;
          startedRef.current = true;
          setPriming(false);
          rampTo(muted ? 0 : volume);
        })
        .catch(() => {
          if (cancelled) return;

          /* Stage 2 — refused. Roll it silently so it's warm and decoded. */
          audio.muted = true;
          audio.volume = muted ? 0 : volume;
          const silent = audio.play();
          if (silent && typeof silent.then === 'function') {
            silent
              .then(() => {
                if (!cancelled) setPriming(true);
              })
              .catch(() => {
                /* Even muted playback refused. Her first tap will do it. */
              });
          }
        });
    }

    return () => {
      cancelled = true;
    };
  }, [autoplay, available, muted, rampTo, volume]);

  /* ---- stage 3: the first trusted gesture --------------------------- */
  useEffect(() => {
    if (!available || !autoplay || startedRef.current) return;

    const events: (keyof DocumentEventMap)[] = [
      'pointerdown',
      'touchend',
      'keydown',
      'click',
    ];

    const unlock = (event: Event) => {
      if (!event.isTrusted || startedRef.current) return;
      detach();
      /* Rewind, so a silent pre-roll doesn't cost her the opening bars. */
      startAudible({ rewind: true });
    };

    function detach() {
      events.forEach((type) => document.removeEventListener(type, unlock, true));
    }

    events.forEach((type) => document.addEventListener(type, unlock, true));
    return detach;
  }, [autoplay, available, startAudible]);

  /* ---- last resort: the app reported an interaction we didn't see ---- */
  useEffect(() => {
    if (!available || !autoplay || !unlocked || startedRef.current) return;
    startAudible({ rewind: true });
  }, [autoplay, available, startAudible, unlocked]);

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

  const playing = rawPlaying && !priming;

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    /* Silently pre-rolling counts as "not playing", so this makes it audible. */
    if (audio.paused || priming) startAudible({ rewind: priming });
    else stop();
  }, [priming, startAudible, stop]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      rampTo(next ? 0 : volume);
      return next;
    });
  }, [rampTo, volume]);

  return { available, playing, muted, toggle, toggleMute };
}

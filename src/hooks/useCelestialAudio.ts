import { useCallback, useRef } from 'react';

/* ------------------------------------------------------------------ *
 * Synthesised chimes.
 *
 * The soundtrack file is a separate thing. This is the interaction layer:
 * a struck-bell voice built from three detuned partials with an
 * exponential decay, run through a short feedback tail so it sounds like
 * it is ringing in a large room rather than a browser.
 *
 * Every star owns a semitone offset, so the nine of them walk up a
 * pentatonic scale as she finds them. Nothing ever clashes.
 * ------------------------------------------------------------------ */

const ROOT = 261.63; // middle C

type Ctx = AudioContext & { _bus?: GainNode; _tail?: ConvolverNode };

function semitone(n: number) {
  return ROOT * Math.pow(2, n / 12);
}

/** A tiny synthetic room, generated once. */
function buildTail(ctx: AudioContext): ConvolverNode {
  const seconds = 2.6;
  const rate = ctx.sampleRate;
  const len = Math.floor(rate * seconds);
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      const t = i / len;
      /* Noise under a steep decay, thinned out over time so the tail is
         diffuse rather than gated. */
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 3.4) * (i < rate * 0.01 ? t * 100 : 1);
    }
  }
  const conv = ctx.createConvolver();
  conv.buffer = buf;
  return conv;
}

export interface CelestialAudio {
  unlock: () => void;
  /** A star lighting up. `tone` is a semitone offset. */
  chime: (tone: number) => void;
  /** Low swell for the moment the nine start moving. */
  swell: () => void;
  /** Airy rush for the meteor shower. */
  rush: () => void;
  /** Warm resolved chord for the finale. */
  resolve: () => void;
}

export function useCelestialAudio(): CelestialAudio {
  const ref = useRef<Ctx | null>(null);

  const ensure = useCallback((): Ctx | null => {
    if (typeof window === 'undefined') return null;
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;

    if (!ref.current) {
      const ctx = new AC() as Ctx;
      const bus = ctx.createGain();
      bus.gain.value = 0.9;
      const tail = buildTail(ctx);
      const wet = ctx.createGain();
      wet.gain.value = 0.5;
      bus.connect(ctx.destination);
      bus.connect(tail);
      tail.connect(wet);
      wet.connect(ctx.destination);
      ctx._bus = bus;
      ctx._tail = tail;
      ref.current = ctx;
    }
    if (ref.current.state === 'suspended') void ref.current.resume();
    return ref.current;
  }, []);

  const unlock = useCallback(() => {
    ensure();
  }, [ensure]);

  const chime = useCallback(
    (tone: number) => {
      const ctx = ensure();
      if (!ctx?._bus) return;
      const now = ctx.currentTime;
      const f = semitone(tone);

      /* Bell partials: fundamental, an octave, and a slightly sharp fifth. */
      const partials: Array<[number, number, number]> = [
        [1, 0.3, 2.6],
        [2.01, 0.14, 1.7],
        [2.99, 0.07, 1.1],
        [5.42, 0.028, 0.6],
      ];

      for (const [mult, gain, dur] of partials) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = f * mult;
        /* A hair of downward drift — struck metal never holds dead pitch. */
        osc.frequency.linearRampToValueAtTime(f * mult * 0.997, now + dur);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(gain, now + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        osc.connect(g);
        g.connect(ctx._bus);
        osc.start(now);
        osc.stop(now + dur + 0.05);
      }

      /* Strike transient. */
      const noise = ctx.createBufferSource();
      const nb = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.06), ctx.sampleRate);
      const nd = nb.getChannelData(0);
      for (let i = 0; i < nd.length; i++) {
        nd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / nd.length, 6);
      }
      noise.buffer = nb;
      const hp = ctx.createBiquadFilter();
      hp.type = 'bandpass';
      hp.frequency.value = f * 4;
      hp.Q.value = 0.8;
      const ng = ctx.createGain();
      ng.gain.value = 0.1;
      noise.connect(hp);
      hp.connect(ng);
      ng.connect(ctx._bus);
      noise.start(now);
    },
    [ensure],
  );

  const swell = useCallback(() => {
    const ctx = ensure();
    if (!ctx?._bus) return;
    const now = ctx.currentTime;
    for (const [mult, gain] of [
      [0.5, 0.16],
      [0.752, 0.1],
      [1.0, 0.07],
    ] as const) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = ROOT * mult;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(gain, now + 1.6);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 5.4);
      osc.connect(g);
      g.connect(ctx._bus);
      osc.start(now);
      osc.stop(now + 5.6);
    }
  }, [ensure]);

  const rush = useCallback(() => {
    const ctx = ensure();
    if (!ctx?._bus) return;
    const now = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * 3.2);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(600, now);
    bp.frequency.exponentialRampToValueAtTime(5200, now + 1.5);
    bp.frequency.exponentialRampToValueAtTime(900, now + 3.1);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.075, now + 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 3.1);
    src.connect(bp);
    bp.connect(g);
    g.connect(ctx._bus);
    src.start(now);
  }, [ensure]);

  const resolve = useCallback(() => {
    const ctx = ensure();
    if (!ctx?._bus) return;
    /* Major add9, spread wide and rolled in like a harp. */
    [0, 7, 12, 16, 19, 26].forEach((t, i) => {
      window.setTimeout(() => chime(t - 12), i * 170);
    });
  }, [chime, ensure]);

  return { unlock, chime, swell, rush, resolve };
}

# Reel One

Week two of a thirty-day countdown, built as a private screening.

A dark auditorium, a projector you switch on, a reel you thread yourself, an
Academy 3-2-1 leader, four old photographs run as scenes of a film, a
clapperboard, a premiere — and an ending that strikes out "The End" and replaces
it with "To be continued", because there are still weeks to go.

React 18 · TypeScript · Vite · Tailwind CSS · GSAP · Framer Motion

> Week one (the candlelit envelope, letter, polaroids and gift box) is preserved
> at the `v1-candlelight` tag.

---

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build into dist/
npm run preview  # preview the production build
```

---

## Make it yours

Everything personal lives in **one file**: `src/data/config.ts`.
No other file contains a name, a message or an asset path.

```ts
export const reelConfig = {
  name: 'Umraojaan',
  signature: '— Always yours',
  countdown: 'Twenty-three days to go',   // shown on the title card and the tail
  projector: { line: 'The house lights are down.', cta: 'Start the projector', ... },
  reel:      { monogram: 'U', canLabel: 'REEL 01 — ...', prompt: 'Thread the reel' },
  titles:    { title: 'Reel One', lines: ['…'] },
  screening: { frames: [ /* one entry per scene */ ] },
  slate:     { board: { production: 'REEL ONE', director: 'A.K.', scene: '05', take: '01' } },
  premiere:  { billing: '…', photo: '/reel/portrait.jpeg', paragraphs: ['…'] },
  end:       { struck: 'The End', replacement: 'To be continued', lastReel: { … } },
  music:     { src: '/music/our-song.mp3', volume: 0.42, autoplay: true },
};
```

### Photographs

Images live in `public/reel/`:

| File | Where it appears |
| --- | --- |
| `frame-01.jpeg` … `frame-04.jpeg` | the four scenes of the screening |
| `portrait.jpeg` | the final frame at the premiere |

Scene frames are shown at **9:16** (portrait), the premiere frame at **3:4**,
both centre-cropped, each inside real perforated film stock. A missing or
misspelled path shows an unexposed frame instead of a broken image — one absent
photo never breaks the projection.

### Music

`public/music/our-song.mp3`, looped.

No browser permits audible autoplay on a cold visit, so playback is attempted
three ways: outright when the file is ready, then from the **Start the
projector** click handler, then from the first completed gesture. Two details in
`useAudioPlayer` are load-bearing — the fallback listens for
`touchend`/`click`/`keydown` and deliberately **not** `pointerdown` (iOS only
grants activation once a gesture completes), and listeners detach only once
playback genuinely succeeds.

### The last reel

`end.lastReel` accepts any combination of a video, a voice note, one photograph
and a typed line. Put files in `public/reel/`. With nothing set it shows the
placeholder copy, so the button always leads somewhere.

---

## How it's put together

```
src/
  scenes/       one file per scene of the running order
  components/   FilmReel, CountdownLeader, FilmFrame, Clapperboard, TheatreStage…
  animations/   GSAP setup, Framer variants, canvas sprite cache
  hooks/        scene state machine, media queries, audio, pointer tilt
  data/         config.ts (yours to edit) + scenes.ts (running order & lighting)
  styles/       Tailwind layers, film textures, reduced-motion rules
```

- **Scene flow** is a small state machine (`hooks/useExperience.tsx`), not a
  router. Each scene declares its own lighting in `data/scenes.ts`, and one
  persistent projection layer cross-dissolves between them.
- **The reel, the leader and the clapperboard** are pure CSS/SVG geometry — no
  images — so they stay crisp at any size and can actually spin and snap.
- **Canvas work** (dust in the beam, the light flood at the premiere) uses
  pre-rendered sprites, a delta-timed loop, DPR capped at 2, and pauses when the
  tab is hidden.
- **Scroll reveals** use IntersectionObserver, never scroll listeners.

## Accessibility & motion

- Every interaction is a real `<button>`: touch, mouse and keyboard all work.
- Animated text exposes the full sentence via `aria-label`; fragments are hidden
  from assistive tech.
- Each scene is announced through a polite live region.
- `prefers-reduced-motion` is respected everywhere: the dust field and long
  timelines switch off and the story becomes a series of quiet cross-fades, with
  nothing gated behind an animation.

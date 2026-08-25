# A little something for you

An interactive digital love letter, built as a birthday surprise for one person.

The experience unfolds as a story rather than a page:

**Mystery → Envelope → Letter → Memories → Gift → Birthday Reveal → A quiet goodbye**

React 18 · TypeScript · Vite · Tailwind CSS · GSAP · Framer Motion

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
No other file contains names, messages or asset paths.

```ts
export const birthdayConfig = {
  name: 'Umraojaan',        // her name — used in the reveal
  signature: '— Always yours',
  intro:    { line: 'Someone left something special for you…', ... },
  envelope: { sealMonogram: 'U', addressedTo: 'to the one reading this', ... },
  letter:   { salutation: '…', lines: ['…', '…'] },
  memories: { items: [ /* one entry per chapter */ ] },
  gift:     { lines: ['But wait…', 'There’s still one thing left.'] },
  reveal:   { greeting: 'Happy Birthday', paragraphs: ['…'] },
  final:    { question: '…', answer: 'I’d still choose you.', surprise: { … } },
  music:    { src: '', volume: 0.42 },
};
```

### Photos

Drop images into `public/memories/` and point each memory at them:

```ts
{ chapter: 'Chapter 01', title: 'The Beginning', image: '/memories/first-day.jpg', alt: '…' }
```

The reveal scene takes one too — it appears as the thing inside the gift box:

```ts
reveal: { photo: '/memories/bday-box.jpeg', photoAlt: '…', photoCaption: 'thirty days early' }
```

Both are framed as 4:5 polaroids and centre-cropped, so portrait photos work
best. A missing or misspelled path shows a soft placeholder frame instead of a
broken image — one absent photo never breaks the page.

Use images around **1000px on the long edge**. They are displayed at roughly
320×400, so anything larger is wasted bytes.

### Music

The soundtrack lives at `public/music/our-song.mp3` and loops forever:

```ts
music: { src: '/music/our-song.mp3', title: 'Our song', volume: 0.42, autoplay: true }
```

**On autoplay.** No browser permits audible autoplay on a cold visit — Chrome
gates it behind its Media Engagement Index, Safari behind prior interaction with
the domain, iOS refuses outright. There is no way around this from code, so
playback is attempted three ways:

1. **Straight away**, the instant the file is playable. For a returning visitor,
   or a desktop browser that already trusts the domain, the music is playing
   before she touches anything.
2. **From the `Open it` button's own click handler** (`IntroScene`). This is the
   dependable path on a phone, and in practice the one that fires.
3. **A document-level fallback** listening for the first completed gesture.

Two details in `useAudioPlayer` are load-bearing, and both were bugs first:

- The fallback listens for `touchend`/`click`/`keydown` and deliberately **not**
  `pointerdown`. iOS grants user activation only once a gesture *completes*, so
  a pointerdown attempt gets refused.
- Listeners detach only once playback genuinely succeeds. Detaching on the first
  attempt threw away the later events that would have worked — which is exactly
  why the music used to need a manual tap on the control.

Set `autoplay: false` to leave it silent until she presses play, or `src: ''` to
remove the control entirely.

### The final surprise

`final.surprise` accepts any combination of a video, a voice note, one photo and
a handwritten line. Put files in `public/surprise/`. With nothing set, it shows
the `placeholder` copy, so the last button always leads somewhere.

---

## How it's put together

```
src/
  scenes/       one file per chapter of the story
  components/   the reusable pieces (Envelope, GiftBox, MemoryCard, …)
  animations/   GSAP setup, Framer variants, canvas sprite cache
  hooks/        scene state machine, media queries, audio, pointer tilt
  data/         config.ts (yours to edit) + scenes.ts (scene graph & lighting)
  styles/       Tailwind layers, paper textures, reduced-motion rules
```

- **Scene flow** is a small state machine (`hooks/useExperience.tsx`), not a
  router. Each scene declares its own lighting and particle mood in
  `data/scenes.ts`, and one persistent background cross-dissolves between them.
- **The envelope and the gift box** are pure CSS/SVG geometry — no images — so
  the flap can hinge in real 3D and everything stays crisp at any size.
- **Canvas work** (ambient dust, fireworks) uses pre-rendered sprites, a
  delta-timed loop, DPR capped at 2, and pauses when the tab is hidden.
- **Scroll reveals** use IntersectionObserver, never scroll listeners.

## Accessibility & motion

- Every interaction is a real `<button>`: touch, mouse and keyboard all work.
- Animated text exposes the full sentence via `aria-label`; the fragments are
  hidden from assistive tech.
- Each chapter is announced through a polite live region.
- `prefers-reduced-motion` is respected everywhere: the particle field and long
  timelines switch off and the story becomes a series of quiet cross-fades,
  with nothing gated behind an animation.

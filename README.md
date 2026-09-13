# Nine Lights

Week four of a four-week countdown — a night sky with nine stars hidden in it, one for every day left before her birthday.

She finds them one at a time. Each one opens into a memory. When the ninth is lit, the nine drift out of the void, settle into formation, and draw themselves into a tulip.

React 18 · TypeScript · Vite · Tailwind CSS · Framer Motion · Canvas 2D · Web Audio

> Week one (candlelit envelope, letter, polaroids, gift box) is at the `v1-candlelight` tag.
> Week two (cinema screening, filmstrip, Academy leader, clapperboard) is at the `v2-reel-one` tag.
> Week three (tulip garden, six blooms, dawn-to-dusk lighting) is at the `v3-in-bloom` tag.

---

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build into dist/
npm run preview  # preview the production build
```

---

## The arc

Six phases, driven by one state machine in `src/hooks/useCosmos.ts`. There is no router.

| Phase       | What happens                                                                 |
| ----------- | ---------------------------------------------------------------------------- |
| `overture`  | Title card over an already-living sky. One button: **Look up**.               |
| `sky`       | The hunt. Nine faint stars scattered across the viewport, a tally in the corner. |
| `gathering` | All nine found — they glide out of position into formation.                    |
| `drawing`   | The constellation inks itself in: crown, cup, petal seams, stem, leaves.       |
| `named`     | It is a tulip. Meteor shower starts. One button: **Make a wish**.              |
| `letter`    | The closing message, with the tulip a ghost behind the text.                   |

### Deep links (dev only)

Stripped from production builds, so they cost nothing:

```
?phase=named          jump straight to the finished tulip
?phase=letter         jump to the closing letter
?phase=sky&open=3     open the fourth memory card
?phase=sky&all=1      all nine already found
```

---

## Make it yours

Everything personal lives in **one file**: `src/data/cosmos.ts`.

```ts
export const cosmos = {
  name: 'Huma',
  endearment: 'Umraojaan',
  signature: '— Always yours',
  overture: { eyebrow: 'Week four of four', title: 'Nine Lights', cta: 'Look up', ... },
  sky:      { prompt: 'Find the nine that are waiting for you.', ... },
  named:    { title: 'A tulip, made of sky', cta: 'Make a wish', ... },
  letter:   { paragraphs: [ ... ], closing: 'See you on the twenty-second.' },
  music:    { src: '/music/week4.mp3', volume: 0.42 },
};

export const memories: StarMemory[] = [
  {
    numeral: 'I',
    label: 'Nine days out',
    title: 'The first time I noticed',
    note: 'Not the first time I saw you — the first time I looked and forgot to stop.',
    photo: '/stars/light-01.jpeg',
    tone: 0, // semitones above middle C — this star's chime
  },
  // ... eight more
];
```

Reorder, rewrite, or swap photos freely. The only rule is that `memories` stays nine
entries long, because nine stars is the whole conceit — the geometry in the same file
has exactly nine anchor points.

### Photos

Nine portraits in `public/stars/`, named `light-01.jpeg` through `light-09.jpeg`.
Source images live in `public/Huma/`. The plate is landscape and crops with
`object-position: 50% 28%`, which keeps a face in frame when the source is a
portrait phone photo.

### Music

`public/music/week4.mp3`, looped, fading in over 2.6s once she presses **Look up**.
It ducks to 42% under each memory card and swells for the meteor shower. A missing
or unplayable file is treated as a normal state, not an error — the synthesised
chimes still work and nothing throws.

### Geometry

Also in `src/data/cosmos.ts`, both normalised 0…1:

- `scatter` — where each star hides during the hunt, mapped across the whole viewport.
- `formation` — the nine anchor points of the tulip, mapped into a centred box.
- `segments` — quadratic curves between them, grouped by `order` so the shape draws
  itself from crown down to leaves. Some segments hang off loose points that hold no
  star, which is what gives the stem and leaf blades their shape.

---

## How it's built

```
src/
  App.tsx                     phase orchestration, sound cues, layer stacking
  scenes/cosmos/              Overture, NamedScene, LetterScene
  components/cosmos/
    StarFieldCanvas.tsx       the sky: plate, hero stars, motes, shooting stars
    ConstellationLayer.tsx    the nine + the tulip they become
    MeteorShower.tsx          the finale, in gusts
    MemoryCard.tsx            what a star opens into
    Atmosphere.tsx            aurora, airglow, vignette, grain
    SkyHud.tsx                tally, prompt, sound toggle
    SplitText.tsx             per-character reveal that keeps words unbroken
    StarButton.tsx            the one button
    LensGlow.tsx              telescope-lens cursor
  hooks/
    useCosmos.ts              phase machine + which stars are lit
    usePointerField.ts        one shared pointer source for every render loop
    useCelestialAudio.ts      synthesised chimes, swell, rush, resolve
    useSoundtrack.ts          the looping score, with ducking
    useAppHeight.ts           --app-height, immune to mobile URL bars
  data/cosmos.ts              yours to edit: copy, the nine, the geometry
  styles/index.css            Tailwind layers, night palette, reduced-motion rules
```

### The sky is a real render

`StarFieldCanvas` does three things at once:

1. A **static plate** is painted once into an offscreen canvas — nebulae as large
   radial gradients, the Milky Way as a band with 2,600 cluster stars crowding its
   spine, dark dust lanes in front of it, and 1,150 faint field stars everywhere else.
   It is oversized by 14% so the sky can wheel without showing an edge. Seeded RNG,
   so it is the same sky on every visit.
2. Around 130 **hero stars** are drawn live from three pre-baked sprites (bloom plus
   four-point diffraction spikes, in cool / neutral / warm), each twinkling at its own
   speed. Baking the sprites is what makes this cheap.
3. **Dust motes** sit close to the camera with exaggerated parallax. They are what
   actually sells the depth.

All three share one rotation around a pole below the horizon — about five degrees over
five minutes, the arc the real sky turns. Pointer or phone tilt adds a parallax offset
on top, scaled per layer.

### Pointer handling

Sixty React renders a second would be absurd, so pointer state lives in a plain mutable
object (`usePointerField`) that anything can read inside its own `requestAnimationFrame`
loop. Proximity glow on the nine is written straight to each node as a CSS variable
(`--near`), so sweeping a cursor across the sky re-renders nothing.

### Sound

No audio files beyond the score. `useCelestialAudio` builds a struck-bell voice from
four detuned partials with exponential decay, through a generated impulse response for
the room. Each star owns a semitone offset, so the nine walk up a pentatonic scale as
she finds them and nothing ever clashes.

### Reduced motion

`prefers-reduced-motion` is honoured throughout. Every delay and duration collapses,
the sky stops turning, parallax switches off, and the nine hold a standing glow instead
of reacting to proximity. Nothing is removed — the story still runs end to end.

---

## Accessibility

- Each star is a real `<button>` with a 74×74px hit area and a label that reads
  `"An unnamed star, 4 of 9"` before it is lit, then its title afterwards.
- The memory card is a proper `role="dialog"` with `aria-modal`, closable by Escape,
  Enter, or a tap outside it.
- `SplitText` exposes whole sentences via `aria-label` and hides the per-character
  fragments from assistive tech.
- Focus is visible as a warm outline with 6px of offset.
- Decorative canvas layers and gradients are all `aria-hidden`.

## Layout notes

The memory card is a three-role flex container — plate, body, footer — where only the
body scrolls. On a phone the photo caps at 38vh and the action stays pinned to the
bottom of the card, so it can never end up sitting on top of the writing. On desktop
the card turns horizontal and the text centres against the photo.

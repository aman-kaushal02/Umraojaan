# In Bloom

Week three of a thirty-day countdown — a tulip garden that blooms for you.

Six tulips, each holding a memory. As you walk the path, each bud unfurls with 3D petal transforms to reveal a photograph and a moment. The light shifts from dawn to dusk as you move through the garden, ending with a message among the fully bloomed flowers.

React 18 · TypeScript · Vite · Tailwind CSS · GSAP · Framer Motion

> Week one (candlelit envelope, letter, polaroids, gift box) is at the `v1-candlelight` tag.  
> Week two (cinema screening, filmstrip, Academy leader, clapperboard) is at the `v2-reel-one` tag.

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

```ts
export const gardenConfig = {
  name: 'Umraojaan',
  signature: '— Always yours',
  countdown: 'Sixteen days to go',
  gate: { title: 'In Bloom', subtitle: 'A garden made for you', ... },
  arrival: { lines: ['Six tulips.', ...], cta: 'Walk the path' },
  blooms: [
    { color: 'coral', memory: '/tulips/memory-01.jpeg', caption: '...', note: '...' },
    // ... 5 more
  ],
  garden: { lines: ['All six petals open now.', ...] },
  message: { paragraphs: ['Sixteen more days.', ...] },
  sunset: { line: 'The light is fading, but the garden remembers.', ... },
  music: { src: '/music/week3.mp3', volume: 0.45, autoplay: true },
};
```

### Photos

Six memory photos in `public/tulips/` named `memory-01.jpeg` through `memory-06.jpeg`. Each appears inside a blooming tulip as the story progresses. Centre-cropped 3:4 portrait aspect. Missing images show a gentle placeholder instead of breaking.

### Music

`public/music/week3.mp3`, looped. iOS-compatible autoplay with fallback gesture listeners (touchend/click/keydown). Music controller appears bottom-right for play/pause.

---

## How it's built

```
src/
  scenes/       GateScene, ArrivalScene, BloomScene (×6), GardenScene, SunsetScene
  components/   TulipBud (3D CSS petals), GardenStage (lighting + particles), SafeImage, AnimatedText
  hooks/        useExperience (scene state machine), useMusic (iOS audio), usePrefersReducedMotion
  data/         config.ts (yours to edit) + scenes.ts (flow + lighting definitions)
  styles/       Tailwind layers, garden palette, reduced-motion rules
```

- **Scene flow**: Simple state machine, not a router. 10 scenes (gate → arrival → 6 blooms → garden → sunset).
- **Lighting transitions**: 5 states (dawn/morning/day/afternoon/dusk) with gradient backgrounds, fog layers, dewdrop particles on canvas (delta-time loop, DPR capped at 2).
- **TulipBud component**: 6 petals arranged in circle with `transform-style: preserve-3d`, GSAP elastic bloom animation with staggered unfurl, stem growth from bottom, center stamen glow.
- **Reduced motion**: Every animation checks `usePrefersReducedMotion`. Particles, long timelines, and 3D transforms switch off — story remains fully navigable.

## Accessibility

- Every button is a real `<button>` with minimum 44×44px touch targets (48px on mobile).
- Animated text exposes full sentences via `aria-label`; fragments are hidden from assistive tech.
- Each scene transition is announced through live regions.
- Keyboard focus visible with soft pink outline.
- `prefers-reduced-motion` honored throughout — animations fade to simple opacity transitions.

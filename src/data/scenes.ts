/**
 * Scene graph + the "lighting rig".
 *
 * The experience is a controlled state machine rather than a scrolling page,
 * so each scene declares the ambience it wants. A single persistent
 * background layer interpolates between these moods, which keeps transitions
 * cinematic without mounting/unmounting canvases.
 */

export const SCENE_ORDER = [
  'intro',
  'envelope',
  'letter',
  'memories',
  'gift',
  'reveal',
  'finale',
] as const;

export type SceneId = (typeof SCENE_ORDER)[number];

export interface SceneMood {
  /** Three-stop radial ambience: core, mid, outer. */
  ambient: readonly [string, string, string];
  /** 0–1 strength of the central light bloom. */
  glow: number;
  /** Ambient particle field tuning. */
  particles: {
    /** Multiplier applied to the base particle budget. 0 disables the field. */
    density: number;
    /** Vertical drift in px/second (negative floats upward). */
    drift: number;
    /** Chance (0–1) that a spawned particle is a tiny heart instead of a dot. */
    heartChance: number;
    /** Particle tint stops. */
    palette: readonly string[];
  };
  /** Whether this scene owns the document scroll. */
  scrolls: boolean;
}

const DUST = ['#f7e7c9', '#eebfc8', '#e0be86', '#fbf5ec'] as const;
const EMBER = ['#e0be86', '#d2818f', '#f7e7c9'] as const;

export const sceneMoods: Record<SceneId, SceneMood> = {
  intro: {
    ambient: ['#2a0f22', '#12070f', '#070409'],
    glow: 0.5,
    particles: { density: 1, drift: -13, heartChance: 0.07, palette: DUST },
    scrolls: false,
  },
  envelope: {
    ambient: ['#3a1226', '#150b18', '#070409'],
    glow: 0.72,
    particles: { density: 1.15, drift: -10, heartChance: 0.12, palette: EMBER },
    scrolls: false,
  },
  letter: {
    ambient: ['#4a1a2c', '#1d0d1a', '#0a050c'],
    glow: 0.85,
    particles: { density: 0.7, drift: -8, heartChance: 0.1, palette: DUST },
    scrolls: false,
  },
  memories: {
    ambient: ['#2f1322', '#160a14', '#08040a'],
    glow: 0.42,
    particles: { density: 0.55, drift: -6, heartChance: 0.06, palette: DUST },
    scrolls: true,
  },
  gift: {
    ambient: ['#43122a', '#180a16', '#070409'],
    glow: 0.66,
    particles: { density: 1, drift: -12, heartChance: 0.16, palette: EMBER },
    scrolls: false,
  },
  reveal: {
    ambient: ['#5d1733', '#25091a', '#0a040b'],
    glow: 1,
    particles: { density: 1.35, drift: -16, heartChance: 0.24, palette: EMBER },
    scrolls: false,
  },
  finale: {
    ambient: ['#170a14', '#0a050c', '#040206'],
    glow: 0.3,
    particles: { density: 0.5, drift: -5, heartChance: 0.2, palette: DUST },
    scrolls: true,
  },
};

/** Human-readable labels for the progress indicator / screen readers. */
export const sceneLabels: Record<SceneId, string> = {
  intro: 'The invitation',
  envelope: 'The envelope',
  letter: 'The letter',
  memories: 'Our story',
  gift: 'The gift',
  reveal: 'The reveal',
  finale: 'The last page',
};

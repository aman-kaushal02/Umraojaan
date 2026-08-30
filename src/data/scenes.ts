/**
 * The running order, and the lighting state of the auditorium in each scene.
 *
 * The experience is a controlled state machine rather than a scrolling page, so
 * every scene declares how the room should look. One persistent projection
 * layer interpolates between these states, which means moving between scenes
 * reads as a change of light rather than a page swap.
 */

export const SCENE_ORDER = [
  'projector',
  'reel',
  'titles',
  'screening',
  'slate',
  'premiere',
  'end',
] as const;

export type SceneId = (typeof SCENE_ORDER)[number];

export interface SceneMood {
  /** Auditorium darkness: core, mid, outer. */
  house: readonly [string, string, string];
  /** 0–1 strength of the projector beam and the glow off the screen. */
  beam: number;
  /** 0–1 emulsion grain. Higher reads as older, rougher film. */
  grain: number;
  /** Dust caught in the beam. */
  dust: {
    /** Multiplier on the base mote budget. 0 disables the field. */
    density: number;
    /** Vertical drift in px/second (negative floats upward). */
    drift: number;
    /** Mote tints. */
    palette: readonly string[];
  };
  /** Whether this scene owns the document scroll. */
  scrolls: boolean;
}

const MOTES = ['#f3e9d4', '#e3b972', '#fffdf6'] as const;
const COOL_MOTES = ['#f3e9d4', '#c2ded9', '#e3b972'] as const;

export const sceneMoods: Record<SceneId, SceneMood> = {
  /* The lamp has only just struck. */
  projector: {
    house: ['#14110c', '#0a0c0a', '#050605'],
    beam: 0.55,
    grain: 0.5,
    dust: { density: 1, drift: -9, palette: MOTES },
    scrolls: false,
  },
  /* Threading up — the room is warmer, the lamp is steady. */
  reel: {
    house: ['#1b1610', '#0d0f0c', '#050605'],
    beam: 0.72,
    grain: 0.6,
    dust: { density: 1.2, drift: -11, palette: MOTES },
    scrolls: false,
  },
  /* Titles on the screen: the brightest thing in the room. */
  titles: {
    house: ['#221b12', '#0f110d', '#060706'],
    beam: 0.92,
    grain: 0.45,
    dust: { density: 0.8, drift: -7, palette: MOTES },
    scrolls: false,
  },
  /* Watching. Quieter, so the photographs carry it. */
  screening: {
    house: ['#15140f', '#0a0c0a', '#050605'],
    beam: 0.45,
    grain: 0.7,
    dust: { density: 0.5, drift: -5, palette: MOTES },
    scrolls: true,
  },
  /* On set, mid-take. */
  slate: {
    house: ['#1d1811', '#0c0e0b', '#050605'],
    beam: 0.72,
    grain: 0.55,
    dust: { density: 0.95, drift: -10, palette: COOL_MOTES },
    scrolls: false,
  },
  /* The screen floods. */
  premiere: {
    house: ['#33271a', '#141310', '#070806'],
    beam: 1,
    grain: 0.35,
    dust: { density: 1.35, drift: -14, palette: MOTES },
    scrolls: false,
  },
  /* The film runs out and the room goes quiet. */
  end: {
    house: ['#0e0d0a', '#070806', '#040403'],
    beam: 0.22,
    grain: 0.8,
    dust: { density: 0.45, drift: -4, palette: COOL_MOTES },
    scrolls: true,
  },
};

/** Shown on the frame counter and announced to assistive tech. */
export const sceneLabels: Record<SceneId, string> = {
  projector: 'The auditorium',
  reel: 'Threading the reel',
  titles: 'Opening titles',
  screening: 'The screening',
  slate: 'One more take',
  premiere: 'The premiere',
  end: 'The tail',
};

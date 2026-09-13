/* ------------------------------------------------------------------ *
 * Week Four — "Nine Lights"
 *
 * Nine stars hidden in a night sky. She finds them one at a time; each
 * one opens into a memory. When the last one is lit, the nine drift out
 * of the void and settle into the shape of a tulip, then the sky breaks
 * into a meteor shower.
 * ------------------------------------------------------------------ */

export type CosmosPhase =
  | 'overture' // title card, sky already alive behind it
  | 'sky' // exploration — she hunts for the nine
  | 'gathering' // the nine drift into formation
  | 'drawing' // the constellation lines ink themselves in
  | 'named' // the tulip is named, meteors fall
  | 'letter'; // the closing message

export interface StarMemory {
  /** Roman numeral shown on the plate. */
  numeral: string;
  /** Small label above the title. */
  label: string;
  title: string;
  note: string;
  photo: string;
  /** Semitone offset for this star's chime, relative to the root. */
  tone: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Segment {
  from: Point;
  to: Point;
  ctrl: Point;
  /** Draw order group — the tulip inks itself from crown to leaves. */
  order: number;
}

/* ------------------------------------------------------------------ *
 * Copy
 * ------------------------------------------------------------------ */

export const cosmos = {
  name: 'Huma',
  endearment: 'Umraojaan',
  signature: '— Always yours',

  overture: {
    eyebrow: 'Week four of four',
    title: 'Nine Lights',
    subtitle: 'Nine days. Nine stars. One sky, and it is yours.',
    line: 'Somewhere up there, nine of them are burning a little brighter than the rest.',
    cta: 'Look up',
    hint: 'Best with sound',
  },

  sky: {
    prompt: 'Find the nine that are waiting for you.',
    hintNear: 'Warmer.',
    hintTap: 'Tap it.',
    counterLabel: 'lights found',
    nudge: 'Move slowly. They only glow when you are close.',
  },

  gathering: {
    line: 'They are moving.',
  },

  drawing: {
    line: 'They were never scattered. They were waiting to line up.',
  },

  named: {
    eyebrow: 'Nine lights, one shape',
    title: 'A tulip, made of sky',
    line: 'Of course it was a tulip. It was always going to be a tulip.',
    cta: 'Make a wish',
  },

  letter: {
    paragraphs: [
      'Nine days from now, the world gets a little louder about how lucky it is to have you in it. I have been quietly saying it for weeks.',
      'Four weeks ago I sent you a letter. Then a cinema with only one seat in it. Then a garden of tulips that opened when you were ready.',
      'Tonight I ran out of things on the ground to give you, so I went looking upward. Nine stars, one for every day left, each one holding something I did not want to forget.',
      'You are the thing I look for first in a crowded sky. Not the brightest for the sake of being bright — the one that makes the rest of it make sense.',
      'Keep the tulip. It is drawn in light now, so it cannot wilt.',
    ],
    closing: 'See you on the twenty-second.',
    cta: 'Until your day',
  },

  music: {
    src: '/music/week4.mp3',
    volume: 0.42,
  },
} as const;

/* ------------------------------------------------------------------ *
 * The nine
 * ------------------------------------------------------------------ */

export const memories: StarMemory[] = [
  {
    numeral: 'I',
    label: 'Nine days out',
    title: 'The first time I noticed',
    note: 'Not the first time I saw you — the first time I looked and forgot to stop.',
    photo: '/stars/light-01.jpeg',
    tone: 0,
  },
  {
    numeral: 'II',
    label: 'Eight days out',
    title: 'That laugh',
    note: 'It arrives before you decide to let it. It is the most honest thing about you.',
    photo: '/stars/light-02.jpeg',
    tone: 2,
  },
  {
    numeral: 'III',
    label: 'Seven days out',
    title: 'The quiet ones',
    note: 'No plan, nothing happening, nobody watching. Somehow those are the ones I keep.',
    photo: '/stars/light-03.jpeg',
    tone: 4,
  },
  {
    numeral: 'IV',
    label: 'Six days out',
    title: 'How you carry a room',
    note: 'You walk in and the temperature changes. I have watched it happen and still cannot explain it.',
    photo: '/stars/light-04.jpeg',
    tone: 7,
  },
  {
    numeral: 'V',
    label: 'Five days out',
    title: 'Your stubborn heart',
    note: 'You care loudly, and you never once made it look like weakness.',
    photo: '/stars/light-05.jpeg',
    tone: 9,
  },
  {
    numeral: 'VI',
    label: 'Four days out',
    title: 'The tulips',
    note: 'You told me once and I never needed telling again. Every flower shop is about you now.',
    photo: '/stars/light-06.jpeg',
    tone: 12,
  },
  {
    numeral: 'VII',
    label: 'Three days out',
    title: 'Late conversations',
    note: 'The hours where neither of us should still be awake, and neither of us wants to be the one to go.',
    photo: '/stars/light-07.jpeg',
    tone: 14,
  },
  {
    numeral: 'VIII',
    label: 'Two days out',
    title: 'Every version of you',
    note: 'The dressed-up one, the sleepy one, the one mid-sentence. I have no favourite. I have all of them.',
    photo: '/stars/light-08.jpeg',
    tone: 16,
  },
  {
    numeral: 'IX',
    label: 'One day out',
    title: 'Tomorrow, and the rest',
    note: 'Whatever the sky does next, I would like to be standing under it with you.',
    photo: '/stars/light-09.jpeg',
    tone: 19,
  },
];

/* ------------------------------------------------------------------ *
 * Geometry
 *
 * Two coordinate spaces, both normalised 0…1:
 *   scatter   — mapped across the whole viewport (the hunt)
 *   formation — mapped into a centred square (the tulip)
 * ------------------------------------------------------------------ */

/** Where each star hides. Kept clear of the HUD corners. */
export const scatter: Point[] = [
  { x: 0.12, y: 0.21 },
  { x: 0.38, y: 0.06 },
  { x: 0.64, y: 0.14 },
  { x: 0.89, y: 0.29 },
  { x: 0.22, y: 0.47 },
  { x: 0.52, y: 0.36 },
  { x: 0.8, y: 0.6 },
  { x: 0.3, y: 0.79 },
  { x: 0.66, y: 0.93 },
];

/** Anchor points of the tulip, in draw-friendly order. */
export const formation: Point[] = [
  { x: 0.2, y: 0.2 }, // I    left petal tip
  { x: 0.38, y: 0.06 }, // II   crown left
  { x: 0.62, y: 0.06 }, // III  crown right
  { x: 0.8, y: 0.2 }, // IV   right petal tip
  { x: 0.3, y: 0.42 }, // V    cup left
  { x: 0.7, y: 0.42 }, // VI   cup right
  { x: 0.5, y: 0.53 }, // VII  cup base
  { x: 0.15, y: 0.79 }, // VIII leaf left
  { x: 0.86, y: 0.71 }, // IX   leaf right
];

const F = formation;

/** Loose points that shape the stem and leaf blades but hold no star. */
const stemTop: Point = { x: 0.5, y: 0.53 };
const stemFoot: Point = { x: 0.505, y: 0.95 };
const leafLeftRoot: Point = { x: 0.5, y: 0.74 };
const leafLeftTail: Point = { x: 0.503, y: 0.89 };
const leafRightRoot: Point = { x: 0.5, y: 0.66 };
const leafRightTail: Point = { x: 0.502, y: 0.81 };

export const segments: Segment[] = [
  /* Crown — three petals, outside in. */
  { from: F[0], to: F[1], ctrl: { x: 0.25, y: 0.09 }, order: 0 },
  { from: F[1], to: F[2], ctrl: { x: 0.5, y: -0.02 }, order: 0 },
  { from: F[2], to: F[3], ctrl: { x: 0.75, y: 0.09 }, order: 0 },

  /* Cup walls. */
  { from: F[0], to: F[4], ctrl: { x: 0.21, y: 0.31 }, order: 1 },
  { from: F[4], to: F[6], ctrl: { x: 0.33, y: 0.51 }, order: 1 },
  { from: F[6], to: F[5], ctrl: { x: 0.67, y: 0.51 }, order: 1 },
  { from: F[5], to: F[3], ctrl: { x: 0.79, y: 0.31 }, order: 1 },

  /* Petal seams, converging on the base. */
  { from: F[1], to: F[6], ctrl: { x: 0.42, y: 0.29 }, order: 2 },
  { from: F[2], to: F[6], ctrl: { x: 0.58, y: 0.29 }, order: 2 },

  /* Stem. */
  { from: stemTop, to: stemFoot, ctrl: { x: 0.542, y: 0.75 }, order: 3 },

  /* Leaf blades — each is two curves meeting at the tip, so it reads as a
     blade rather than a stray line. */
  { from: leafLeftRoot, to: F[7], ctrl: { x: 0.29, y: 0.66 }, order: 4 },
  { from: F[7], to: leafLeftTail, ctrl: { x: 0.28, y: 0.87 }, order: 4 },
  { from: leafRightRoot, to: F[8], ctrl: { x: 0.71, y: 0.58 }, order: 4 },
  { from: F[8], to: leafRightTail, ctrl: { x: 0.74, y: 0.79 }, order: 4 },
];

export const DRAW_GROUPS = 5;

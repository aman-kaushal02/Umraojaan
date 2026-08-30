/* =====================================================================
 *
 *   R E E L   O N E  —  T H E   O N L Y   F I L E   T O   E D I T
 *
 *   Week two of the countdown. Everything the screening says, shows and
 *   plays is defined here. No other file contains personal information.
 *
 *   Missing an asset? Leave the field as an empty string ('') or delete
 *   it. The projection degrades gracefully and never breaks.
 *
 * ===================================================================== */

export interface FilmScene {
  /** Board label, e.g. "Scene 01". */
  slate: string;
  /** Screenplay slug line, e.g. "INT. PHOTO STUDIO — DAY". */
  slug: string;
  /** Scene title. */
  title: string;
  /** Two or three sentences. Keep it spoken, not written. */
  note: string;
  /** Small typed caption under the frame. */
  footnote?: string;
  /**
   * Photograph. Put images in `public/reel/` and reference them as
   * '/reel/frame-01.jpeg'. A missing file shows an unexposed frame instead.
   */
  image?: string;
  /** Describe the photo for screen readers. Falls back to the title. */
  alt?: string;
}

export interface LastReelConfig {
  /** Small label on the reveal button. */
  buttonLabel: string;
  /** Heading shown once it's playing. */
  title: string;
  /** Optional video, e.g. '/reel/for-you.mp4'. */
  video?: string;
  videoPoster?: string;
  /** Optional voice note, e.g. '/reel/voice-note.m4a'. */
  audio?: string;
  /** Optional closing photograph. */
  photo?: string;
  photoAlt?: string;
  /** Typed closing note. Always shown if present. */
  note?: string;
  /** Shown when no media has been added yet. */
  placeholder: string;
}

export interface ReelConfig {
  /** Her name. Used in the billing and the premiere. */
  name: string;
  /** Signed at the very end, e.g. "— Aman". Leave '' to hide. */
  signature: string;
  /** How long until her birthday. Shown on the title card and the end board. */
  countdown: string;

  /** Scene 1 — the dark auditorium. */
  projector: {
    label: string;
    line: string;
    subline: string;
    cta: string;
    hint: string;
  };

  /** Scene 2 — threading the reel. */
  reel: {
    /** Engraved on the reel's centre boss. 1–2 characters. */
    monogram: string;
    /** Typed on the film can's label. */
    canLabel: string;
    tease: string;
    prompt: string;
  };

  /** Scene 3 — opening titles. */
  titles: {
    presents: string;
    title: string;
    subtitle: string;
    /** Revealed one line at a time, like credits. */
    lines: string[];
    cta: string;
  };

  /** Scene 4 — the screening itself. */
  screening: {
    label: string;
    heading: string;
    subheading: string;
    frames: FilmScene[];
    outro: string;
    cta: string;
  };

  /** Scene 5 — the clapperboard. */
  slate: {
    lines: string[];
    prompt: string;
    /** Chalked onto the board. */
    board: {
      production: string;
      director: string;
      scene: string;
      take: string;
    };
  };

  /** Scene 6 — the premiere. */
  premiere: {
    /** Small line above her name. */
    billing: string;
    /** The final frame. */
    photo?: string;
    photoAlt?: string;
    photoCaption?: string;
    /** Revealed paragraph by paragraph. */
    paragraphs: string[];
    cta: string;
  };

  /** Scene 7 — the tail. */
  end: {
    /** Struck through, because it isn't. */
    struck: string;
    /** What replaces it. */
    replacement: string;
    closing: string;
    lastReel: LastReelConfig;
    restart: string;
  };

  music: {
    /** Song path, e.g. '/music/our-song.mp3'. Leave '' to hide the control. */
    src: string;
    /** Shown in the music control's label. */
    title: string;
    /** 0 – 1 */
    volume: number;
    /** Start as early as the browser allows. See useAudioPlayer. */
    autoplay: boolean;
  };
}

export const reelConfig: ReelConfig = {
  name: 'Umraojaan',
  signature: '— Always yours',
  countdown: 'Twenty-three days to go',

  /* ---------------------------------------------------------------- */
  projector: {
    label: 'One reel · one seat · one viewer',
    line: 'The house lights are down.',
    subline: 'There’s a film here, and you’re the only one on the guest list.',
    cta: 'Start the projector',
    hint: 'Best watched with the sound on.',
  },

  /* ---------------------------------------------------------------- */
  reel: {
    monogram: 'U',
    canLabel: 'REEL 01 — PROPERTY OF THE ONLY VIEWER',
    tease: 'It’s already loaded. It just needs someone to start it.',
    prompt: 'Thread the reel',
  },

  /* ---------------------------------------------------------------- */
  titles: {
    presents: 'A film nobody else will ever see',
    title: 'Reel One',
    subtitle: 'Assembled from four prints and one unfair portrait',
    lines: [
      'I found some old photographs of you this week.',
      'Not the ones you post. The printed kind — the ones that live in an envelope in someone’s cupboard and come out about once a year.',
      'And I realised I’ve only ever met the last few minutes of you.',
      'So I put the rest in order and made you a film.',
    ],
    cta: 'Roll it',
  },

  /* ---------------------------------------------------------------- */
  screening: {
    label: 'Now screening',
    heading: 'Four prints, in order.',
    subheading: 'Scroll slowly. The projector isn’t in a hurry.',
    frames: [
      {
        slate: 'Scene 01',
        slug: 'INT. PHOTO STUDIO — RED BACKDROP',
        title: 'The First Take',
        note:
          'Someone stood you in front of a red curtain and told you to look at the camera. Hands already on your hips. Completely unbothered. You have not changed as much as you think.',
        footnote: 'print no. 01 — held up to the light',
        image: '/reel/frame-01.jpeg',
        alt: 'A hand holding a printed studio photograph of Umraojaan as a small child',
      },
      {
        slate: 'Scene 02',
        slug: 'INT. BEDROOM MIRROR — AFTERNOON',
        title: 'The One Who Hid',
        note:
          'A phone exactly where your face should be. I know this version of you — the one who hadn’t decided yet whether she wanted to be looked at. I’d have looked anyway.',
        footnote: 'print no. 02 — slightly out of focus, kept anyway',
        image: '/reel/frame-02.jpeg',
        alt: 'A soft, washed-out mirror photograph, a phone held up over her face',
      },
      {
        slate: 'Scene 03',
        slug: 'INT. ROOM BY THE WINDOW — LATE LIGHT',
        title: 'The Light Found You',
        note:
          'Blue and gold, and a curtain doing its best to hold the afternoon back. You’re looking straight down the lens like you already know how this scene ends.',
        footnote: 'print no. 03 — available light, no retouching',
        image: '/reel/frame-03.jpeg',
        alt: 'Umraojaan by a window in a blue and gold outfit, light glowing through the curtain',
      },
      {
        slate: 'Scene 04',
        slug: 'EXT. WHEREVER YOU WERE — LAUGHING',
        title: 'The Real One',
        note:
          'This is the take I’d keep. Mid-laugh, a bit shaky, one small blue eye watching over you from the top of the frame. Nothing about it is posed, which is exactly why it’s the best thing in the reel.',
        footnote: 'print no. 04 — the one I’d put on the poster',
        image: '/reel/frame-04.jpeg',
        alt: 'A close, laughing photograph of Umraojaan in orange with silver earrings',
      },
    ],
    outro: 'That’s the archive. Now the part I actually made this for.',
    cta: 'One more take',
  },

  /* ---------------------------------------------------------------- */
  slate: {
    lines: ['Quiet on set.', 'There’s one more take.'],
    prompt: 'Clap the board',
    board: {
      production: 'REEL ONE',
      director: 'A.K.',
      scene: '05',
      take: '01',
    },
  },

  /* ---------------------------------------------------------------- */
  premiere: {
    billing: 'And starring, in every single frame',
    photo: '/reel/portrait.jpeg',
    photoAlt: 'Umraojaan now — looking back over her shoulder, lit low and warm',
    photoCaption: 'and this is her now',
    paragraphs: [
      'Four old prints, and then this. Same person. Somehow entirely different.',
      'I don’t think you know how good the difference is. The girl with her hands on her hips grew into someone who walks into a room and quietly rearranges it.',
      'So this is week two of waiting for your birthday, and I’ve run out of ways to be casual about it.',
      'May Allah keep you in good health, in good company, and in that ridiculous goofy laugh of yours.',
    ],
    cta: 'Let it run out',
  },

  /* ---------------------------------------------------------------- */
  end: {
    struck: 'The End',
    replacement: 'To be continued',
    closing: 'There are still a few reels left in this.',
    lastReel: {
      buttonLabel: 'There’s something after the credits',
      title: 'Reel 02 — not for release',
      /* Drop files into `public/reel/` and add the paths here. */
      video: '',
      videoPoster: '',
      audio: '',
      photo: '',
      photoAlt: '',
      note: 'Same time next week. I’m not running out of ideas, I’m just pacing myself.',
      placeholder: 'The next reel is still being cut.',
    },
    restart: 'Play it again',
  },

  /* ---------------------------------------------------------------- */
  music: {
    src: '/music/our-song.mp3',
    title: 'Reel One',
    volume: 0.42,
    autoplay: true,
  },
};

export default reelConfig;

/* =====================================================================
 *
 *   ❤  T H E   O N L Y   F I L E   Y O U   N E E D   T O   E D I T  ❤
 *
 *   Everything the experience says, shows and plays is defined here.
 *   Change the words, swap the photos, drop in a song — nothing else
 *   in the codebase contains personal information.
 *
 *   Missing an asset? Leave the field as an empty string ('') or delete
 *   it. The site degrades gracefully and never breaks.
 *
 * ===================================================================== */

export interface Memory {
  /** Chapter label, e.g. "Chapter 01". Rendered as a small kicker. */
  chapter: string;
  /** Chapter heading, e.g. "The Beginning". */
  title: string;
  /** 1–3 sentences. Keep it intimate, not long. */
  description: string;
  /** Small date caption under the photo, e.g. "August 2025". */
  date?: string;
  /** Optional handwritten-style line shown beneath the photo. */
  quote?: string;
  /**
   * Photo path. Put your images in `public/memories/` and reference them
   * as '/memories/your-photo.jpg'. If the file is missing, an elegant
   * placeholder frame is shown instead.
   */
  image?: string;
  /** Describe the photo for screen readers. Falls back to the title. */
  alt?: string;
  /** Tilt of the polaroid in degrees. Small values look best (-6…6). */
  tilt?: number;
}

export interface FinalSurpriseConfig {
  /** Small label on the reveal button. */
  buttonLabel: string;
  /** Heading shown once the surprise is open. */
  title: string;
  /** Optional video file, e.g. '/surprise/for-you.mp4'. */
  video?: string;
  /** Optional poster image for the video. */
  videoPoster?: string;
  /** Optional voice note, e.g. '/surprise/voice-note.m4a'. */
  audio?: string;
  /** Optional single closing photo. */
  photo?: string;
  photoAlt?: string;
  /** Handwritten closing note. Always shown if present. */
  handwritten?: string;
  /** Shown when no media has been added yet. */
  placeholder: string;
}

export interface BirthdayConfig {
  /** Her name. Used in the reveal and the final scene. */
  name: string;
  /** Signed at the very end, e.g. "— Aman". Leave '' to hide. */
  signature: string;

  intro: {
    kicker: string;
    line: string;
    subline: string;
    cta: string;
    hint: string;
  };

  envelope: {
    /** Monogram engraved on the wax seal. 1–2 characters. */
    sealMonogram: string;
    /** Line addressed on the front of the envelope. */
    addressedTo: string;
    tease: string;
    prompt: string;
  };

  /** The first letter. Each string is revealed one after another. */
  letter: {
    salutation: string;
    lines: string[];
    cta: string;
  };

  memories: {
    kicker: string;
    heading: string;
    subheading: string;
    items: Memory[];
    /** One last line after the final chapter, before the button. */
    outro: string;
    cta: string;
  };

  gift: {
    lines: string[];
    prompt: string;
  };

  reveal: {
    /** Small line set above her name. */
    greeting: string;
    /** Optional photograph, revealed as the thing inside the gift box. */
    photo?: string;
    photoAlt?: string;
    /** Handwritten caption under the photograph. */
    photoCaption?: string;
    /** Revealed paragraph by paragraph. */
    paragraphs: string[];
    cta: string;
  };

  final: {
    /** Two-beat closing. First line, pause, then the answer. */
    question: string;
    answer: string;
    closing: string;
    surprise: FinalSurpriseConfig;
    restart: string;
  };

  music: {
    /** Song path, e.g. '/music/our-song.mp3'. Leave '' to hide the control. */
    src: string;
    /** Shown in the music control tooltip. */
    title: string;
    /** 0 – 1 */
    volume: number;
    /**
     * Start the track as early as the browser allows.
     *
     * Audible autoplay on a cold visit is blocked by every modern browser, so
     * the player asks for sound immediately, falls back to rolling the track
     * muted, and goes audible from the top on the first gesture. Set false to
     * leave it silent until she presses play herself.
     */
    autoplay: boolean;
  };
}

export const birthdayConfig: BirthdayConfig = {
  name: 'Umraojaan',
  signature: '— Always yours',

  /* ---------------------------------------------------------------- */
  intro: {
    kicker: 'For you, and only you',
    line: 'Someone left something special for you…',
    subline: 'Are you curious enough to open it?',
    cta: 'Open it',
    hint: 'Take your time. It waited this long for you.',
  },

  /* ---------------------------------------------------------------- */
  envelope: {
    sealMonogram: 'U',
    addressedTo: 'to the one reading this',
    tease: "There's a little something inside…",
    prompt: 'Tap the envelope',
  },

  /* ---------------------------------------------------------------- */
  letter: {
    salutation: 'If you’re reading this…',
    lines: [
      'then you’ve finally found the little surprise I made for you.',
      'I spent longer on this than I’ll ever admit — rewriting lines, moving things a pixel to the left, smiling at my screen like someone who has clearly lost it.',
      'But this isn’t the end.',
      'It’s only the beginning.',
    ],
    cta: 'Continue',
  },

  /* ---------------------------------------------------------------- */
  memories: {
    kicker: 'Chapter one of many',
    heading: 'Do you remember…?',
    subheading: 'Scroll slowly. Some of these still make me laugh out loud.',
    items: [
      {
        chapter: 'Chapter 01',
        title: 'The Beginning',
        description:
          'The day everything quietly rearranged itself. I didn’t know it yet, but that was the last ordinary day of my life.',
        date: 'Where it started',
        quote: 'I remember thinking: please let this one stay.',
        image: '/memories/Chapter-1.jpeg',
        alt: 'A photograph of us from the very beginning',
        tilt: -4,
      },
      {
        chapter: 'Chapter 02',
        title: 'The Little Moments',
        description:
          'Not the big occasions. The 2am conversations, the shared earphone, the way you steal food off my plate and pretend you didn’t.',
        date: 'Every ordinary Tuesday',
        quote: 'Turns out the small things were the whole thing.',
        image: '/memories/Chapter-2.jpeg',
        alt: 'A candid photograph of an ordinary, perfect day together',
        tilt: 3.5,
      },
      {
        chapter: 'Chapter 03',
        title: 'The Memories',
        description:
          'Places we went, songs that became ours, that one photo where we both look terrible and it’s still my favourite.',
        date: 'Somewhere along the way',
        quote: 'We were so busy being happy we forgot to take pictures.',
        image: '/memories/Chapter-3.jpeg',
        alt: 'A photograph from one of our favourite days together',
        tilt: -2.5,
      },
      {
        chapter: 'Chapter 04',
        title: 'The Things I Love About You',
        description:
          'Your laugh, three seconds before you actually find it funny. Your stubbornness. The way you care about people quietly, without needing credit.',
        date: 'Still counting',
        quote: 'And the list keeps getting longer.',
        image: '/memories/Chapter-4.jpeg',
        alt: 'A portrait of Umraojaan, the person this was made for',
        tilt: 4.5,
      },
    ],
    outro: 'And somehow, that’s still not everything.',
    cta: 'There’s more',
  },

  /* ---------------------------------------------------------------- */
  gift: {
    lines: ['But wait…', 'There’s still one thing left.'],
    prompt: 'Open the gift',
  },

  /* ---------------------------------------------------------------- */
  reveal: {
    greeting: 'Thirty days to go',
    photo: '/memories/bday-box.jpeg',
    photoAlt: 'The little birthday box, opened early',
    photoCaption: 'thirty days early',
    paragraphs: [
      'You know it’s a 30-day countdown to your birthday…',
      'So I tried something new, just to bring a smile to your face.',
      'I hope this little piece of work of mine does exactly that.',
      'May Allah bless you with good health and that goofy smile of yours.',
    ],
    cta: 'One more thing',
  },

  /* ---------------------------------------------------------------- */
  final: {
    question: 'And if I had to choose all over again…',
    answer: 'I’d still choose you.',
    closing: 'Happy almost-birthday, my love.',
    surprise: {
      buttonLabel: 'One last thing…',
      title: 'This part is just for you',
      /* Drop your files into `public/surprise/` and add the paths here. */
      video: '',
      videoPoster: '',
      audio: '',
      photo: '',
      photoAlt: '',
      handwritten: 'I love you. Not loudly, not for show — just completely, and every single day.',
      placeholder: 'Your final surprise will appear here.',
    },
    restart: 'Read it again',
  },

  /* ---------------------------------------------------------------- */
  music: {
    src: '/music/our-song.mp3',
    title: 'Our song',
    volume: 0.42,
    autoplay: true,
  },
};

export default birthdayConfig;

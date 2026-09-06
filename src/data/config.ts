export const gardenConfig = {
  name: 'Umraojaan',
  signature: '— Always yours',
  countdown: 'Sixteen days to go',

  gate: {
    title: 'In Bloom',
    subtitle: 'A garden made for you',
    line: 'Morning light is just beginning to touch the petals.',
    cta: 'Step inside',
  },

  arrival: {
    lines: [
      'Six tulips.',
      'Each one holds a moment.',
      'Each one blooms when you are ready.',
    ],
    cta: 'Walk the path',
  },

  blooms: [
    {
      color: 'coral' as const,
      memory: '/tulips/memory-01.jpeg',
      caption: 'The way you look at the world',
      note: 'This photo — the light was perfect that day.',
    },
    {
      color: 'pink' as const,
      memory: '/tulips/memory-02.jpeg',
      caption: 'Your laughter',
      note: 'I swear I can still hear it.',
    },
    {
      color: 'rose' as const,
      memory: '/tulips/memory-03.jpeg',
      caption: 'The quiet moments',
      note: 'When everything else falls away and it is just us.',
    },
    {
      color: 'blush' as const,
      memory: '/tulips/memory-04.jpeg',
      caption: 'Your favorite place',
      note: 'Every time we go there, it feels like the first time.',
    },
    {
      color: 'peach' as const,
      memory: '/tulips/memory-05.jpeg',
      caption: 'That smile',
      note: 'The one that makes my whole day make sense.',
    },
    {
      color: 'salmon' as const,
      memory: '/tulips/memory-06.jpeg',
      caption: 'Right now',
      note: 'This moment. This feeling. You.',
    },
  ],

  garden: {
    lines: [
      'All six petals open now.',
      'The garden is awake.',
      'And every bloom here knows your name.',
    ],
  },

  message: {
    paragraphs: [
      'Sixteen more days.',
      'I wanted to plant something beautiful for you — something that unfolds at its own pace, like the way you have grown into the person I see now.',
      'Each tulip here is a memory. Each petal is a reason why this countdown feels less like waiting and more like watching something quietly extraordinary take shape.',
      'Thank you for being exactly who you are. For the mornings that feel like poems. For the nights where I forget what worry even means.',
      'This garden is yours. The blooms, the light, the silence between them — all of it, only yours.',
    ],
  },

  sunset: {
    line: 'The light is fading, but the garden remembers.',
    cta: 'Until next week',
  },

  music: {
    src: '/music/week3.mp3',
    volume: 0.45,
    autoplay: true,
  },
};

export type BloomConfig = typeof gardenConfig.blooms[0];

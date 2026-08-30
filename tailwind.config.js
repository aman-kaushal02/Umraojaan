/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* The dark of an empty auditorium — black with a cool green cast. */
        theatre: {
          950: '#050605',
          900: '#0a0c0a',
          800: '#101312',
          700: '#171b19',
          600: '#202523',
        },
        /* Light thrown by the projector lamp. */
        beam: {
          50: '#fffdf6',
          100: '#faf4e6',
          200: '#f3e9d4',
          300: '#e8d8b6',
          400: '#d9c294',
        },
        /* The lamp itself, and everything it warms. */
        lamp: {
          200: '#f7dfb2',
          300: '#efcf95',
          400: '#e3b972',
          500: '#cf9f52',
        },
        /* Projector housing, reel arms, engraved labels. */
        brass: {
          200: '#e7d3ad',
          300: '#d3b581',
          400: '#b98f4e',
          500: '#97723c',
          600: '#6d5330',
        },
        /* The cool glow bouncing off the screen. */
        screenlight: {
          200: '#c2ded9',
          300: '#8fbdb6',
          400: '#5f9791',
          500: '#3f6f6a',
          700: '#1e3d39',
        },
        /* Film base: the amber of old celluloid. */
        celluloid: {
          100: '#eee5d2',
          200: '#dccfb6',
          400: '#a8967a',
          600: '#6b5c47',
        },
      },
      fontFamily: {
        /* Title cards and billing. */
        display: ['"Bodoni Moda"', 'Didot', 'Georgia', 'serif'],
        /* Everything typed: the screenplay, slates, captions. */
        script: ['"Courier Prime"', 'ui-monospace', 'Courier New', 'monospace'],
        /* Engraved small caps. */
        label: ['Cinzel', 'Georgia', 'serif'],
      },
      letterSpacing: {
        slate: '0.3em',
        billing: '0.46em',
      },
      screens: {
        xs: '400px',
        tall: { raw: '(min-height: 760px)' },
        hover: { raw: '(hover: hover) and (pointer: fine)' },
      },
      boxShadow: {
        /* A print resting on a light table. */
        frame:
          '0 1px 1px rgba(0,0,0,0.5), 0 18px 32px -14px rgba(0,0,0,0.85), 0 0 0 1px rgba(216,203,180,0.12)',
        housing:
          'inset 0 1px 0 rgba(247,223,178,0.16), 0 24px 48px -20px rgba(0,0,0,0.9)',
        lamp: '0 0 40px -6px rgba(227,185,114,0.55), 0 0 90px -20px rgba(227,185,114,0.4)',
      },
      transitionTimingFunction: {
        gate: 'cubic-bezier(0.22, 1, 0.36, 1)',
        cut: 'cubic-bezier(0.85, 0, 0.15, 1)',
      },
      keyframes: {
        /* The lamp is never perfectly steady. */
        'gate-flicker': {
          '0%, 100%': { opacity: '1' },
          '12%': { opacity: '0.93' },
          '23%': { opacity: '0.99' },
          '41%': { opacity: '0.9' },
          '52%': { opacity: '1' },
          '73%': { opacity: '0.95' },
          '88%': { opacity: '0.98' },
        },
        /* Film never sits perfectly still in the gate. */
        weave: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '25%': { transform: 'translate3d(-0.6px, 0.4px, 0)' },
          '50%': { transform: 'translate3d(0.5px, -0.5px, 0)' },
          '75%': { transform: 'translate3d(-0.3px, -0.3px, 0)' },
        },
        'reel-spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        /* A scratch in the emulsion, drifting across the print. */
        scratch: {
          '0%': { opacity: '0', transform: 'translateX(0) scaleY(0.7)' },
          '6%': { opacity: '0.5' },
          '14%': { opacity: '0' },
          '100%': { opacity: '0', transform: 'translateX(14vw) scaleY(1)' },
        },
        'sprocket-run': {
          from: { backgroundPosition: '0 0' },
          to: { backgroundPosition: '0 -68px' },
        },
        'beam-breathe': {
          '0%, 100%': { opacity: '0.72', transform: 'scaleX(1)' },
          '50%': { opacity: '0.92', transform: 'scaleX(1.03)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translate3d(0, 14px, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        blink: {
          '0%, 45%': { opacity: '1' },
          '50%, 95%': { opacity: '0.18' },
        },
        'dust-drift': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -10px, 0)' },
        },
      },
      animation: {
        'gate-flicker': 'gate-flicker 4.2s steps(1, end) infinite',
        weave: 'weave 0.9s steps(1, end) infinite',
        'reel-spin': 'reel-spin 3.4s linear infinite',
        'reel-spin-slow': 'reel-spin 9s linear infinite',
        scratch: 'scratch 7s linear infinite',
        'sprocket-run': 'sprocket-run 1.1s linear infinite',
        'beam-breathe': 'beam-breathe 6s ease-in-out infinite',
        'fade-up': 'fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
        blink: 'blink 1.6s steps(1, end) infinite',
        'dust-drift': 'dust-drift 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

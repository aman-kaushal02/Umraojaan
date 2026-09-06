/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* Night soil — the deep ground the garden sits on. */
        loam: {
          950: '#0b0710',
          900: '#130c1b',
          800: '#1c1226',
          700: '#271933',
          600: '#352343',
        },
        /* Petal tones, warm and saturated like real tulip stock. */
        petal: {
          50: '#fff5f7',
          100: '#ffe4ea',
          200: '#ffc6d3',
          300: '#f79bb0',
          400: '#ea6f8c',
          500: '#d64b6d',
          600: '#b33455',
          700: '#8c2440',
        },
        /* Leaf and stem. */
        leaf: {
          200: '#a8cbb0',
          300: '#7aac88',
          400: '#4f8a62',
          500: '#3a6d4a',
          600: '#2b5439',
          700: '#1e3d29',
        },
        /* Low morning sun. */
        sun: {
          100: '#fff2dd',
          200: '#ffe0b8',
          300: '#ffc987',
          400: '#f5a95c',
        },
        /* Paper and ink for cards and captions. */
        paper: {
          50: '#fffdfa',
          100: '#fdf8f1',
          200: '#f4ece0',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        label: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        label: '0.22em',
        wide2: '0.34em',
      },
      screens: {
        xs: '400px',
        tall: { raw: '(min-height: 760px)' },
        hover: { raw: '(hover: hover) and (pointer: fine)' },
      },
      boxShadow: {
        /* A print resting on a mat, lit from above. */
        plate:
          '0 1px 0 rgba(255,255,255,0.28) inset, 0 30px 60px -28px rgba(11,7,16,0.9), 0 2px 10px -4px rgba(11,7,16,0.6)',
        bloom: '0 0 60px -12px rgba(234,111,140,0.5), 0 0 140px -40px rgba(234,111,140,0.35)',
        rim: '0 0 0 1px rgba(255,255,255,0.14), 0 0 0 4px rgba(255,255,255,0.04)',
      },
      transitionTimingFunction: {
        silk: 'cubic-bezier(0.16, 1, 0.3, 1)',
        swift: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'sway-slow': {
          '0%, 100%': { transform: 'rotate(-1.1deg)' },
          '50%': { transform: 'rotate(1.1deg)' },
        },
        'drift-mesh': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '33%': { transform: 'translate3d(3%, -2%, 0) scale(1.06)' },
          '66%': { transform: 'translate3d(-2%, 2%, 0) scale(1.03)' },
        },
        'glow-soft': {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '0.85' },
        },
        'rail-fill': {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
      },
      animation: {
        'sway-slow': 'sway-slow 7s ease-in-out infinite',
        'drift-mesh': 'drift-mesh 26s ease-in-out infinite',
        'glow-soft': 'glow-soft 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

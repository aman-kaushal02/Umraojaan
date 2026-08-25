/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* Warm paper & candlelight */
        ivory: {
          50: '#fffdf9',
          100: '#fbf5ec',
          200: '#f5ead9',
          300: '#ecdcc4',
          400: '#dec5a6',
        },
        blush: {
          100: '#fbeef0',
          200: '#f6dbe0',
          300: '#eebfc8',
          400: '#e2a0ad',
          500: '#d2818f',
        },
        rose: {
          400: '#c4737f',
          500: '#ad5b6b',
          600: '#8f4557',
        },
        burgundy: {
          500: '#7a1130',
          600: '#651028',
          700: '#4d0c20',
          800: '#360817',
          900: '#22050f',
        },
        champagne: {
          200: '#f7e7c9',
          300: '#eed6a9',
          400: '#e0be86',
          500: '#c9a367',
        },
        ink: {
          700: '#1b1020',
          800: '#150b18',
          900: '#0d0611',
          950: '#070409',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'Cambria', 'serif'],
        sans: ['Jost', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        script: ['Parisienne', '"Cormorant Garamond"', 'cursive'],
      },
      letterSpacing: {
        widest: '0.24em',
        cinematic: '0.42em',
      },
      screens: {
        xs: '400px',
        tall: { raw: '(min-height: 760px)' },
        'no-hover': { raw: '(hover: none)' },
        hover: { raw: '(hover: hover) and (pointer: fine)' },
      },
      boxShadow: {
        paper:
          '0 1px 1px rgba(34, 5, 15, 0.16), 0 12px 24px -10px rgba(34, 5, 15, 0.42), 0 40px 80px -40px rgba(0, 0, 0, 0.6)',
        envelope:
          '0 2px 2px rgba(0,0,0,0.14), 0 26px 50px -18px rgba(0, 0, 0, 0.65), 0 60px 120px -60px rgba(210, 129, 143, 0.35)',
        glow: '0 0 0 1px rgba(224, 190, 134, 0.35), 0 0 34px -6px rgba(224, 190, 134, 0.5)',
      },
      transitionTimingFunction: {
        silk: 'cubic-bezier(0.22, 1, 0.36, 1)',
        drape: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translate3d(0, 14px, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.06)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) rotate(0deg)' },
          '50%': { transform: 'translate3d(0, -12px, 0) rotate(0.4deg)' },
        },
        'drift-slow': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) rotate(-0.35deg)' },
          '50%': { transform: 'translate3d(0, -9px, 0) rotate(0.35deg)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(120%)' },
        },
        'pulse-ring': {
          '0%': { opacity: '0.5', transform: 'scale(0.9)' },
          '80%, 100%': { opacity: '0', transform: 'scale(1.5)' },
        },
        'candle-flicker': {
          '0%, 100%': { opacity: '0.85' },
          '25%': { opacity: '0.62' },
          '48%': { opacity: '1' },
          '70%': { opacity: '0.72' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 1.2s ease-out both',
        breathe: 'breathe 5.5s ease-in-out infinite',
        drift: 'drift 7s ease-in-out infinite',
        'drift-slow': 'drift-slow 11s ease-in-out infinite',
        shimmer: 'shimmer 2.8s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2.6s cubic-bezier(0.22, 1, 0.36, 1) infinite',
        'candle-flicker': 'candle-flicker 4.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

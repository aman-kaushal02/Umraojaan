import { motion } from 'framer-motion';
import { AnimatedText } from '../components/AnimatedText';
import { CtaButton } from '../components/CtaButton';
import { gardenConfig } from '../data/config';
import { EASE_ENTRANCE } from '../animations/motion';

interface GateSceneProps {
  onEnter: () => void;
}

export function GateScene({ onEnter }: GateSceneProps) {
  return (
    <div
      className="relative w-full flex flex-col items-center justify-center px-6 py-16 text-center"
      style={{
        minHeight: 'var(--app-height, 100vh)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 7rem)',
      }}
    >
      {/* Decorative ornamental gate */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none"
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.06 }}
        transition={{ duration: 3, ease: EASE_ENTRANCE }}
      >
        <svg
          viewBox="0 0 300 400"
          className="w-full max-w-md h-auto"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="0.5"
        >
          {/* Ornate gate arch */}
          <path
            d="M 60 350 L 60 120 Q 60 60 100 60 L 150 60 Q 150 20 150 20 Q 150 20 150 60 L 200 60 Q 240 60 240 120 L 240 350"
            fill="none"
            strokeWidth="2"
          />
          {/* Decorative flourishes */}
          <circle cx="150" cy="20" r="8" opacity="0.6" />
          <path d="M 100 150 Q 150 140 200 150" fill="none" strokeWidth="1" opacity="0.5" />
          <path d="M 100 200 Q 150 190 200 200" fill="none" strokeWidth="1" opacity="0.5" />
          <path d="M 100 250 Q 150 240 200 250" fill="none" strokeWidth="1" opacity="0.5" />
          {/* Vertical bars */}
          {[110, 135, 165, 190, 215].map((x, i) => (
            <rect key={i} x={x} y="100" width="2" height="250" opacity="0.4" />
          ))}
        </svg>
      </motion.div>

      <div className="relative z-10 space-y-10 max-w-2xl">
        {/* Title with luxury entrance */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.6, delay: 0.3, ease: EASE_ENTRANCE }}
        >
          <h1 className="text-luxury mb-6 tracking-tight">
            {gardenConfig.gate.title}
          </h1>
          <p className="text-2xl text-white/80 font-light tracking-wide">
            {gardenConfig.gate.subtitle}
          </p>
        </motion.div>

        {/* Countdown badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.8, ease: EASE_ENTRANCE }}
          className="inline-block"
        >
          <div className="luxury-card px-10 py-5 glow-breathe">
            <p className="text-lg font-medium tracking-widest uppercase text-white/95">
              {gardenConfig.countdown}
            </p>
          </div>
        </motion.div>

        {/* Description with staggered reveal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 1.2 }}
          className="max-w-xl mx-auto"
        >
          <AnimatedText
            text={gardenConfig.gate.line}
            className="text-xl text-white/75 leading-relaxed"
            staggerDelay={0.025}
            aria-label={gardenConfig.gate.line}
          />
        </motion.div>

        {/* Gold divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.6, ease: EASE_ENTRANCE }}
          className="gold-divider w-48 mx-auto"
        />

        {/* CTA with delayed entrance */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2, ease: EASE_ENTRANCE }}
        >
          <CtaButton onClick={onEnter} variant="primary">
            {gardenConfig.gate.cta}
          </CtaButton>
        </motion.div>
      </div>

      {/* Accessibility */}
      <div role="status" aria-live="polite" className="sr-only">
        Welcome to {gardenConfig.gate.title}. {gardenConfig.countdown}.
      </div>
    </div>
  );
}

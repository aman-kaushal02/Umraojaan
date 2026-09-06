import { motion } from 'framer-motion';
import { AnimatedText } from '../components/AnimatedText';
import { CtaButton } from '../components/CtaButton';
import { gardenConfig } from '../data/config';

interface GateSceneProps {
  onEnter: () => void;
}

export function GateScene({ onEnter }: GateSceneProps) {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 text-center">
      {/* Decorative gate silhouette */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center opacity-10"
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{ duration: 2, ease: 'easeOut' }}
      >
        <svg
          viewBox="0 0 200 300"
          className="w-64 h-96"
          fill="currentColor"
        >
          {/* Gate arch */}
          <path d="M 40 250 L 40 80 Q 40 40 70 40 L 100 40 Q 100 10 100 10 Q 100 10 100 40 L 130 40 Q 160 40 160 80 L 160 250 L 140 250 L 140 80 Q 140 60 120 60 L 80 60 Q 60 60 60 80 L 60 250 Z" />
          {/* Gate bars */}
          <rect x="70" y="80" width="4" height="170" />
          <rect x="90" y="80" width="4" height="170" />
          <rect x="110" y="80" width="4" height="170" />
          <rect x="126" y="80" width="4" height="170" />
        </svg>
      </motion.div>

      <div className="relative z-10 space-y-8 max-w-md">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <h1 className="text-5xl font-serif text-white mb-2 tracking-wide">
            {gardenConfig.gate.title}
          </h1>
          <p className="text-lg text-white/80 font-light">
            {gardenConfig.gate.subtitle}
          </p>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="inline-block bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20"
        >
          <p className="text-white text-sm font-medium tracking-wider uppercase">
            {gardenConfig.countdown}
          </p>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
        >
          <AnimatedText
            text={gardenConfig.gate.line}
            className="text-white/90 text-base leading-relaxed"
            staggerDelay={0.02}
            aria-label={gardenConfig.gate.line}
          />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <CtaButton onClick={onEnter} variant="primary">
            {gardenConfig.gate.cta}
          </CtaButton>
        </motion.div>
      </div>

      {/* Accessibility */}
      <div role="status" aria-live="polite" className="sr-only">
        Welcome to In Bloom. {gardenConfig.countdown}.
      </div>
    </div>
  );
}

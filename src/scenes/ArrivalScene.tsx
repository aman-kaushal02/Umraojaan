import { motion } from 'framer-motion';
import { AnimatedText } from '../components/AnimatedText';
import { CtaButton } from '../components/CtaButton';
import { TulipBud } from '../components/TulipBud';
import { gardenConfig } from '../data/config';
import { staggerContainer, EASE_ENTRANCE } from '../animations/motion';

interface ArrivalSceneProps {
  onContinue: () => void;
}

export function ArrivalScene({ onContinue }: ArrivalSceneProps) {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 text-center">
      {/* Decorative closed buds in background grid */}
      <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none overflow-hidden">
        <motion.div
          className="grid grid-cols-3 gap-20"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {gardenConfig.blooms.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.6, y: 40 }}
              animate={{ opacity: 0.4, scale: 1, y: 0 }}
              transition={{ duration: 1.2, delay: i * 0.15, ease: EASE_ENTRANCE }}
            >
              <TulipBud color={b.color} isBloom={false} size="small" />
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="relative z-10 space-y-12 max-w-3xl">
        {/* Lines with sophisticated staging */}
        <div className="space-y-8">
          {gardenConfig.arrival.lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4, delay: 0.5 + i * 0.6, ease: EASE_ENTRANCE }}
            >
              <AnimatedText
                text={line}
                className="text-3xl md:text-4xl font-light text-white text-luxury leading-snug"
                staggerDelay={0.03}
                aria-label={line}
              />
            </motion.div>
          ))}
        </div>

        {/* Ornamental break */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.4, delay: 2.5, ease: EASE_ENTRANCE }}
          className="flex items-center justify-center gap-4 py-6"
        >
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-white/40" />
          <div className="w-2 h-2 rounded-full bg-white/60 glow-breathe" />
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-white/40" />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 3, ease: EASE_ENTRANCE }}
        >
          <CtaButton onClick={onContinue} variant="primary">
            {gardenConfig.arrival.cta}
          </CtaButton>
        </motion.div>
      </div>

      {/* Accessibility */}
      <div role="status" aria-live="polite" className="sr-only">
        Arriving at the garden. Six tulips await.
      </div>
    </div>
  );
}

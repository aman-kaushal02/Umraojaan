import { motion } from 'framer-motion';
import { AnimatedText } from '../components/AnimatedText';
import { CtaButton } from '../components/CtaButton';
import { TulipBud } from '../components/TulipBud';
import { gardenConfig } from '../data/config';

interface ArrivalSceneProps {
  onContinue: () => void;
}

export function ArrivalScene({ onContinue }: ArrivalSceneProps) {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 text-center">
      {/* Decorative closed buds in background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <div className="grid grid-cols-3 gap-12">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 0.3, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 * i }}
            >
              <TulipBud
                color={gardenConfig.blooms[i].color}
                isBloom={false}
                size="small"
              />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative z-10 space-y-10 max-w-lg">
        {/* Lines */}
        <div className="space-y-4">
          {gardenConfig.arrival.lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 + i * 0.4 }}
            >
              <AnimatedText
                text={line}
                className="text-white text-xl font-light leading-relaxed"
                staggerDelay={0.025}
                aria-label={line}
              />
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
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

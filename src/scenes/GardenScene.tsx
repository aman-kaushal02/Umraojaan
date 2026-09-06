import { motion } from 'framer-motion';
import { TulipBud } from '../components/TulipBud';
import { AnimatedText } from '../components/AnimatedText';
import { CtaButton } from '../components/CtaButton';
import { gardenConfig } from '../data/config';
import { cardVariants, staggerContainer, EASE_ENTRANCE } from '../animations/motion';

interface GardenSceneProps {
  onContinue: () => void;
}

export function GardenScene({ onContinue }: GardenSceneProps) {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 py-16">
      {/* Full garden of bloomed tulips — arranged in elegant arc */}
      <div className="absolute inset-0 flex items-end justify-center pb-24 pointer-events-none overflow-hidden">
        <motion.div
          className="flex gap-6 items-end"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {gardenConfig.blooms.map((bloom, i) => {
            // Create gentle arc arrangement
            const middleIndex = (gardenConfig.blooms.length - 1) / 2;
            const distanceFromMiddle = Math.abs(i - middleIndex);
            const yOffset = distanceFromMiddle * 20;
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 60 + yOffset, scale: 0.7 }}
                animate={{ opacity: 1, y: yOffset, scale: 1 }}
                transition={{
                  duration: 1.4,
                  delay: i * 0.2,
                  ease: EASE_ENTRANCE,
                }}
              >
                <TulipBud
                  color={bloom.color}
                  isBloom={true}
                  size={i === Math.floor(middleIndex) ? 'medium' : 'small'}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Message card */}
      <motion.div
        className="relative z-10 max-w-2xl w-full"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 1.5 }}
      >
        <div className="luxury-card p-10 md:p-12 space-y-8">
          {/* Garden arrival lines */}
          <div className="space-y-6">
            {gardenConfig.garden.lines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 2 + i * 0.4, ease: EASE_ENTRANCE }}
              >
                <AnimatedText
                  text={line}
                  className="text-2xl md:text-3xl font-light text-white text-center text-luxury leading-relaxed"
                  staggerDelay={0.025}
                  aria-label={line}
                />
              </motion.div>
            ))}
          </div>

          {/* Ornamental divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 3.5 }}
            className="gold-divider mx-auto w-32"
          />

          {/* Message paragraphs */}
          <motion.div
            className="space-y-5 text-white/80 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 4 }}
          >
            {gardenConfig.message.paragraphs.map((para, i) => (
              <p
                key={i}
                className={`text-base md:text-lg ${i === 0 ? 'font-medium text-white/95' : ''}`}
              >
                {para}
              </p>
            ))}

            <p className="text-right italic text-white/70 mt-8 text-lg">
              {gardenConfig.signature}
            </p>
          </motion.div>

          {/* Continue button */}
          <motion.div
            className="pt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 5 }}
          >
            <CtaButton onClick={onContinue} variant="secondary">
              Continue
            </CtaButton>
          </motion.div>
        </div>
      </motion.div>

      {/* Accessibility */}
      <div role="status" aria-live="polite" className="sr-only">
        All tulips have bloomed. Reading the garden message.
      </div>
    </div>
  );
}

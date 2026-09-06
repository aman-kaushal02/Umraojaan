import { motion } from 'framer-motion';
import { TulipBud } from '../components/TulipBud';
import { AnimatedText } from '../components/AnimatedText';
import { CtaButton } from '../components/CtaButton';
import { gardenConfig } from '../data/config';

interface GardenSceneProps {
  onContinue: () => void;
}

export function GardenScene({ onContinue }: GardenSceneProps) {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Full garden of bloomed tulips */}
      <div className="absolute inset-0 flex items-end justify-center pb-20 pointer-events-none">
        <div className="flex gap-4 items-end">
          {gardenConfig.blooms.map((bloom, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 1,
                delay: i * 0.15,
                ease: 'easeOut',
              }}
            >
              <TulipBud
                color={bloom.color}
                isBloom={true}
                size={i % 2 === 0 ? 'medium' : 'small'}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Message card */}
      <motion.div
        className="relative z-10 max-w-lg w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border-2 border-white/50"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.2, ease: 'easeOut' }}
      >
        {/* Garden lines */}
        <div className="space-y-4 mb-8">
          {gardenConfig.garden.lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.5 + i * 0.3 }}
            >
              <AnimatedText
                text={line}
                className="text-gray-800 text-lg font-serif leading-relaxed text-center"
                staggerDelay={0.02}
                aria-label={line}
              />
            </motion.div>
          ))}
        </div>

        {/* Message paragraphs */}
        <motion.div
          className="space-y-4 text-gray-700 text-sm leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.5 }}
        >
          {gardenConfig.message.paragraphs.map((para, i) => (
            <p key={i} className={i === 0 ? 'font-medium' : ''}>
              {para}
            </p>
          ))}

          <p className="text-right italic text-gray-600 mt-6">
            {gardenConfig.signature}
          </p>
        </motion.div>

        {/* Continue button */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 3 }}
        >
          <CtaButton onClick={onContinue} variant="secondary">
            Continue
          </CtaButton>
        </motion.div>
      </motion.div>

      {/* Accessibility */}
      <div role="status" aria-live="polite" className="sr-only">
        All tulips have bloomed. Reading the garden message.
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TulipBud } from '../components/TulipBud';
import { SafeImage } from '../components/SafeImage';
import { AnimatedText } from '../components/AnimatedText';
import { ScrollCue } from '../components/ScrollCue';
import type { BloomConfig } from '../data/config';

interface BloomSceneProps {
  bloom: BloomConfig;
  bloomIndex: number;
  onComplete: () => void;
}

export function BloomScene({ bloom, bloomIndex, onComplete }: BloomSceneProps) {
  const [hasBloom, setHasBloom] = useState(false);
  const [showMemory, setShowMemory] = useState(false);

  const handleBloomStart = () => {
    setHasBloom(true);
  };

  const handleBloomComplete = () => {
    setTimeout(() => setShowMemory(true), 300);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center gap-12 max-w-md w-full">
        {/* Tulip bud that blooms on mount */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          onAnimationComplete={handleBloomStart}
        >
          <TulipBud
            color={bloom.color}
            isBloom={hasBloom}
            onBloomComplete={handleBloomComplete}
            size="large"
          />
        </motion.div>

        {/* Memory photo revealed after bloom */}
        {showMemory && (
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-4 border-2 border-white/50">
              {/* Photo */}
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl">
                <SafeImage
                  src={bloom.memory}
                  alt={bloom.caption}
                  className="w-full h-full object-cover"
                />
                {/* Vignette */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-transparent via-transparent to-black/20" />
              </div>

              {/* Caption */}
              <motion.div
                className="mt-4 text-center space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <AnimatedText
                  text={bloom.caption}
                  className="text-xl font-serif text-gray-800"
                  staggerDelay={0.03}
                  aria-label={bloom.caption}
                />
                <p className="text-sm text-gray-600 leading-relaxed px-2">
                  {bloom.note}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Scroll cue appears after memory is shown */}
      {showMemory && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ScrollCue onClick={onComplete} label="Continue" />
        </div>
      )}

      {/* Accessibility announcement */}
      <div role="status" aria-live="polite" className="sr-only">
        {hasBloom && `Bloom ${bloomIndex + 1}: ${bloom.caption}`}
      </div>
    </div>
  );
}

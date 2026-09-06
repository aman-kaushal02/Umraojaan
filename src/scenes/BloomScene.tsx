import { useState } from 'react';
import { motion } from 'framer-motion';
import { TulipBud } from '../components/TulipBud';
import { SafeImage } from '../components/SafeImage';
import { AnimatedText } from '../components/AnimatedText';
import { ScrollCue } from '../components/ScrollCue';
import { cardVariants, EASE_ENTRANCE } from '../animations/motion';
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
    setTimeout(() => setShowMemory(true), 400);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 py-16">
      {/* Ambient number indicator */}
      <motion.div
        className="absolute top-12 left-1/2 -translate-x-1/2 text-9xl font-light text-white/[0.03] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
      >
        {bloomIndex + 1}
      </motion.div>

      <div className="flex flex-col items-center gap-16 max-w-2xl w-full perspective-1000">
        {/* Tulip bud that blooms on mount */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0, rotateX: 20 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          transition={{ duration: 1.4, delay: 0.2, ease: EASE_ENTRANCE }}
          onAnimationComplete={handleBloomStart}
          className="preserve-3d"
        >
          <TulipBud
            color={bloom.color}
            isBloom={hasBloom}
            onBloomComplete={handleBloomComplete}
            size="large"
            delay={0.3}
          />
        </motion.div>

        {/* Memory card revealed after bloom */}
        {showMemory && (
          <motion.div
            className="w-full max-w-md"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="luxury-card p-6 space-y-6 shimmer">
              {/* Photo */}
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-2xl">
                <SafeImage
                  src={bloom.memory}
                  alt={bloom.caption}
                  className="w-full h-full object-cover filter-luxury"
                />
                {/* Photo vignette */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-transparent via-transparent to-black/30" />
                
                {/* Subtle film grain texture */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-[0.03]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E")`,
                  }}
                />
              </div>

              {/* Caption with gold accent */}
              <div className="space-y-4">
                <div className="gold-divider" />
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 1, ease: EASE_ENTRANCE }}
                >
                  <AnimatedText
                    text={bloom.caption}
                    className="text-2xl font-light text-white text-center tracking-wide"
                    staggerDelay={0.04}
                    aria-label={bloom.caption}
                  />
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 1.2 }}
                  className="text-base text-white/70 leading-relaxed text-center px-4"
                >
                  {bloom.note}
                </motion.p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Scroll cue appears after memory is shown */}
      {showMemory && (
        <motion.div
          className="absolute bottom-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
        >
          <ScrollCue onClick={onComplete} label="Continue" />
        </motion.div>
      )}

      {/* Accessibility announcement */}
      <div role="status" aria-live="polite" className="sr-only">
        {hasBloom && `Bloom ${bloomIndex + 1}: ${bloom.caption}`}
      </div>
    </div>
  );
}

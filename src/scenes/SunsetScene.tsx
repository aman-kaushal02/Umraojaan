import { motion } from 'framer-motion';
import { AnimatedText } from '../components/AnimatedText';
import { gardenConfig } from '../data/config';
import { EASE_ENTRANCE } from '../animations/motion';

export function SunsetScene() {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 text-center">
      {/* Floating petals animation — luxury version */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(16)].map((_, i) => {
          const colors = ['#FFB3D9', '#FF6B6B', '#FFC0CB', '#FFDAB9', '#FA8072', '#FFD6E8'];
          const color = colors[i % colors.length];
          const delay = i * 1.2;
          const duration = 12 + Math.random() * 6;
          const startX = Math.random() * 100;
          const amplitude = 40 + Math.random() * 60;

          return (
            <motion.div
              key={i}
              className="absolute rounded-full opacity-30"
              style={{
                width: `${8 + Math.random() * 12}px`,
                height: `${12 + Math.random() * 16}px`,
                background: `radial-gradient(ellipse, ${color}, transparent)`,
                left: `${startX}%`,
                top: '-5%',
                filter: 'blur(1px)',
              }}
              animate={{
                y: ['0vh', '110vh'],
                x: [0, Math.sin(i) * amplitude, Math.sin(i + Math.PI) * amplitude, 0],
                rotate: [0, 180 + i * 30, 360 + i * 60],
                opacity: [0, 0.4, 0.35, 0.25, 0],
              }}
              transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          );
        })}
      </div>

      <div className="relative z-10 space-y-12 max-w-2xl">
        {/* Sunset line */}
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.6, delay: 0.6, ease: EASE_ENTRANCE }}
        >
          <AnimatedText
            text={gardenConfig.sunset.line}
            className="text-3xl md:text-4xl font-light text-white text-luxury leading-snug"
            staggerDelay={0.035}
            aria-label={gardenConfig.sunset.line}
          />
        </motion.div>

        {/* Ornamental separator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.4, delay: 1.8, ease: EASE_ENTRANCE }}
          className="flex items-center justify-center gap-3 py-4"
        >
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-white/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
          <div className="w-12 h-px bg-gradient-to-l from-transparent to-white/30" />
        </motion.div>

        {/* Countdown reminder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.3, delay: 2.2, ease: EASE_ENTRANCE }}
          className="inline-block"
        >
          <div className="glass-panel px-12 py-6 rounded-full glow-breathe">
            <p className="text-xl font-light tracking-widest text-white/95">
              {gardenConfig.countdown}
            </p>
          </div>
        </motion.div>

        {/* Until next week message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 2.8 }}
        >
          <p className="text-white/60 text-sm tracking-[0.3em] uppercase">
            {gardenConfig.sunset.cta}
          </p>
        </motion.div>

        {/* Name dedication */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 3.4, ease: EASE_ENTRANCE }}
          className="pt-8"
        >
          <p className="text-2xl font-light text-white/90 italic tracking-wide">
            For {gardenConfig.name}
          </p>
        </motion.div>
      </div>

      {/* Accessibility */}
      <div role="status" aria-live="polite" className="sr-only">
        Sunset at the garden. {gardenConfig.countdown}. Until next week.
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { AnimatedText } from '../components/AnimatedText';
import { gardenConfig } from '../data/config';

export function SunsetScene() {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 text-center">
      {/* Floating petals animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => {
          const colors = ['#FFB3D9', '#FF6B6B', '#FFC0CB', '#FFDAB9', '#FA8072'];
          const color = colors[i % colors.length];
          const delay = i * 0.8;
          const duration = 8 + Math.random() * 4;
          const startX = Math.random() * 100;

          return (
            <motion.div
              key={i}
              className="absolute w-6 h-8 rounded-full opacity-40"
              style={{
                background: `radial-gradient(ellipse at center, ${color}, transparent)`,
                left: `${startX}%`,
                top: '-10%',
              }}
              animate={{
                y: ['0vh', '110vh'],
                x: [0, Math.sin(i) * 50, 0],
                rotate: [0, 360],
                opacity: [0, 0.6, 0.4, 0],
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

      <div className="relative z-10 space-y-8 max-w-md">
        {/* Sunset line */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <AnimatedText
            text={gardenConfig.sunset.line}
            className="text-white text-2xl font-serif leading-relaxed"
            staggerDelay={0.03}
            aria-label={gardenConfig.sunset.line}
          />
        </motion.div>

        {/* Countdown reminder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="inline-block bg-white/10 backdrop-blur-md px-8 py-4 rounded-full border border-white/30"
        >
          <p className="text-white text-base font-medium tracking-wide">
            {gardenConfig.countdown}
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.8 }}
        >
          <p className="text-white/70 text-sm tracking-wider uppercase">
            {gardenConfig.sunset.cta}
          </p>
        </motion.div>

        {/* Name */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.2 }}
          className="pt-8"
        >
          <p className="text-white/90 text-xl font-serif italic">
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

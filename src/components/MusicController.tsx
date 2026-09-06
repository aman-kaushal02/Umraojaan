import { motion, AnimatePresence } from 'framer-motion';
import { useMusic } from '../hooks/useMusic';

export function MusicController() {
  const { isPlaying, toggle } = useMusic();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <button
          onClick={toggle}
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full 
                     bg-white/20 backdrop-blur-md border border-white/30 shadow-lg
                     hover:bg-white/30 transition-all duration-300"
        >
          {isPlaying ? (
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-white ml-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}

          {/* Pulse indicator when playing */}
          {isPlaying && (
            <span
              aria-hidden="true"
              className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-400 animate-pulse"
            />
          )}
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

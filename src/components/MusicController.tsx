import { AnimatePresence, motion } from 'framer-motion';
import { Music2, Pause, Volume2, VolumeX } from 'lucide-react';
import { EASE_SILK } from '@/animations/motion';
import type { AudioPlayer } from '@/hooks/useAudioPlayer';

interface MusicControllerProps {
  player: AudioPlayer;
  /** Track name, surfaced in the accessible label. */
  title: string;
}

/**
 * A quiet floating control for the soundtrack.
 *
 * Renders nothing at all when no track is configured or the file can't be
 * played, so a missing MP3 leaves no dead button behind.
 */
export function MusicController({ player, title }: MusicControllerProps) {
  const { available, playing, muted, toggle, toggleMute } = player;

  return (
    <AnimatePresence>
      {available && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 14 }}
          transition={{ duration: 0.8, ease: EASE_SILK, delay: 0.4 }}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-50
                     flex items-center gap-1 rounded-full glass-pill p-1"
        >
          <button
            type="button"
            onClick={toggle}
            aria-pressed={playing}
            aria-label={playing ? `Pause ${title}` : `Play ${title}`}
            title={playing ? `Pause ${title}` : `Play ${title}`}
            className="group relative flex h-10 w-10 items-center justify-center rounded-full text-champagne-200/85
                       transition-colors duration-300 hover:text-ivory-50 hover:bg-champagne-300/10"
          >
            {playing ? (
              <Pause className="h-[15px] w-[15px]" strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <Music2 className="h-[15px] w-[15px]" strokeWidth={1.5} aria-hidden="true" />
            )}

            {/* Breathing ring while the track plays */}
            {playing && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full border border-champagne-300/30 animate-pulse-ring motion-reduce:animate-none"
              />
            )}
          </button>

          <span aria-hidden="true" className="h-5 w-px bg-champagne-200/15" />

          <button
            type="button"
            onClick={toggleMute}
            aria-pressed={muted}
            aria-label={muted ? 'Unmute music' : 'Mute music'}
            title={muted ? 'Unmute music' : 'Mute music'}
            className="flex h-10 w-10 items-center justify-center rounded-full text-champagne-200/85
                       transition-colors duration-300 hover:text-ivory-50 hover:bg-champagne-300/10"
          >
            {muted ? (
              <VolumeX className="h-[15px] w-[15px]" strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <Volume2 className="h-[15px] w-[15px]" strokeWidth={1.5} aria-hidden="true" />
            )}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MusicController;

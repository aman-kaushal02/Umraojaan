import { AnimatePresence, motion } from 'framer-motion';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { EASE_GATE } from '@/animations/motion';
import { useMusic } from '@/hooks/useMusic';

interface MusicControllerProps {
  /** Track name, surfaced in the accessible label. */
  title: string;
}

/**
 * The sound head, mounted on the projector housing.
 *
 * Renders nothing at all when no track is configured or the file can't be
 * played, so a missing MP3 leaves no dead button behind.
 */
export function MusicController({ title }: MusicControllerProps) {
  const { available, playing, muted, toggle, toggleMute } = useMusic();

  return (
    <AnimatePresence>
      {available && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 14 }}
          transition={{ duration: 0.8, ease: EASE_GATE, delay: 0.4 }}
          className="housing-pill fixed bottom-[max(2.2rem,calc(env(safe-area-inset-bottom)+1.4rem))]
                     right-[max(1rem,env(safe-area-inset-right))] z-50 flex items-center gap-1 rounded-[3px] p-1"
        >
          <button
            type="button"
            onClick={toggle}
            aria-pressed={playing}
            aria-label={playing ? `Pause ${title}` : `Play ${title}`}
            title={playing ? `Pause ${title}` : `Play ${title}`}
            className="group relative flex h-10 w-10 items-center justify-center rounded-[2px] text-brass-200/85
                       transition-colors duration-300 hover:bg-brass-400/10 hover:text-beam-50"
          >
            {playing ? (
              <Pause className="h-[15px] w-[15px]" strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <Play className="h-[15px] w-[15px]" strokeWidth={1.5} aria-hidden="true" />
            )}

            {/* The lamp indicator, blinking while the sound head runs */}
            {playing && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-[5px] top-[5px] h-1 w-1 rounded-full bg-lamp-300 animate-blink motion-reduce:animate-none"
              />
            )}
          </button>

          <span aria-hidden="true" className="h-5 w-px bg-brass-300/20" />

          <button
            type="button"
            onClick={toggleMute}
            aria-pressed={muted}
            aria-label={muted ? 'Unmute the soundtrack' : 'Mute the soundtrack'}
            title={muted ? 'Unmute the soundtrack' : 'Mute the soundtrack'}
            className="flex h-10 w-10 items-center justify-center rounded-[2px] text-brass-200/85
                       transition-colors duration-300 hover:bg-brass-400/10 hover:text-beam-50"
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

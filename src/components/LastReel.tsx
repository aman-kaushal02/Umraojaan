import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Clapperboard as ClapIcon } from 'lucide-react';
import { EASE_GATE } from '@/animations/motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import CtaButton from './CtaButton';
import SafeImage from './SafeImage';
import type { LastReelConfig } from '@/data/config';

interface LastReelProps {
  config: LastReelConfig;
}

/**
 * What's spliced on after the credits.
 *
 * A slot for whatever the final beat should be — a video, a voice note, one
 * photograph, a typed line, or any combination. Each medium fails
 * independently: a broken video hides itself and the rest still plays. With
 * nothing configured it shows the placeholder copy from the config, so the
 * button always leads somewhere.
 */
export function LastReel({ config }: LastReelProps) {
  const [open, setOpen] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const hasVideo = Boolean(config.video) && !videoFailed;
  const hasAudio = Boolean(config.audio) && !audioFailed;
  const hasPhoto = Boolean(config.photo);
  const hasNote = Boolean(config.note);
  const hasMedia = hasVideo || hasAudio || hasPhoto || hasNote;

  return (
    <div className="flex w-full flex-col items-center">
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.div
            key="trigger"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.7, ease: EASE_GATE }}
          >
            <CtaButton
              variant="housing"
              onClick={() => setOpen(true)}
              icon={<ClapIcon className="h-3.5 w-3.5" strokeWidth={1.6} />}
            >
              {config.buttonLabel}
            </CtaButton>
          </motion.div>
        ) : (
          <motion.section
            key="last-reel"
            aria-label={config.title}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, filter: 'blur(10px)' }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: reducedMotion ? 0.3 : 1.2, ease: EASE_GATE }}
            className="w-full max-w-xl"
          >
            <div className="housing-pill relative overflow-hidden rounded-[3px] p-5 sm:p-7">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-16 -z-10 opacity-70 blur-3xl"
                style={{
                  background:
                    'radial-gradient(circle at 50% 30%, rgba(227,185,114,0.18), transparent 68%)',
                }}
              />

              <p className="slate-label text-center text-brass-300/70">{config.title}</p>
              <span aria-hidden="true" className="brass-rule mx-auto mt-4 w-16" />

              <div className="mt-6 space-y-6">
                {hasVideo && (
                  <video
                    src={config.video}
                    poster={config.videoPoster || undefined}
                    controls
                    playsInline
                    preload="metadata"
                    onError={() => setVideoFailed(true)}
                    className="w-full rounded-[2px] bg-theatre-950 shadow-frame"
                  >
                    Your browser can’t play this video.
                  </video>
                )}

                {hasPhoto && (
                  <div className="celluloid mx-auto w-full max-w-[13rem] rounded-[2px] p-2 shadow-frame">
                    <SafeImage
                      src={config.photo}
                      alt={config.photoAlt || 'One last frame'}
                      className="aspect-[3/4] w-full rounded-[1px] print-warm"
                    />
                  </div>
                )}

                {hasAudio && (
                  <div className="space-y-2">
                    <p className="slug text-center text-brass-300/50">Sound only</p>
                    <audio
                      src={config.audio}
                      controls
                      preload="metadata"
                      onError={() => setAudioFailed(true)}
                      className="w-full"
                    >
                      Your browser can’t play this recording.
                    </audio>
                  </div>
                )}

                {hasNote && (
                  <p className="text-center font-script text-[0.9rem] leading-[1.95] text-beam-100/85 sm:text-[0.98rem]">
                    {config.note}
                  </p>
                )}

                {!hasMedia && (
                  <p className="text-center font-display text-lg italic text-beam-200/60">
                    {config.placeholder}
                  </p>
                )}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LastReel;

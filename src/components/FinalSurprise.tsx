import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { EASE_SILK } from '@/animations/motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import CtaButton from './CtaButton';
import SafeImage from './SafeImage';
import type { FinalSurpriseConfig } from '@/data/config';

interface FinalSurpriseProps {
  config: FinalSurpriseConfig;
}

/**
 * The hidden last page.
 *
 * A slot for whatever you want the final beat to be — a video, a voice note,
 * one photograph, a handwritten line, or any combination. Each medium fails
 * independently: a broken video hides itself and the rest of the note still
 * arrives. With nothing configured, it shows the placeholder copy from the
 * config so the button always leads somewhere.
 */
export function FinalSurprise({ config }: FinalSurpriseProps) {
  const [open, setOpen] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const hasVideo = Boolean(config.video) && !videoFailed;
  const hasAudio = Boolean(config.audio) && !audioFailed;
  const hasPhoto = Boolean(config.photo);
  const hasNote = Boolean(config.handwritten);
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
            transition={{ duration: 0.7, ease: EASE_SILK }}
          >
            <CtaButton
              variant="outline"
              onClick={() => setOpen(true)}
              icon={<Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />}
            >
              {config.buttonLabel}
            </CtaButton>
          </motion.div>
        ) : (
          <motion.section
            key="surprise"
            aria-label={config.title}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 26, filter: 'blur(10px)' }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: reducedMotion ? 0.3 : 1.2, ease: EASE_SILK }}
            className="w-full max-w-xl"
          >
            <div className="relative overflow-hidden rounded-lg glass-pill p-5 sm:p-7">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-16 -z-10 opacity-70 blur-3xl"
                style={{
                  background:
                    'radial-gradient(circle at 50% 30%, rgba(238,191,200,0.20), transparent 68%)',
                }}
              />

              <p className="kicker text-center text-champagne-300/70">{config.title}</p>
              <span aria-hidden="true" className="gold-rule mx-auto mt-4 w-16" />

              <div className="mt-6 space-y-6">
                {hasVideo && (
                  <video
                    src={config.video}
                    poster={config.videoPoster || undefined}
                    controls
                    playsInline
                    preload="metadata"
                    onError={() => setVideoFailed(true)}
                    className="w-full rounded-md bg-ink-950 shadow-paper"
                  >
                    Your browser can’t play this video.
                  </video>
                )}

                {hasPhoto && (
                  <div className="paper mx-auto w-full max-w-xs rounded-[3px] p-3 pb-5 shadow-paper">
                    <SafeImage
                      src={config.photo}
                      alt={config.photoAlt || 'A final photograph'}
                      className="aspect-[4/5] w-full rounded-[2px]"
                    />
                  </div>
                )}

                {hasAudio && (
                  <div className="space-y-2">
                    <p className="text-center font-sans text-[0.6rem] uppercase tracking-[0.24em] text-champagne-200/50">
                      Press play
                    </p>
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
                  <p className="text-center font-script text-[1.6rem] leading-snug text-blush-200 sm:text-[1.9rem]">
                    {config.handwritten}
                  </p>
                )}

                {!hasMedia && (
                  <p className="text-center font-serif text-lg italic text-ivory-100/60">
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

export default FinalSurprise;

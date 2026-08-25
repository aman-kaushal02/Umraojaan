import { useEffect, useState, type ComponentType } from 'react';
import { motion } from 'framer-motion';
import AmbientStage from '@/components/AmbientStage';
import CursorGlow from '@/components/CursorGlow';
import MusicController from '@/components/MusicController';
import ParticleBackground from '@/components/ParticleBackground';
import ProgressTrail from '@/components/ProgressTrail';
import SceneTransition from '@/components/SceneTransition';
import BirthdayReveal from '@/scenes/BirthdayReveal';
import EnvelopeScene from '@/scenes/EnvelopeScene';
import FinalScene from '@/scenes/FinalScene';
import GiftScene from '@/scenes/GiftScene';
import IntroScene from '@/scenes/IntroScene';
import LetterScene from '@/scenes/LetterScene';
import MemoryScene from '@/scenes/MemoryScene';
import { birthdayConfig } from '@/data/config';
import { sceneLabels, type SceneId } from '@/data/scenes';
import { useAppHeight } from '@/hooks/useAppHeight';
import { useExperience } from '@/hooks/useExperience';
import { MusicProvider } from '@/hooks/useMusic';

const SCENES: Record<SceneId, ComponentType> = {
  intro: IntroScene,
  envelope: EnvelopeScene,
  letter: LetterScene,
  memories: MemoryScene,
  gift: GiftScene,
  reveal: BirthdayReveal,
  finale: FinalScene,
};

/**
 * The stage manager.
 *
 * Owns the persistent layers — lighting, particles, cursor light, music, the
 * chapter ribbon — and swaps one scene at a time through the transition.
 * Nothing here knows anything personal; all of that lives in `data/config.ts`.
 */
export function App() {
  const { scene } = useExperience();
  const [booted, setBooted] = useState(false);

  useAppHeight();

  /* Lift the curtain one frame after mount, so fonts and layout settle first. */
  useEffect(() => {
    const id = window.setTimeout(() => setBooted(true), 60);
    return () => window.clearTimeout(id);
  }, []);

  const Scene = SCENES[scene];

  return (
    <div className="relative min-h-[var(--app-height)] w-full overflow-x-hidden">
      <AmbientStage />
      <ParticleBackground />
      <CursorGlow />

      <MusicProvider>
        <SceneTransition>
          <Scene />
        </SceneTransition>

        <MusicController title={birthdayConfig.music.title} />
      </MusicProvider>

      <ProgressTrail />

      {/* Announce each chapter to assistive tech without showing anything. */}
      <p aria-live="polite" className="sr-only">
        {sceneLabels[scene]}
      </p>

      {/* Opening curtain */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[80] bg-ink-950"
        initial={{ opacity: 1 }}
        animate={{ opacity: booted ? 0 : 1 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

export default App;

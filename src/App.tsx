import { useEffect, useState, type ComponentType } from 'react';
import { motion } from 'framer-motion';
import CursorGlow from '@/components/CursorGlow';
import DustMotes from '@/components/DustMotes';
import FrameCounter from '@/components/FrameCounter';
import MusicController from '@/components/MusicController';
import SceneTransition from '@/components/SceneTransition';
import TheatreStage from '@/components/TheatreStage';
import EndScene from '@/scenes/EndScene';
import PremiereScene from '@/scenes/PremiereScene';
import ProjectorScene from '@/scenes/ProjectorScene';
import ReelScene from '@/scenes/ReelScene';
import ScreeningScene from '@/scenes/ScreeningScene';
import SlateScene from '@/scenes/SlateScene';
import TitlesScene from '@/scenes/TitlesScene';
import { reelConfig } from '@/data/config';
import { sceneLabels, type SceneId } from '@/data/scenes';
import { useAppHeight } from '@/hooks/useAppHeight';
import { useExperience } from '@/hooks/useExperience';
import { MusicProvider } from '@/hooks/useMusic';

const SCENES: Record<SceneId, ComponentType> = {
  projector: ProjectorScene,
  reel: ReelScene,
  titles: TitlesScene,
  screening: ScreeningScene,
  slate: SlateScene,
  premiere: PremiereScene,
  end: EndScene,
};

/**
 * The projection booth.
 *
 * Owns the persistent layers — the auditorium, the dust in the beam, the cursor
 * light, the sound head, the frame counter — and runs one scene at a time
 * through the transition. Nothing here knows anything personal; all of that
 * lives in `data/config.ts`.
 */
export function App() {
  const { scene } = useExperience();
  const [booted, setBooted] = useState(false);

  useAppHeight();

  /* Strike the lamp one frame after mount, so fonts and layout settle first. */
  useEffect(() => {
    const id = window.setTimeout(() => setBooted(true), 60);
    return () => window.clearTimeout(id);
  }, []);

  const Scene = SCENES[scene];

  return (
    <div className="relative min-h-[var(--app-height)] w-full overflow-x-hidden">
      <TheatreStage />
      <DustMotes />
      <CursorGlow />

      <MusicProvider>
        <SceneTransition>
          <Scene />
        </SceneTransition>

        <MusicController title={reelConfig.music.title} />
      </MusicProvider>

      <FrameCounter />

      {/* Announce each scene to assistive tech without showing anything. */}
      <p aria-live="polite" className="sr-only">
        {sceneLabels[scene]}
      </p>

      {/* House lights, fading down */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[80] bg-theatre-950"
        initial={{ opacity: 1 }}
        animate={{ opacity: booted ? 0 : 1 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

export default App;

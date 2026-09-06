import { useEffect } from 'react';
import { useExperience } from './hooks/useExperience';
import { useMusic } from './hooks/useMusic';
import { useAppHeight } from './hooks/useAppHeight';
import { GardenStage } from './components/GardenStage';
import { SceneTransition } from './components/SceneTransition';
import { MusicController } from './components/MusicController';
import { CursorGlow } from './components/CursorGlow';
import { Grain } from './components/Grain';
import { ProgressRail } from './components/ProgressRail';
import { getLighting, scenes } from './data/scenes';
import { gardenConfig } from './data/config';

import { GateScene } from './scenes/GateScene';
import { ArrivalScene } from './scenes/ArrivalScene';
import { BloomScene } from './scenes/BloomScene';
import { GardenScene } from './scenes/GardenScene';
import { SunsetScene } from './scenes/SunsetScene';

/** bloom1…bloom6 → 0…5, so one scene component serves all six. */
const BLOOM_INDEX: Record<string, number> = {
  bloom1: 0,
  bloom2: 1,
  bloom3: 2,
  bloom4: 3,
  bloom5: 4,
  bloom6: 5,
};

export default function App() {
  useAppHeight();
  const { currentScene, nextScene } = useExperience();
  const { playMusic } = useMusic();

  /* Try the soundtrack as soon as the file is ready. If the browser refuses,
     useMusic keeps listening for her first completed gesture. */
  useEffect(() => {
    playMusic();
  }, [playMusic]);

  const lighting = getLighting(currentScene);
  const index = scenes.findIndex((s) => s.id === currentScene);
  const progress = index / (scenes.length - 1);

  /* The opening and closing scenes stay still; the rest get full atmosphere. */
  const quiet = currentScene === 'gate' || currentScene === 'sunset';

  const bloomIndex = BLOOM_INDEX[currentScene];
  const totalBlooms = gardenConfig.blooms.length;

  return (
    <>
      <ProgressRail progress={progress} ticks={scenes.length - 1} />

      <GardenStage lighting={lighting} quiet={quiet}>
        <SceneTransition sceneKey={currentScene}>
          {currentScene === 'gate' && <GateScene onEnter={nextScene} />}
          {currentScene === 'arrival' && <ArrivalScene onContinue={nextScene} />}

          {bloomIndex !== undefined && (
            <BloomScene
              bloom={gardenConfig.blooms[bloomIndex]}
              index={bloomIndex}
              total={totalBlooms}
              onComplete={nextScene}
            />
          )}

          {currentScene === 'garden' && <GardenScene onContinue={nextScene} />}
          {currentScene === 'sunset' && <SunsetScene />}
        </SceneTransition>
      </GardenStage>

      <Grain />
      <MusicController />
      <CursorGlow />
    </>
  );
}

import { useEffect } from 'react';
import { useExperience } from './hooks/useExperience';
import { useMusic } from './hooks/useMusic';
import { useAppHeight } from './hooks/useAppHeight';
import { GardenStage } from './components/GardenStage';
import { SceneTransition } from './components/SceneTransition';
import { MusicController } from './components/MusicController';
import { CursorGlow } from './components/CursorGlow';
import { getLighting } from './data/scenes';
import { gardenConfig } from './data/config';

// Scenes
import { GateScene } from './scenes/GateScene';
import { ArrivalScene } from './scenes/ArrivalScene';
import { BloomScene } from './scenes/BloomScene';
import { GardenScene } from './scenes/GardenScene';
import { SunsetScene } from './scenes/SunsetScene';

export default function App() {
  useAppHeight();
  const { currentScene, nextScene } = useExperience();
  const { playMusic } = useMusic();

  // Attempt autoplay when ready, fallback handled by useMusic
  useEffect(() => {
    playMusic();
  }, [playMusic]);

  const lighting = getLighting(currentScene);
  const showParticles = currentScene !== 'gate' && currentScene !== 'sunset';

  return (
    <>
      <GardenStage lighting={lighting} showParticles={showParticles}>
        <SceneTransition sceneKey={currentScene}>
          {currentScene === 'gate' && <GateScene onEnter={nextScene} />}
          {currentScene === 'arrival' && <ArrivalScene onContinue={nextScene} />}
          {currentScene === 'bloom1' && (
            <BloomScene bloom={gardenConfig.blooms[0]} bloomIndex={0} onComplete={nextScene} />
          )}
          {currentScene === 'bloom2' && (
            <BloomScene bloom={gardenConfig.blooms[1]} bloomIndex={1} onComplete={nextScene} />
          )}
          {currentScene === 'bloom3' && (
            <BloomScene bloom={gardenConfig.blooms[2]} bloomIndex={2} onComplete={nextScene} />
          )}
          {currentScene === 'bloom4' && (
            <BloomScene bloom={gardenConfig.blooms[3]} bloomIndex={3} onComplete={nextScene} />
          )}
          {currentScene === 'bloom5' && (
            <BloomScene bloom={gardenConfig.blooms[4]} bloomIndex={4} onComplete={nextScene} />
          )}
          {currentScene === 'bloom6' && (
            <BloomScene bloom={gardenConfig.blooms[5]} bloomIndex={5} onComplete={nextScene} />
          )}
          {currentScene === 'garden' && <GardenScene onContinue={nextScene} />}
          {currentScene === 'sunset' && <SunsetScene />}
        </SceneTransition>
      </GardenStage>

      <MusicController />
      <CursorGlow />
    </>
  );
}

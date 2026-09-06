import { useState, useRef, useCallback } from 'react';
import type { SceneId } from '../data/scenes';
import { getNextScene } from '../data/scenes';

interface UseExperienceReturn {
  currentScene: SceneId;
  goToScene: (scene: SceneId) => void;
  nextScene: () => void;
}

export function useExperience(): UseExperienceReturn {
  const [currentScene, setCurrentScene] = useState<SceneId>('gate');
  const transitionGuard = useRef(false);

  const goToScene = useCallback((scene: SceneId) => {
    setCurrentScene(scene);
  }, []);

  const nextScene = useCallback(() => {
    if (transitionGuard.current) return;

    transitionGuard.current = true;
    setTimeout(() => {
      transitionGuard.current = false;
    }, 600);

    setCurrentScene((current) => {
      const next = getNextScene(current);
      return next ?? current;
    });
  }, []);

  return {
    currentScene,
    goToScene,
    nextScene,
  };
}

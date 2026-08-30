import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { SCENE_ORDER, sceneMoods, type SceneId, type SceneMood } from '@/data/scenes';

interface ExperienceValue {
  /** Currently mounted scene. */
  scene: SceneId;
  /** 1 when moving forward through the story, -1 when replaying backwards. */
  direction: 1 | -1;
  /** Ambience for the current scene. */
  mood: SceneMood;
  /** Zero-based index in SCENE_ORDER. */
  index: number;
  /** True once she has tapped/clicked/keyed anything. Gates audio playback. */
  hasInteracted: boolean;
  /** Scenes she has already reached — used by the progress indicator. */
  reached: SceneId[];
  /** Jump to a specific scene. */
  go: (scene: SceneId) => void;
  /** Move to the next scene in the story. */
  advance: () => void;
  /** Return to the very first scene and forget progress. */
  restart: () => void;
  /** Manually flag the first interaction (e.g. from a custom control). */
  registerInteraction: () => void;
}

const ExperienceContext = createContext<ExperienceValue | null>(null);

/** The first scene in the running order, whatever it happens to be called. */
const OPENING = SCENE_ORDER[0];

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [scene, setScene] = useState<SceneId>(OPENING);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [reached, setReached] = useState<SceneId[]>([OPENING]);

  /** Guards against double-fires from rapid taps during a transition. */
  const transitioning = useRef(false);
  /**
   * The current scene, readable synchronously.
   *
   * State updaters passed to `setScene` must stay pure — React double-invokes
   * them in development, so anything with a side effect (flipping the guard
   * above, scheduling a timeout) runs twice and the second pass sees state the
   * first pass created. Keeping the decision out here fixes that.
   */
  const sceneRef = useRef<SceneId>(OPENING);
  sceneRef.current = scene;

  const registerInteraction = useCallback(() => {
    setHasInteracted((prev) => (prev ? prev : true));
  }, []);

  /* The very first gesture anywhere unlocks audio and cursor effects. */
  useEffect(() => {
    if (hasInteracted) return;

    const unlock = () => setHasInteracted(true);
    const opts = { passive: true, once: true } as const;

    window.addEventListener('pointerdown', unlock, opts);
    window.addEventListener('keydown', unlock, opts);
    window.addEventListener('touchstart', unlock, opts);

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, [hasInteracted]);

  /** Opens the transition window, so a second tap can't double-advance. */
  const claim = useCallback(() => {
    if (transitioning.current) return false;
    transitioning.current = true;
    window.setTimeout(() => {
      transitioning.current = false;
    }, 420);
    return true;
  }, []);

  const go = useCallback(
    (next: SceneId) => {
      const current = sceneRef.current;
      if (next === current) return;
      if (!claim()) return;

      setDirection(SCENE_ORDER.indexOf(next) >= SCENE_ORDER.indexOf(current) ? 1 : -1);
      sceneRef.current = next;
      setScene(next);
      setReached((prev) => (prev.includes(next) ? prev : [...prev, next]));
    },
    [claim],
  );

  const advance = useCallback(() => {
    const current = sceneRef.current;
    const nextIndex = Math.min(SCENE_ORDER.indexOf(current) + 1, SCENE_ORDER.length - 1);
    go(SCENE_ORDER[nextIndex]);
  }, [go]);

  const restart = useCallback(() => {
    if (sceneRef.current === OPENING) return;
    if (!claim()) return;

    setDirection(-1);
    setReached([OPENING]);
    sceneRef.current = OPENING;
    setScene(OPENING);
  }, [claim]);

  const mood = sceneMoods[scene];
  const index = SCENE_ORDER.indexOf(scene);

  /* Only the long-form scenes are allowed to own the document scroll. */
  useEffect(() => {
    document.body.dataset.lockScroll = mood.scrolls ? 'false' : 'true';
    document.body.dataset.scene = scene;

    if (!mood.scrolls) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [mood.scrolls, scene]);

  /* New scene, fresh page — start every chapter from the top. */
  useEffect(() => {
    const id = window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), 0);
    return () => window.clearTimeout(id);
  }, [scene]);

  const value = useMemo<ExperienceValue>(
    () => ({
      scene,
      direction,
      mood,
      index,
      hasInteracted,
      reached,
      go,
      advance,
      restart,
      registerInteraction,
    }),
    [scene, direction, mood, index, hasInteracted, reached, go, advance, restart, registerInteraction],
  );

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export function useExperience(): ExperienceValue {
  const ctx = useContext(ExperienceContext);
  if (!ctx) {
    throw new Error('useExperience must be used inside <ExperienceProvider>.');
  }
  return ctx;
}

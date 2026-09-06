export type SceneId =
  | 'gate'
  | 'arrival'
  | 'bloom1'
  | 'bloom2'
  | 'bloom3'
  | 'bloom4'
  | 'bloom5'
  | 'bloom6'
  | 'garden'
  | 'sunset';

export type Lighting = 'dawn' | 'morning' | 'day' | 'afternoon' | 'dusk';

export interface SceneDefinition {
  id: SceneId;
  lighting: Lighting;
  skipScroll?: boolean;
}

export const scenes: SceneDefinition[] = [
  { id: 'gate', lighting: 'dawn', skipScroll: true },
  { id: 'arrival', lighting: 'morning' },
  { id: 'bloom1', lighting: 'morning' },
  { id: 'bloom2', lighting: 'morning' },
  { id: 'bloom3', lighting: 'day' },
  { id: 'bloom4', lighting: 'day' },
  { id: 'bloom5', lighting: 'afternoon' },
  { id: 'bloom6', lighting: 'afternoon' },
  { id: 'garden', lighting: 'dusk' },
  { id: 'sunset', lighting: 'dusk', skipScroll: true },
];

export function getSceneIndex(id: SceneId): number {
  return scenes.findIndex((s) => s.id === id);
}

export function getNextScene(current: SceneId): SceneId | null {
  const idx = getSceneIndex(current);
  return idx >= 0 && idx < scenes.length - 1 ? scenes[idx + 1].id : null;
}

export function getLighting(id: SceneId): Lighting {
  return scenes.find((s) => s.id === id)?.lighting ?? 'day';
}

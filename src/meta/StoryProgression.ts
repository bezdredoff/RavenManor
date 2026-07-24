import type { StorySceneDefinition } from '../data/storyScenes';

export function getStorySceneForLevel(
  scenes: readonly StorySceneDefinition[],
  levelId: number,
): StorySceneDefinition | null {
  return scenes.find((scene) => scene.afterLevelId === levelId) ?? null;
}

export function getNextUnviewedStoryScene(
  scenes: readonly StorySceneDefinition[],
  completedLevels: Readonly<Record<number, boolean>>,
  viewedScenes: Readonly<Record<number, boolean>>,
): StorySceneDefinition | null {
  return [...scenes]
    .sort((left, right) => left.afterLevelId - right.afterLevelId)
    .find((scene) => (
      Boolean(completedLevels[scene.afterLevelId])
      && !viewedScenes[scene.afterLevelId]
    )) ?? null;
}

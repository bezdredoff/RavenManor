import type { RoomDefinition } from '../data/roomTypes';
import type { StorySceneDefinition } from '../data/storyScenes';

export type StoryJournalStatus = 'locked' | 'new' | 'viewed';

export type StoryJournalEntry = Readonly<{
  scene: StorySceneDefinition;
  status: StoryJournalStatus;
}>;

export type StoryJournalGroup = Readonly<{
  room: RoomDefinition;
  entries: readonly StoryJournalEntry[];
  unlockedCount: number;
  viewedCount: number;
}>;

export function getStorySceneForLevel(
  scenes: readonly StorySceneDefinition[],
  levelId: number,
): StorySceneDefinition | null {
  return scenes.find((scene) => scene.afterLevelId === levelId) ?? null;
}

export function getStorySceneStatus(
  scene: StorySceneDefinition,
  completedLevels: Readonly<Record<number, boolean>>,
  viewedScenes: Readonly<Record<number, boolean>>,
): StoryJournalStatus {
  if (!completedLevels[scene.afterLevelId]) return 'locked';
  return viewedScenes[scene.afterLevelId] ? 'viewed' : 'new';
}

export function getNextUnviewedStoryScene(
  scenes: readonly StorySceneDefinition[],
  completedLevels: Readonly<Record<number, boolean>>,
  viewedScenes: Readonly<Record<number, boolean>>,
): StorySceneDefinition | null {
  return [...scenes]
    .sort((left, right) => left.afterLevelId - right.afterLevelId)
    .find((scene) => getStorySceneStatus(scene, completedLevels, viewedScenes) === 'new') ?? null;
}

export function getLatestUnlockedStoryScene(
  scenes: readonly StorySceneDefinition[],
  completedLevels: Readonly<Record<number, boolean>>,
): StorySceneDefinition | null {
  return scenes.reduce<StorySceneDefinition | null>((latest, scene) => {
    if (!completedLevels[scene.afterLevelId]) return latest;
    if (!latest || scene.afterLevelId > latest.afterLevelId) return scene;
    return latest;
  }, null);
}

export function getStoryJournalGroups(
  scenes: readonly StorySceneDefinition[],
  roomDefinitions: readonly RoomDefinition[],
  completedLevels: Readonly<Record<number, boolean>>,
  viewedScenes: Readonly<Record<number, boolean>>,
): readonly StoryJournalGroup[] {
  return roomDefinitions.map((room) => {
    const entries = scenes
      .filter((scene) => scene.roomId === room.id)
      .sort((left, right) => left.afterLevelId - right.afterLevelId)
      .map((scene) => ({
        scene,
        status: getStorySceneStatus(scene, completedLevels, viewedScenes),
      }));

    return {
      room,
      entries,
      unlockedCount: entries.filter((entry) => entry.status !== 'locked').length,
      viewedCount: entries.filter((entry) => entry.status === 'viewed').length,
    };
  }).filter((group) => group.entries.length > 0);
}

export function getStoryJournalProgress(
  scenes: readonly StorySceneDefinition[],
  completedLevels: Readonly<Record<number, boolean>>,
  viewedScenes: Readonly<Record<number, boolean>>,
): Readonly<{ unlocked: number; viewed: number; total: number; newCount: number }> {
  const statuses = scenes.map((scene) => getStorySceneStatus(scene, completedLevels, viewedScenes));
  return {
    unlocked: statuses.filter((status) => status !== 'locked').length,
    viewed: statuses.filter((status) => status === 'viewed').length,
    total: scenes.length,
    newCount: statuses.filter((status) => status === 'new').length,
  };
}
